import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, CircularProgress, Button, Grid } from '@mui/material';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [positions, setPositions] = useState<string[]>([]);
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
      <Typography variant="h4" gutterBottom>
        Choose Position
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {positions.map((p) => (
            <Grid item key={p}>
              <Button variant="outlined" onClick={() => goto(p)}>
                {p}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
