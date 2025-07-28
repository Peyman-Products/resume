import { ReactNode } from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface Props {
  children?: ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, darkMode, toggleDarkMode }: Props) {
  const theme = useTheme();
  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Candidate Manager
          </Typography>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/admin">
            Admin
          </Button>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ ml: 1 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ px: 2, py: 3 }}>
        {children}
      </Box>
      <Box component="footer" sx={{ textAlign: 'center', py: 1, fontSize: '0.8rem' }}>
        © {new Date().getFullYear()}
      </Box>
    </Box>
  );
}
