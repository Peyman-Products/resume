from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
import json

# scoring maps
TECH_SCORES = {
    'exp_dashboard_b2b': 4,
    'exp_dynamic_reports': 6,
    'exp_role_based_access': 3,
    'exp_pos_mobile': 6,
    'exp_data_sync': 3,
    'exp_multistep_forms': 4,
    'exp_low_digital_users': 5,
    'exp_multilingual': 2,
    'exp_portfolio_relevant': 2,
}

GENERAL_SCORES = {
    'gender': {
        'Male': -3,
        'Female': 1,
    },
    'marital_status': {
        'Single': 1,
        'Married': 0,
    },
    'education': {
        'Diploma': 0,
        'Bachelor': 1,
        'Master': 2,
    },
    'military_status': {
        'Completed': 2,
        'Exempt': 1,
        'In Progress': -4,
        'N/A': 0,
    },
    'job_status': {
        'Employed': -1,
        'Freelancer': 0,
        'Unemployed': 1,
    },
    'can_start_from': {
        '1 Week': 5,
        'Less than a month': 2,
        'More than a month': -5,
    },
}

COLUMNS = [
    'id', 'name', 'mobile', 'gender', 'source_of_news', 'year_of_birth',
    'marital_status', 'education', 'major',
    'years_of_experience',
    'military_status', 'job_status', 'can_start_from', 'available_9_to_6',
    'telegram_id', 'has_portfolio', 'ok_with_task', 'location',
    'technical_experience_notes',
    'exp_dashboard_b2b', 'exp_dynamic_reports', 'exp_role_based_access',
    'exp_pos_mobile', 'exp_data_sync', 'exp_multistep_forms',
    'exp_low_digital_users', 'exp_multilingual', 'exp_portfolio_relevant',
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
    if 'years_of_experience' in df.columns:
        df['years_of_experience'] = df['years_of_experience'].fillna(0)
    if 'meetings' in df.columns:
        df['meetings'] = df['meetings'].fillna('[]')
    if 'id' in df.columns:
        df['id'] = df['id'].fillna(0).astype(int)
    if 'year_of_birth' in df.columns:
        df['year_of_birth'] = df['year_of_birth'].fillna(1370)
    if 'source_of_news' in df.columns:
        df['source_of_news'] = df['source_of_news'].fillna('Jobinja')
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
    score = 0
    # technical experience
    for field, pts in TECH_SCORES.items():
        if str(row.get(field, '')).strip() == 'Yes':
            score += pts

    # general items
    for field, mapping in GENERAL_SCORES.items():
        val = str(row.get(field, '')).strip()
        score += mapping.get(val, 0)

    # additional boolean fields
    if str(row.get('available_9_to_6', '')) == 'Yes':
        score += 5
    if str(row.get('has_portfolio', '')) == 'Yes':
        score += 5
    if str(row.get('ok_with_task', '')) == 'Yes':
        score += 2

    # interviewer, design, look, portfolio and previous work scores
    try:
        score += float(row.get('interviewer_score', 0))
    except ValueError:
        pass
    try:
        score += float(row.get('design_score', 0))
    except ValueError:
        pass
    try:
        score += float(row.get('look_score', 0))
    except ValueError:
        pass
    try:
        score += float(row.get('portfolio_score', 0))
    except ValueError:
        pass
    try:
        score += float(row.get('previous_work_score', 0))
    except ValueError:
        pass

    try:
        score += float(row.get('years_of_experience', 0)) * 5
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

# API endpoint for frontend
@app.route('/api/candidates', methods=['GET'])
def api_candidates():
    """Return all candidates as JSON."""
    df = read_data()
    for idx, row in df.iterrows():
        df.at[idx, 'total_score'] = compute_total_score(row)
    df['id'] = df['id'].astype(int)
    # Replace NaN values with None so the JSON is valid
    df = df.where(pd.notnull(df), None)
    result = df.to_dict(orient='records')
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
        if key in df.columns:
            df.loc[df['id'] == candidate_id, key] = value
    if resume_file and resume_file.filename:
        stored = save_resume_file(resume_file, request.form.get('name', ''))
        df.loc[df['id'] == candidate_id, 'resume_file'] = stored
    row = df[df['id'] == candidate_id].iloc[0].to_dict()
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
