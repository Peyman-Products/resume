import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';

interface Candidate {
  [key: string]: any;
}

interface Meeting {
  date?: string;
  day?: string;
  time?: string;
  location?: string;
  status?: string;
}

export default function EditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expConfig, setExpConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        let m: Meeting[] = [];
        if (data.meetings) {
          try {
            m = JSON.parse(data.meetings);
          } catch {
            m = [];
          }
        }
        if (m.length < 5) {
          m = [...m, ...Array.from({ length: 5 - m.length }, () => ({}))];
        }
        setMeetings(m);
        setCandidate(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!candidate?.position_type) return;
    const role = String(candidate.position_type).toLowerCase();
    fetch(`http://localhost:5000/api/scoring/${role}`)
      .then((res) => res.json())
      .then((data) => setExpConfig(data.experience || {}));
  }, [candidate?.position_type]);

  const updateField = (key: string, value: any) => {
    if (!candidate) return;
    setCandidate({ ...candidate, [key]: value });
  };

  const updateMeeting = (idx: number, key: keyof Meeting, value: string) => {
    const updated = [...meetings];
    updated[idx] = { ...updated[idx], [key]: value };
    setMeetings(updated);
  };

  const addMeeting = () => setMeetings([...meetings, {}]);

  const handleSave = async () => {
    if (!candidate) return;
    const form = new FormData();
    Object.keys(candidate).forEach((key) => {
      if (key === 'id' || key === 'meetings_list') return;
      const val = candidate[key];
      if (val !== undefined && val !== null) {
        form.append(key, String(val));
      }
    });
    meetings.forEach((m) => {
      form.append('meeting_date[]', m.date || '');
      form.append('meeting_day[]', m.day || '');
      form.append('meeting_time[]', m.time || '');
      form.append('meeting_location[]', m.location || '');
      form.append('meeting_status[]', m.status || '');
    });
    if (resumeFile) {
      form.append('resume', resumeFile);
    }
    await fetch(`http://localhost:5000/edit/${id}`, {
      method: 'POST',
      body: form,
    });
    router.push('/');
  };

  if (loading) return <CircularProgress />;
  if (!candidate) return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Edit Candidate
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="General" />
        <Tab label="Experience" />
        <Tab label="Design" />
        <Tab label="Meetings" />
      </Tabs>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography fontWeight="bold" color="primary.main">
            Personal Info
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Full Name"
              value={candidate.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <TextField
              label="Mobile Number"
              value={candidate.mobile || ''}
              onChange={(e) => updateField('mobile', e.target.value)}
            />
            <TextField
              select
              label="Gender"
              sx={{ minWidth: 200 }}
              value={candidate.gender || ''}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
            <TextField
              label="Year of Birth"
              type="number"
              value={candidate.year_of_birth || ''}
              onChange={(e) => updateField('year_of_birth', e.target.value)}
            />
          </Box>

          <Typography fontWeight="bold" color="success.main">
            Education &amp; Experience
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              select
              label="Marital Status"
              sx={{ minWidth: 200 }}
              value={candidate.marital_status || ''}
              onChange={(e) => updateField('marital_status', e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
            </TextField>
            <TextField
              select
              label="Education Level"
              sx={{ minWidth: 200 }}
              value={candidate.education || ''}
              onChange={(e) => updateField('education', e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Diploma">Diploma</MenuItem>
              <MenuItem value="Bachelor">Bachelor</MenuItem>
              <MenuItem value="Master">Master</MenuItem>
            </TextField>
            <TextField
              label="Major / Field"
              value={candidate.major || ''}
              onChange={(e) => updateField('major', e.target.value)}
            />
            <TextField
              label="Years of Experience"
              type="number"
              value={candidate.years_of_experience || ''}
              onChange={(e) => updateField('years_of_experience', e.target.value)}
            />
            <TextField
              select
              label="Military Status"
              sx={{ minWidth: 200 }}
              value={candidate.military_status || ''}
              onChange={(e) => updateField('military_status', e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Exempt">Exempt</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="N/A">N/A</MenuItem>
            </TextField>
          </Box>

          <Typography fontWeight="bold" color="secondary.main">
            Employment
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              select
              label="Current Job Status"
              sx={{ minWidth: 200 }}
              value={candidate.job_status || ''}
              onChange={(e) => updateField('job_status', e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Employed">Employed</MenuItem>
              <MenuItem value="Freelancer">Freelancer</MenuItem>
              <MenuItem value="Unemployed">Unemployed</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              sx={{ minWidth: 200 }}
              value={candidate.status || ''}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="called">called</MenuItem>
              <MenuItem value="Online meeting">Online meeting</MenuItem>
              <MenuItem value="offline meeting">offline meeting</MenuItem>
              <MenuItem value="rejected">rejected</MenuItem>
            </TextField>
            <TextField
              select
              label="Can Start From"
              sx={{ minWidth: 200 }}
              value={candidate.can_start_from || ''}
              onChange={(e) => updateField('can_start_from', e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="1 Week">1 Week</MenuItem>
              <MenuItem value="Less than a month">Less than a month</MenuItem>
              <MenuItem value="More than a month">More than a month</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={candidate.available_9_to_6 === 'Yes'}
                  onChange={(e) =>
                    updateField('available_9_to_6', e.target.checked ? 'Yes' : '')
                  }
                />
              }
              label="Okay with 9-6 Work?"
            />
          </Box>

          <Typography fontWeight="bold" color="info.main">
            Contact &amp; Source
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Telegram ID"
              value={candidate.telegram_id || ''}
              onChange={(e) => updateField('telegram_id', e.target.value)}
            />
            <TextField
              select
              label="Source of News"
              sx={{ minWidth: 200 }}
              value={candidate.source_of_news || ''}
              onChange={(e) => updateField('source_of_news', e.target.value)}
            >
              <MenuItem value="Linkedin">Linkedin</MenuItem>
              <MenuItem value="Connections">Connections</MenuItem>
              <MenuItem value="Jobinja">Jobinja</MenuItem>
              <MenuItem value="Jobvision">Jobvision</MenuItem>
            </TextField>
          </Box>

          <Typography fontWeight="bold" color="warning.main">
            Portfolio &amp; Scores
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={candidate.has_portfolio === 'Yes'}
                  onChange={(e) =>
                    updateField('has_portfolio', e.target.checked ? 'Yes' : '')
                  }
                />
              }
              label="Has Portfolio?"
            />
            <TextField
              label="Portfolio Score"
              type="number"
              value={candidate.portfolio_score || ''}
              onChange={(e) => updateField('portfolio_score', e.target.value)}
            />
            <TextField
              label="Previous Work Score"
              type="number"
              value={candidate.previous_work_score || ''}
              onChange={(e) => updateField('previous_work_score', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={candidate.ok_with_task === 'Yes'}
                  onChange={(e) =>
                    updateField('ok_with_task', e.target.checked ? 'Yes' : '')
                  }
                />
              }
              label="Okay with Design Task?"
            />
            <TextField
              label="Interviewer Score"
              type="number"
              value={candidate.interviewer_score || ''}
              onChange={(e) => updateField('interviewer_score', e.target.value)}
            />
            <TextField
              label="Look Score"
              type="number"
              value={candidate.look_score || ''}
              onChange={(e) => updateField('look_score', e.target.value)}
            />
          </Box>

          <Typography fontWeight="bold" color="secondary.main">
            Location &amp; Resume
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="City / Area in Tehran"
              value={candidate.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Button variant="outlined" component="label">
              Upload Resume
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setResumeFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </Button>
            {candidate.resume_file && (
              <Typography>
                <a
                  href={`http://localhost:5000/resumes/${candidate.resume_file}`}
                  target="_blank"
                >
                  Current Resume
                </a>
              </Typography>
            )}
          </Box>
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(expConfig).map(([key, info]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={candidate[key] === 'Yes'}
                    onChange={(e) =>
                      updateField(key, e.target.checked ? 'Yes' : '')
                    }
                  />
                }
                label={(info as any).label || key}
              />
            ))}
          </Box>
          <TextField
            label="Other notes about technical fit"
            multiline
            rows={8}
            sx={{ flex: 1, minWidth: 300 }}
            value={candidate.technical_experience_notes || ''}
            onChange={(e) => updateField('technical_experience_notes', e.target.value)}
          />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Design Score"
            type="number"
            value={candidate.design_score || ''}
            onChange={(e) => updateField('design_score', e.target.value)}
          />
        </Box>
      )}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {meetings.map((m, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <TextField
                label="Date"
                value={m.date || ''}
                onChange={(e) => updateMeeting(idx, 'date', e.target.value)}
              />
              <TextField
                select
                label="Day"
                sx={{ minWidth: 200 }}
                value={m.day || ''}
                onChange={(e) => updateMeeting(idx, 'day', e.target.value)}
              >
                <MenuItem value="">-</MenuItem>
                {['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Time"
                value={m.time || ''}
                onChange={(e) => updateMeeting(idx, 'time', e.target.value)}
              />
              <TextField
                select
                label="Type"
                sx={{ minWidth: 200 }}
                value={m.location || ''}
                onChange={(e) => updateMeeting(idx, 'location', e.target.value)}
              >
                <MenuItem value="online">online</MenuItem>
                <MenuItem value="offline">offline</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                sx={{ minWidth: 200 }}
                value={m.status || ''}
                onChange={(e) => updateMeeting(idx, 'status', e.target.value)}
              >
                <MenuItem value="calendered">calendered</MenuItem>
                <MenuItem value="attended">attended</MenuItem>
                <MenuItem value="not attended">not attended</MenuItem>
                <MenuItem value="canceled">canceled</MenuItem>
              </TextField>
            </Box>
          ))}
          <Button variant="outlined" size="small" onClick={addMeeting}>
            Add Meeting
          </Button>
        </Box>
      )}
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
          Save
        </Button>
        <Button variant="outlined" onClick={() => router.push('/')}>Back</Button>
      </Box>
    </Container>
  );
}
