from flask import Flask, render_template, request, redirect, url_for, jsonify
import pandas as pd
import os

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
    'id', 'name', 'mobile', 'gender', 'marital_status', 'education', 'major',
    'military_status', 'job_status', 'can_start_from', 'available_9_to_6',
    'telegram_id', 'has_portfolio', 'ok_with_task', 'location',
    'technical_experience_notes',
    'exp_dashboard_b2b', 'exp_dynamic_reports', 'exp_role_based_access',
    'exp_pos_mobile', 'exp_data_sync', 'exp_multistep_forms',
    'exp_low_digital_users', 'exp_multilingual', 'exp_portfolio_relevant',
    'interviewer_score', 'design_score', 'total_score'
]

app = Flask(__name__)

# Path to Excel data file (placed alongside this script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'candidates.xlsx')

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
    if 'id' in df.columns:
        df['id'] = df['id'].fillna(0).astype(int)
    return df

def write_data(df):
    df.to_excel(DATA_FILE, index=False)

def get_next_id():
    df = read_data()
    return int(df['id'].max() + 1) if not df.empty else 1

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

    # interviewer and design scores
    try:
        score += float(row.get('interviewer_score', 0))
    except ValueError:
        pass
    try:
        score += float(row.get('design_score', 0))
    except ValueError:
        pass

    return score

@app.route('/')
def index():
    df = read_data()
    # compute total score for each candidate
    for idx, row in df.iterrows():
        df.at[idx, 'total_score'] = compute_total_score(row)
    write_data(df)
    df['id'] = df['id'].astype(int)
    return render_template('index.html', candidates=df.to_dict(orient='records'))

@app.route('/add', methods=['POST'])
def add_candidate():
    data = request.form
    df = read_data()
    new_id = get_next_id()
    new_row = {
        'id': new_id,
        'name': data.get('name', ''),
        'mobile': data.get('mobile', ''),
        'gender': data.get('gender', ''),
        # the rest remain blank until edit
        'marital_status':'', 'education':'', 'major':'', 'military_status':'',
        'job_status':'', 'can_start_from':'', 'available_9_to_6':'',
        'telegram_id':'', 'has_portfolio':'', 'ok_with_task':'',
        'location':'', 'technical_experience_notes':'',
        'exp_dashboard_b2b':'', 'exp_dynamic_reports':'', 'exp_role_based_access':'',
        'exp_pos_mobile':'', 'exp_data_sync':'', 'exp_multistep_forms':'',
        'exp_low_digital_users':'', 'exp_multilingual':'', 'exp_portfolio_relevant':'',
        'interviewer_score':'', 'design_score':'', 'total_score':''
    }
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    write_data(df)
    # redirect to the full edit form to complete details
    return redirect(url_for('edit_form', candidate_id=new_id))

@app.route('/get/<int:candidate_id>')
def get_candidate(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id].to_dict(orient='records')
    return jsonify(person[0]) if person else jsonify({})

@app.route('/edit/<int:candidate_id>', methods=['GET'])
def edit_form(candidate_id):
    df = read_data()
    person = df[df['id'] == candidate_id]
    if person.empty:
        return redirect(url_for('index'))
    return render_template('edit.html', candidate=person.to_dict(orient='records')[0])


@app.route('/edit/<int:candidate_id>', methods=['POST'])
def edit_candidate(candidate_id):
    df = read_data()
    for key, value in request.form.items():
        if key in df.columns:
            df.loc[df['id'] == candidate_id, key] = value
    row = df[df['id'] == candidate_id].iloc[0].to_dict()
    df.loc[df['id'] == candidate_id, 'total_score'] = compute_total_score(row)
    write_data(df)
    return redirect(url_for('index'))

@app.route('/delete/<int:candidate_id>', methods=['POST'])
def delete_candidate(candidate_id):
    df = read_data()
    df = df[df['id'] != candidate_id]
    write_data(df)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
