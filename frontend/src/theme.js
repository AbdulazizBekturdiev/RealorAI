import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#101D13',
      paper: '#101D13',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.8)',
      disabled: 'rgba(255, 255, 255, 0.6)',
    },
    primary: {
      main: '#E1FF01',
    },
    secondary: {
      main: '#01F967',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem', // Default (Desktop) size
      // Mobile Override (Screens narrower than 600px)
      '@media (max-width:600px)': {
        fontSize: '2rem', // Smaller size for mobile
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#101D13',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;

