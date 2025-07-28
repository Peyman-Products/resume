from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
import json

# scoring configuration and candidate data

COLUMNS = [
    'id', 'name', 'mobile', 'gender', 'position_type', 'source_of_news', 'year_of_birth',
    'marital_status', 'education', 'major',
    'years_of_experience',
    'military_status', 'job_status', 'can_start_from', 'available_9_to_6',
    'telegram_id', 'has_portfolio', 'ok_with_task', 'location',
    'technical_experience_notes',
    'exp_dashboard_b2b', 'exp_dynamic_reports', 'exp_role_based_access',
    'exp_pos_mobile', 'exp_data_sync', 'exp_multistep_forms',
    'exp_low_digital_users', 'exp_multilingual', 'exp_portfolio_relevant',
    'exp_grpc', 'exp_microservices', 'exp_unit_testing',
    'exp_figma', 'exp_user_research', 'exp_prototyping',
    'interviewer_score', 'design_score', 'look_score', 'portfolio_score', 'previous_work_score', 'resume_file', 'total_score',
    'status', 'meetings',
    'meeting1_date', 'meeting1_day', 'meeting1_time',
    'meeting2_date', 'meeting2_day', 'meeting2_time',
    'meeting3_date', 'meeting3_day', 'meeting3_time',
    'meeting4_date', 'meeting4_day', 'meeting4_time',
    'meeting5_date', 'meeting5_day', 'meeting5_time'
]

app = Flask(__name__)
CORS(app)

# Path to Excel data file (placed alongside this script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'candidates.xlsx')
# Directory to store uploaded resumes
RESUME_DIR = os.path.join(BASE_DIR, 'resumes')
os.makedirs(RESUME_DIR, exist_ok=True)

# Scoring configuration file per position
SCORING_CONFIG_FILE = os.path.join(BASE_DIR, 'scoring_config.json')

def load_scoring_config():
    if not os.path.exists(SCORING_CONFIG_FILE):
        return {}
    with open(SCORING_CONFIG_FILE, 'r') as f:
        try:
            return json.load(f)
        except Exception:
            return {}

# ensure the Excel file exists with the required columns
def _ensure_file():
    if not os.path.exists(DATA_FILE):
        df = pd.DataFrame(columns=COLUMNS)
        df.to_excel(DATA_FILE, index=False)

def read_data():
    _ensure_file()
    df = pd.read_excel(DATA_FILE)
    # ensure all expected columns exist
    for col in COLUMNS:
        if col not in df.columns:
            df[col] = ''

    # convert any missing values to empty strings
    df = df.fillna('')

    if 'years_of_experience' in df.columns:
        df['years_of_experience'] = (
            pd.to_numeric(df['years_of_experience'], errors='coerce').fillna(0)
        )
    if 'meetings' in df.columns:
        df['meetings'] = df['meetings'].replace('', '[]')
    if 'id' in df.columns:
        df['id'] = pd.to_numeric(df['id'], errors='coerce').fillna(0).astype(int)
    if 'year_of_birth' in df.columns:
        df['year_of_birth'] = df['year_of_birth'].replace('', 1370)
    if 'source_of_news' in df.columns:
        df['source_of_news'] = df['source_of_news'].replace('', 'Jobinja')
    return df

def write_data(df):
    df.to_excel(DATA_FILE, index=False)

def get_next_id():
    df = read_data()
    return int(df['id'].max() + 1) if not df.empty else 1

def _sanitize_filename(name):
    return ''.join(c if c.isalnum() else '_' for c in name)

def save_resume_file(file, full_name):
    """Save uploaded resume file and return stored filename"""
    if not file or file.filename == '':
        return ''
    filename = _sanitize_filename(full_name)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{filename}{ext}"
    path = os.path.join(RESUME_DIR, filename)
    file.save(path)
    return filename

def compute_total_score(row):
    """Compute a candidate's total score based on the scoring config."""
    config = load_scoring_config()
    positions = config.get("positions", {})
    global_cfg = config.get("global", {})

    score = 0

    # position specific experience items
    role = str(row.get("position_type", "")).lower()
    role_cfg = positions.get(role, {})
    experience_cfg = role_cfg.get("experience", {})
    for field, item in experience_cfg.items():
        if str(row.get(field, "")).strip() == "Yes":
            score += float(item.get("points", 0))

    # general mappings such as gender, education etc.
    def map_score(field_name, value):
        mapping = global_cfg.get(field_name, {})
        return mapping.get(str(value).lower().replace(" ", "_"), 0)

    for general_field in [
        "gender",
        "education",
        "military_status",
        "job_status",
    ]:
        score += map_score(general_field, row.get(general_field, ""))

    # start availability
    score += map_score("availability", row.get("can_start_from", ""))

    # additional boolean fields (fixed weights)
    if str(row.get("available_9_to_6", "")).lower() == "yes":
        score += 5
    if str(row.get("has_portfolio", "")).lower() == "yes":
        score += 5
    if str(row.get("ok_with_task", "")).lower() == "yes":
        score += 2

    # reviewer scores
    weights = global_cfg.get(
        "reviewer_weights",
        {
            "interview_score": 1,
            "design_score": 1,
            "look_score": 1,
            "portfolio_score": 1,
            "previous_work_score": 1,
        },
    )
    for field, w in weights.items():
        try:
            score += float(row.get(field, 0)) * float(w)
        except ValueError:
            continue

    # years of experience
    try:
        yrs = float(row.get("years_of_experience", 0))
        score += yrs * float(global_cfg.get("exp_per_year", 5))
    except ValueError:
        pass

    return score

@app.route('/resumes/<path:filename>')
def get_resume(filename):
    return send_from_directory(RESUME_DIR, filename, as_attachment=True)

@app.route('/')
def index():
    df = read_data()
    # compute total score for each candidate
    for idx, row in df.iterrows():
        df.at[idx, 'total_score'] = compute_total_score(row)
    write_data(df)
    df['id'] = df['id'].astype(int)
    return render_template('index.html', candidates=df.to_dict(orient='records'))


@app.route('/admin', strict_slashes=False)
def admin_page():
    """Render admin settings page with current scoring config."""
    config = load_scoring_config()
    return render_template(
        'admin.html',
        positions=config.get('positions', {}),
        global_config=config.get('global', {})
    )


@app.route('/admin/position/<pos_id>', methods=['GET'])
def position_form(pos_id):
    """Page for adding or editing a single position."""
    config = load_scoring_config()
    positions = config.get('positions', {})
    data = {'id': '', 'name': '', 'experience': {}}
    if pos_id != 'new':
        pos = positions.get(pos_id)
        if not pos:
            return redirect(url_for('admin_page'))
        data['id'] = pos_id
        data['name'] = pos.get('name', pos_id)
        data['experience'] = pos.get('experience', {})
    else:
        data['id'] = ''
        data['name'] = request.args.get('name', '')
    return render_template('position_form.html', position=data)


@app.route('/save_position', methods=['POST'])
def save_position():
    """Create or update a position and its score fields."""
    data = request.get_json(force=True)
    pos_id = data.get('id')
    name = data.get('name')
    experience = data.get('experience', {})
    if not pos_id or not name or not isinstance(experience, dict):
        return jsonify({'error': 'invalid data'}), 400
    config = load_scoring_config()
    if 'positions' not in config:
        config['positions'] = {}
    config['positions'][pos_id] = {
        'name': name,
        'experience': experience,
    }
    with open(SCORING_CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    return jsonify({'status': 'ok'})


@app.route('/save_global', methods=['POST'])
def save_global():
    """Update global scoring configuration."""
    data = request.get_json(force=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'invalid data'}), 400
    config = load_scoring_config()
    config['global'] = data
    with open(SCORING_CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    return jsonify({'status': 'ok'})

# API endpoint for frontend
@app.route('/api/candidates', methods=['GET', 'POST'])
def api_candidates():
    """Return or add candidates."""
    if request.method == 'POST':
        data = request.form
        resume_file = request.files.get('resume')
        df = read_data()
        new_id = get_next_id()
        stored_resume = save_resume_file(resume_file, data.get('name', ''))
        new_row = {
            'id': new_id,
            'name': data.get('name', ''),
            'mobile': data.get('mobile', ''),
            'gender': data.get('gender', ''),
            'position_type': data.get('position_type', ''),
            'source_of_news': 'Jobinja',
            'year_of_birth': '1370',
            'marital_status':'', 'education':'', 'major':'', 'years_of_experience':'0', 'military_status':'',
            'job_status':'', 'can_start_from':'', 'available_9_to_6':'',
            'telegram_id':'', 'has_portfolio':'', 'ok_with_task':'',
            'location':'', 'technical_experience_notes':'',
            'exp_dashboard_b2b':'', 'exp_dynamic_reports':'', 'exp_role_based_access':'',
            'exp_pos_mobile':'', 'exp_data_sync':'', 'exp_multistep_forms':'',
            'exp_low_digital_users':'', 'exp_multilingual':'', 'exp_portfolio_relevant':'',
            'exp_grpc':'', 'exp_microservices':'', 'exp_unit_testing':'',
            'exp_figma':'', 'exp_user_research':'', 'exp_prototyping':'',
            'interviewer_score':'0', 'design_score':'0', 'look_score':'0',
            'portfolio_score':'0', 'previous_work_score':'0',
            'resume_file': stored_resume, 'total_score':'',
            'status':'pending', 'meetings':'[]',
            'meeting1_date':'', 'meeting1_day':'', 'meeting1_time':'',
            'meeting2_date':'', 'meeting2_day':'', 'meeting2_time':'',
            'meeting3_date':'', 'meeting3_day':'', 'meeting3_time':'',
            'meeting4_date':'', 'meeting4_day':'', 'meeting4_time':'',
            'meeting5_date':'', 'meeting5_day':'', 'meeting5_time':''
        }
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        write_data(df)
        return jsonify({'id': new_id}), 201

    df = read_data()
    position_filter = request.args.get('position')
    if position_filter is not None:
        df = df[df.get('position_type', '').str.lower() == position_filter.lower()]
    for idx, row in df.iterrows():
        df.at[idx, 'total_score'] = compute_total_score(row)
    df['id'] = df['id'].astype(int)
    df = df.where(pd.notnull(df), None)
    result = df.to_dict(orient='records')
    cleaned = json.loads(json.dumps(result, default=str))
    return jsonify(cleaned)


@app.route('/api/weights/<position>', methods=['GET'])
def api_position_weights(position):
    """Return the total scoring weight for a given position."""
    config = load_scoring_config()
    role_cfg = config.get(position, {})
    total = 0
    for val in role_cfg.values():
        try:
            total += float(val)
        except (TypeError, ValueError):
            continue
    return jsonify({"position": position, "total_weight": total})


@app.route('/api/scoring/<position>', methods=['GET'])
def api_scoring(position):
    """Return scoring configuration for a position."""
    config = load_scoring_config()
    pos = config.get("positions", {}).get(position, {})
    return jsonify(pos)

@app.route('/api/scoring/global', methods=['GET'])
def api_scoring_global():
    """Return global scoring configuration."""
    config = load_scoring_config()
    return jsonify(config.get("global", {}))


@app.route('/api/positions', methods=['GET'])
def api_positions():
    """Return list of available positions with id and name."""
    config = load_scoring_config()
    positions = config.get("positions", {})
    result = []
    for pid, pdata in positions.items():
        result.append({"id": pid, "name": pdata.get("name", pid)})
    return jsonify(result)

@app.route('/add', methods=['POST'])
def add_candidate():
    data = request.form
    resume_file = request.files.get('resume')
    df = read_data()
    new_id = get_next_id()
    stored_resume = save_resume_file(resume_file, data.get('name', ''))
    new_row = {
        'id': new_id,
        'name': data.get('name', ''),
        'mobile': data.get('mobile', ''),
        'gender': data.get('gender', ''),
        'position_type': data.get('position_type', ''),
        'source_of_news': 'Jobinja',
        'year_of_birth': '1370',
        # the rest remain blank until edit
        'marital_status':'', 'education':'', 'major':'', 'years_of_experience':'0', 'military_status':'',
        'job_status':'', 'can_start_from':'', 'available_9_to_6':'',
        'telegram_id':'', 'has_portfolio':'', 'ok_with_task':'',
        'location':'', 'technical_experience_notes':'',
        'exp_dashboard_b2b':'', 'exp_dynamic_reports':'', 'exp_role_based_access':'',
        'exp_pos_mobile':'', 'exp_data_sync':'', 'exp_multistep_forms':'',
        'exp_low_digital_users':'', 'exp_multilingual':'', 'exp_portfolio_relevant':'',
        'exp_grpc':'', 'exp_microservices':'', 'exp_unit_testing':'',
        'exp_figma':'', 'exp_user_research':'', 'exp_prototyping':'',
        'interviewer_score':'0', 'design_score':'0', 'look_score':'0',
        'portfolio_score':'0', 'previous_work_score':'0',
        'resume_file': stored_resume, 'total_score':'',
        'status':'pending', 'meetings':'[]',
        'meeting1_date':'', 'meeting1_day':'', 'meeting1_time':'',
        'meeting2_date':'', 'meeting2_day':'', 'meeting2_time':'',
        'meeting3_date':'', 'meeting3_day':'', 'meeting3_time':'',
        'meeting4_date':'', 'meeting4_day':'', 'meeting4_time':'',
        'meeting5_date':'', 'meeting5_day':'', 'meeting5_time':''
    }
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    write_data(df)
    # redirect to the full edit form to complete details
    return redirect(url_for('edit_form', candidate_id=new_id))

@app.route('/get/<int:candidate_id>')
def get_candidate(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id]
    if person.empty:
        return jsonify({})
    record = person.to_dict(orient='records')[0]
    # convert any non-standard values (e.g. numpy types, NaN) to strings
    cleaned = json.loads(json.dumps(record, default=str))
    return jsonify(cleaned)

@app.route('/edit/<int:candidate_id>', methods=['GET'])
def edit_form(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id]
    if person.empty:
        return redirect(url_for('index'))
    return render_template('edit.html', candidate=person.to_dict(orient='records')[0])


@app.route('/view/<int:candidate_id>')
def view_candidate(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id]
    if person.empty:
        return redirect(url_for('index'))
    candidate = person.to_dict(orient='records')[0]
    meetings = []
    try:
        meetings = json.loads(candidate.get('meetings', '[]'))
    except Exception:
        meetings = []
    candidate['meetings_list'] = meetings
    return render_template('view.html', candidate=candidate)


@app.route('/edit/<int:candidate_id>', methods=['POST'])
def edit_candidate(candidate_id):
    df = read_data()
    resume_file = request.files.get('resume')
    # handle dynamic meetings
    dates = request.form.getlist('meeting_date[]')
    days = request.form.getlist('meeting_day[]')
    times = request.form.getlist('meeting_time[]')
    locs = request.form.getlist('meeting_location[]')
    statuses = request.form.getlist('meeting_status[]')
    meetings = []
    for i in range(len(dates)):
        meetings.append({
            'date': dates[i],
            'day': days[i] if i < len(days) else '',
            'time': times[i] if i < len(times) else '',
            'location': locs[i] if i < len(locs) else '',
            'status': statuses[i] if i < len(statuses) else ''
        })
    if 'meetings' in df.columns:
        df.loc[df['id'] == candidate_id, 'meetings'] = json.dumps(meetings)
    for key, value in request.form.items():
        if key.endswith('[]'):
            continue
        if key == 'id':
            # never overwrite the ID
            continue
        if key in df.columns:
            df.loc[df['id'] == candidate_id, key] = value
    if resume_file and resume_file.filename:
        stored = save_resume_file(resume_file, request.form.get('name', ''))
        df.loc[df['id'] == candidate_id, 'resume_file'] = stored

    numeric_cols = [
        'years_of_experience', 'interviewer_score', 'design_score', 'look_score',
        'portfolio_score', 'previous_work_score'
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    record = df[df['id'] == candidate_id]
    if record.empty:
        write_data(df)
        return redirect(url_for('index'))
    row = record.iloc[0].to_dict()
    df.loc[df['id'] == candidate_id, 'total_score'] = compute_total_score(row)
    write_data(df)
    return redirect(url_for('index'))

@app.route('/delete/<int:candidate_id>', methods=['POST'])
def delete_candidate(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id]
    if not person.empty:
        resume = person.iloc[0].get('resume_file', '')
        if resume:
            path = os.path.join(RESUME_DIR, resume)
            if os.path.exists(path):
                os.remove(path)
    df = df[df['id'] != candidate_id]
    write_data(df)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
