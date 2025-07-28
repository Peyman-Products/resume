import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ExpRow {
  key: string;
  label: string;
  points: string;
}

interface MapRow {
  key: string;
  points: string;
}

interface GlobalForm {
  gender: MapRow[];
  education: MapRow[];
  military_status: MapRow[];
  job_status: MapRow[];
  availability: MapRow[];
  reviewer_weights: MapRow[];
  exp_per_year: string;
}

export default function PositionForm() {
  const router = useRouter();
  const { id } = router.query;
  const [positionId, setPositionId] = useState('');
  const [name, setName] = useState('');
  const [rows, setRows] = useState<ExpRow[]>([]);
  const [globalForm, setGlobalForm] = useState<GlobalForm>({
    gender: [{ key: '', points: '' }],
    education: [{ key: '', points: '' }],
    military_status: [{ key: '', points: '' }],
    job_status: [{ key: '', points: '' }],
    availability: [{ key: '', points: '' }],
    reviewer_weights: [{ key: '', points: '' }],
    exp_per_year: '',
  });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!id) return;
    if (id !== 'new') {
      fetch(`http://localhost:5000/api/scoring/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPositionId(id as string);
          setName(data.name || (id as string));
          const exp = data.experience || {};
          const arr: ExpRow[] = Object.keys(exp).map((k) => ({
            key: k,
            label: exp[k].label || k,
            points: String(exp[k].points || 0),
          }));
          if (arr.length === 0) arr.push({ key: '', label: '', points: '' });
          setRows(arr);
        });
    } else {
      setPositionId('');
      setName('');
      setRows([{ key: '', label: '', points: '' }]);
    }
    fetch('http://localhost:5000/api/scoring/global')
      .then((res) => res.json())
      .then((data) => {
        const toRows = (obj: any): MapRow[] => {
          if (!obj) return [{ key: '', points: '' }];
          const entries = Object.entries(obj).map(([k, v]) => ({
            key: String(k),
            points: String(v as any),
          }));
          return entries.length ? entries : [{ key: '', points: '' }];
        };
        setGlobalForm({
          gender: toRows(data.gender),
          education: toRows(data.education),
          military_status: toRows(data.military_status),
          job_status: toRows(data.job_status),
          availability: toRows(data.availability),
          reviewer_weights: toRows(data.reviewer_weights),
          exp_per_year: String(data.exp_per_year ?? ''),
        });
      });
  }, [id]);

  const updateRow = (idx: number, field: keyof ExpRow, value: string) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], [field]: value };
    setRows(copy);
  };

  const addRow = () => setRows([...rows, { key: '', label: '', points: '' }]);

  const removeRow = (idx: number) => {
    const copy = [...rows];
    copy.splice(idx, 1);
    setRows(copy);
  };

  const handleSavePosition = async () => {
    const exp: any = {};
    rows.forEach((r) => {
      if (r.key.trim()) {
        exp[r.key.trim()] = {
          label: r.label || r.key,
          points: parseFloat(r.points) || 0,
        };
      }
    });
    await fetch('http://localhost:5000/save_position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: positionId.trim(), name: name.trim(), experience: exp }),
    });
    router.push('/admin');
  };

  const handleSaveGlobal = async () => {
    const toObj = (rows: MapRow[]) => {
      const o: any = {};
      rows.forEach((r) => {
        const k = r.key.trim();
        if (k) o[k] = parseFloat(r.points) || 0;
      });
      return o;
    };
    const cfg = {
      gender: toObj(globalForm.gender),
      education: toObj(globalForm.education),
      military_status: toObj(globalForm.military_status),
      job_status: toObj(globalForm.job_status),
      availability: toObj(globalForm.availability),
      reviewer_weights: toObj(globalForm.reviewer_weights),
      exp_per_year: parseFloat(globalForm.exp_per_year) || 0,
    };
    await fetch('http://localhost:5000/save_global', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    alert('Saved');
  };

  if (!id) return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Head>
        <title>Position Settings</title>
      </Head>
      <Typography variant="h5" gutterBottom>
        {id === 'new' ? 'Add Position' : 'Edit Position'}
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="General Score" />
        <Tab label="Experience" />
      </Tabs>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Position ID"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            disabled={id !== 'new'}
          />
          <TextField
            label="Position Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {(
            [
              ['gender', 'Gender'],
              ['education', 'Education'],
              ['military_status', 'Military Status'],
              ['job_status', 'Job Status'],
              ['availability', 'Availability'],
              ['reviewer_weights', 'Reviewer Weights'],
            ] as [keyof GlobalForm, string][]
          ).map(([section, title]) => (
            <Box key={section}>
              <Typography variant="subtitle1" gutterBottom>
                {title}
              </Typography>
              {globalForm[section].map((r, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <TextField
                    label="Key"
                    value={r.key}
                    onChange={(e) => {
                      const arr = [...globalForm[section]];
                      arr[idx] = { ...arr[idx], key: e.target.value };
                      setGlobalForm({ ...globalForm, [section]: arr });
                    }}
                  />
                  <TextField
                    label="Points"
                    type="number"
                    value={r.points}
                    onChange={(e) => {
                      const arr = [...globalForm[section]];
                      arr[idx] = { ...arr[idx], points: e.target.value };
                      setGlobalForm({ ...globalForm, [section]: arr });
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      const arr = [...globalForm[section]];
                      arr.splice(idx, 1);
                      setGlobalForm({ ...globalForm, [section]: arr });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() =>
                  setGlobalForm({
                    ...globalForm,
                    [section]: [...globalForm[section], { key: '', points: '' }],
                  })
                }
                sx={{ mt: 1 }}
              >
                Add Row
              </Button>
            </Box>
          ))}
          <TextField
            label="Experience Points Per Year"
            type="number"
            value={globalForm.exp_per_year}
            onChange={(e) => setGlobalForm({ ...globalForm, exp_per_year: e.target.value })}
          />
          <Button variant="contained" onClick={handleSaveGlobal} sx={{ alignSelf: 'flex-start' }}>
            Save General
          </Button>
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((r, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label="Key"
                value={r.key}
                onChange={(e) => updateRow(idx, 'key', e.target.value)}
              />
              <TextField
                label="Label"
                value={r.label}
                onChange={(e) => updateRow(idx, 'label', e.target.value)}
              />
              <TextField
                label="Points"
                type="number"
                value={r.points}
                onChange={(e) => updateRow(idx, 'points', e.target.value)}
              />
              <IconButton onClick={() => removeRow(idx)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={addRow} sx={{ alignSelf: 'flex-start' }}>
            Add Row
          </Button>
          <Button variant="contained" onClick={handleSavePosition} sx={{ alignSelf: 'flex-start' }}>
            Save Position
          </Button>
        </Box>
      )}
    </Container>
  );
}
