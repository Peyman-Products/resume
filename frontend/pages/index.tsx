import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Link } from '@mui/material';

interface Candidate {
  id: number;
  name: string;
  mobile: string;
  gender: string;
  total_score: number;
  resume_file: string;
  status: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/candidates')
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        setLoading(false);
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Head>
        <title>Candidate List</title>
      </Head>
      <Typography variant="h4" gutterBottom>
        Candidate List
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.mobile}</TableCell>
                <TableCell>{c.gender}</TableCell>
                <TableCell>{c.total_score}</TableCell>
                <TableCell>
                  {c.resume_file ? (
                    <Link href={`http://localhost:5000/resumes/${c.resume_file}`}>Resume</Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{c.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}
