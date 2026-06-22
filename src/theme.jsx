/**
 * Theme Configuration
 * Based on topographic map colors with dark mode support
 */

import { createTheme } from '@mui/material/styles';

// Topographic colors
const topographicColors = {
  deepBlue: '#1E5A96',      // Deep water/elevation
  oceanBlue: '#2E7CB3',      // Water feature
  lightBlue: '#6BA3D0',      // Light water
  orange: '#FF6B35',         // Contour highlight
  green: '#66BB6A',          // Land/vegetation
  yellow: '#FFC107',         // Elevation/warning
  darkGray: '#333333',       // Dark text/backgrounds
  lightGray: '#F5F5F5',      // Light backgrounds
  white: '#FFFFFF'
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: topographicColors.deepBlue,
      light: topographicColors.oceanBlue,
      dark: '#1a3f63',
      contrastText: '#fff',
    },
    secondary: {
      main: topographicColors.orange,
      light: '#ff8f66',
      dark: '#d9481e',
      contrastText: '#fff',
    },
    success: {
      main: topographicColors.green,
      light: '#81c784',
      dark: '#2e7d32',
    },
    warning: {
      main: topographicColors.yellow,
      light: '#ffee58',
      dark: '#fbc02d',
    },
    background: {
      default: '#ffffff',
      paper: '#f9f9f9',
    },
    text: {
      primary: topographicColors.darkGray,
      secondary: '#666666',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: topographicColors.deepBlue,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: topographicColors.deepBlue,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: topographicColors.deepBlue,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(30, 90, 150, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(30, 90, 150, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            backgroundColor: '#fafafa',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: topographicColors.deepBlue,
          boxShadow: '0 2px 8px rgba(30, 90, 150, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: topographicColors.lightBlue,
      light: topographicColors.oceanBlue,
      dark: topographicColors.deepBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: topographicColors.orange,
      light: '#ff8f66',
      dark: '#d9481e',
      contrastText: '#fff',
    },
    success: {
      main: topographicColors.green,
      light: '#81c784',
      dark: '#2e7d32',
    },
    warning: {
      main: topographicColors.yellow,
      light: '#ffee58',
      dark: '#fbc02d',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#424242',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: topographicColors.lightBlue,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: topographicColors.lightBlue,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: topographicColors.lightBlue,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(107, 163, 208, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(107, 163, 208, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            backgroundColor: '#2a2a2a',
            '&:hover': {
              backgroundColor: '#333333',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
});

export default lightTheme;
