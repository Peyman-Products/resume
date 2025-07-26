import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddCandidateDialog from '../components/AddCandidateDialog';

interface Candidate {
  id: number;
  name: string;
  mobile: string;
  gender: string;
  total_score: number | null;
  resume_file: string | null;
  status: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/candidates')
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 1 },
    { field: 'total_score', headerName: 'Total', type: 'number', flex: 1 },
    {
      field: 'resume_file',
      headerName: 'Resume',
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <a href={`http://localhost:5000/resumes/${params.value}`}>Resume</a>
        ) : (
          '-'
        ),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Head>
        <title>Candidate List</title>
      </Head>
      <Typography variant="h4" gutterBottom>
        Candidate List
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        New Candidate
      </Button>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, ml: 2 }}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filtered.map((c) => ({
              id: c.id,
              name: c.name || '-',
              mobile: c.mobile || '-',
              gender: c.gender || '-',
              total_score: c.total_score ?? 0,
              resume_file: c.resume_file || '',
              status: c.status || '-',
            }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
      <AddCandidateDialog open={open} onClose={() => setOpen(false)} onAdded={fetchData} />
    </Container>
  );
}
