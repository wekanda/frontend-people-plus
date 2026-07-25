/**
 * Theme Configuration
 * Professional HR App Theme with Material Design 3
 */

import { createTheme } from '@mui/material/styles';

// Professional corporate colors
const professionalColors = {
  primaryBlue: '#0D47A1',       // Professional blue
  lightBlue: '#1565C0',         // Light primary
  accentBlue: '#1976D2',        // Accent
  darkBlue: '#082E5C',          // Dark variant
  teal: '#00897B',              // Success/accent
  coral: '#E64A19',             // Accent/warning
  lightGray: '#F5F7FA',         // Light backgrounds
  mediumGray: '#ECEFF1',        // Medium backgrounds
  darkGray: '#37474F',          // Dark text
  textGray: '#546E7A',          // Secondary text
  white: '#FFFFFF'
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: professionalColors.primaryBlue,
      light: professionalColors.lightBlue,
      dark: professionalColors.darkBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: professionalColors.teal,
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FB8C00',
      light: '#FFB74D',
      dark: '#E65100',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    background: {
      default: professionalColors.white,
      paper: professionalColors.lightGray,
    },
    text: {
      primary: professionalColors.darkGray,
      secondary: professionalColors.textGray,
    },
    divider: '#BDBDBD',
    action: {
      hover: professionalColors.mediumGray,
      selected: '#E3F2FD',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Oxygen", "Ubuntu", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: professionalColors.primaryBlue,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: professionalColors.primaryBlue,
      marginBottom: '0.8rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: professionalColors.darkGray,
      marginBottom: '0.6rem',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: professionalColors.darkGray,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      color: professionalColors.darkGray,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: professionalColors.textGray,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: professionalColors.textGray,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: professionalColors.textGray,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.95rem',
          padding: '10px 20px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(13, 71, 161, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(13, 71, 161, 0.25)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #ECEFF1',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: professionalColors.mediumGray,
          borderBottom: `1px solid ${professionalColors.lightGray}`,
          padding: '16px 20px',
        },
        title: {
          fontSize: '1.1rem',
          fontWeight: 600,
          color: professionalColors.darkGray,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FAFBFC',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: professionalColors.lightGray,
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              '& fieldset': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FAFBFC',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: professionalColors.primaryBlue,
          boxShadow: '0 2px 8px rgba(13, 71, 161, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& thead': {
            backgroundColor: professionalColors.mediumGray,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            backgroundColor: professionalColors.mediumGray,
            fontWeight: 700,
            fontSize: '0.95rem',
            color: professionalColors.darkGray,
            borderBottom: `2px solid ${professionalColors.primaryBlue}`,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& tr:hover': {
            backgroundColor: professionalColors.lightGray,
            transition: 'background-color 0.2s ease',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${professionalColors.mediumGray}`,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '24px',
          paddingBottom: '24px',
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
      main: professionalColors.accentBlue,
      light: professionalColors.lightBlue,
      dark: professionalColors.darkBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: professionalColors.teal,
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FB8C00',
      light: '#FFB74D',
      dark: '#E65100',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
    divider: '#424242',
    action: {
      hover: '#263238',
      selected: '#1A237E',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Oxygen", "Ubuntu", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: professionalColors.accentBlue,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: professionalColors.accentBlue,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#E0E0E0',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#B0BEC5',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#90A4AE',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          border: '1px solid #424242',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: '#263238',
          borderBottom: '1px solid #424242',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#2C2C2C',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            backgroundColor: '#263238',
            fontWeight: 700,
            borderBottom: `2px solid ${professionalColors.accentBlue}`,
          },
        },
      },
    },
  },
});

export default lightTheme;
