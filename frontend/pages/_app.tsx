import * as React from 'react';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  PaletteMode,
} from '@mui/material';
import Layout from '../components/Layout';

const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#F7A043' },
      secondary: { main: '#FBC978' },
      background: {
        default: mode === 'light' ? '#ffffff' : '#000000',
        paper: mode === 'light' ? '#ffffff' : '#000000',
      },
      text: {
        primary: mode === 'light' ? '#363636' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Vazirmatn, sans-serif',
    },
  });

export default function MyApp({ Component, pageProps }: AppProps) {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const toggleDarkMode = () =>
    setMode((m) => (m === 'light' ? 'dark' : 'light'));

  React.useEffect(() => {
    const stored = window.localStorage.getItem('color-mode') as PaletteMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    }
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem('color-mode', mode);
  }, [mode]);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout darkMode={mode === 'dark'} toggleDarkMode={toggleDarkMode}>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </React.Fragment>
  );
}
