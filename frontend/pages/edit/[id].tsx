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
} from '@mui/material';

interface Candidate {
  [key: string]: any;
}

export default function EditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidate(data);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    if (!candidate) return;
    const form = new FormData();
    Object.keys(candidate).forEach((key) => {
      const val = candidate[key];
      if (val !== undefined && val !== null) {
        form.append(key, String(val));
      }
    });
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
      </Tabs>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={candidate.name || ''}
            onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
          />
          <TextField
            label="Mobile"
            value={candidate.mobile || ''}
            onChange={(e) =>
              setCandidate({ ...candidate, mobile: e.target.value })
            }
          />
          <TextField
            label="Gender"
            value={candidate.gender || ''}
            onChange={(e) =>
              setCandidate({ ...candidate, gender: e.target.value })
            }
          />
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Technical Notes"
            value={candidate.technical_experience_notes || ''}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                technical_experience_notes: e.target.value,
              })
            }
            multiline
          />
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
