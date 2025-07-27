import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, CircularProgress, Button, Grid, Box } from '@mui/material';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  interface Pos { id: string; name: string }
  const [positions, setPositions] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/positions')
      .then((res) => res.json())
      .then((data) => {
        setPositions(data);
        setLoading(false);
      });
  }, []);

  const goto = (pos: string) => {
    router.push(`/${pos}/candidates`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Head>
        <title>Select Position</title>
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Choose Position</Typography>
        <Button onClick={() => router.push('/admin')}>Admin</Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {positions.map((p) => (
            <Grid item key={p.id}>
              <Button variant="outlined" onClick={() => goto(p.id)}>
                {p.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
