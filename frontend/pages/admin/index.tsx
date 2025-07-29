import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Position {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const router = useRouter();

  const deletePosition = async (id: string) => {
    if (!confirm('Delete this position?')) return;
    await fetch(`http://localhost:5000/delete_position/${id}`, { method: 'POST' });
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/positions')
      .then((res) => res.json())
      .then((data) => setPositions(data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Head>
        <title>Admin</title>
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Positions</Typography>
        <Button variant="outlined" onClick={() => router.push('/')}>Back</Button>
      </Box>
      <Button
        variant="contained"
        onClick={() => router.push('/admin/position/new')}
        sx={{ mb: 2 }}
      >
        Add Position
      </Button>
      <List>
        {positions.map((p) => (
          <ListItem
            key={p.id}
            divider
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => router.push(`/admin/position/${p.id}`)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => deletePosition(p.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText primary={p.name} secondary={p.id} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
