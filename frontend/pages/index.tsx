import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  interface Pos { id: string; name: string }
  const [positions, setPositions] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, {count: number; exp: number}>>({});

  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:5000/api/positions');
      const data = await res.json();
      setPositions(data);
      const st: Record<string, {count:number; exp:number}> = {};
      for (const p of data) {
        const [candRes, scRes] = await Promise.all([
          fetch(`http://localhost:5000/api/candidates?position=${p.id}`).then(r => r.json()),
          fetch(`http://localhost:5000/api/scoring/${p.id}`).then(r => r.json()),
        ]);
        st[p.id] = { count: candRes.length, exp: Object.keys(scRes.experience || {}).length };
      }
      setStats(st);
      setLoading(false);
    }
    load();
  }, []);

  const goto = (pos: string) => {
    router.push(`/${pos}/candidates`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Head>
        <title>Select Position</title>
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Candidate Manager
          </Typography>
          <Typography color="text.secondary">
            Choose a position to manage its candidates
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => router.push('/admin')}>
          Admin
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {positions.map((p) => (
            <Grid item key={p.id} xs={12} sm={6} md={4}>
              <Card sx={{ minWidth: 220, bgcolor: 'grey.100', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {p.id}
                  </Typography>
                  <Typography variant="body2">
                    Candidates: {stats[p.id]?.count ?? 0}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Experience Items: {stats[p.id]?.exp ?? 0}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" size="small" onClick={() => goto(p.id)}>
                    View Candidates
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
