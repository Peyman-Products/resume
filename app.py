from flask import Flask, render_template, request, redirect, url_for, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Path to Excel data file (placed alongside this script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'candidates.xlsx')

# ensure the Excel file exists with the required columns
def _ensure_file():
    if not os.path.exists(DATA_FILE):
        df = pd.DataFrame(columns=[
            'id',
            'name', 'mobile', 'gender', 'marital_status', 'education', 'major', 'military_status',
            'job_status', 'can_start_from', 'available_9_to_6', 'telegram_id',
            'has_portfolio', 'ok_with_task', 'location', 'technical_experience_notes',
            'exp_dashboard_b2b', 'exp_dynamic_reports', 'exp_role_based_access',
            'exp_pos_mobile', 'exp_data_sync', 'exp_multistep_forms',
            'exp_low_digital_users', 'exp_multilingual', 'exp_portfolio_relevant'
        ])
        df.to_excel(DATA_FILE, index=False)

def read_data():
    _ensure_file()
    return pd.read_excel(DATA_FILE)

def write_data(df):
    df.to_excel(DATA_FILE, index=False)

def get_next_id():
    df = read_data()
    return int(df['id'].max() + 1) if not df.empty else 1

@app.route('/')
def index():
    df = read_data()
    # pass list of dicts to template
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
        'exp_low_digital_users':'', 'exp_multilingual':'', 'exp_portfolio_relevant':''
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
