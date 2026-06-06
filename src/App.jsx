import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import StaffDirectory from './pages/StaffDirectory';
import LeaveManagement from './pages/LeaveManagement';
import Timesheet from './pages/Timesheet';
import PerformanceAppraisal from './pages/PerformanceAppraisal';
import Upload from './pages/Upload';
import Notifications from './pages/Notifications';
import IndependentSheet from './pages/IndependentSheet';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function AppContent() {
  const [mode, setMode] = useState('light');
  const colorMode = {
    toggleColorMode: () => setMode(prev => prev === 'light' ? 'dark' : 'light'),
  };
  const theme = createTheme({
    shape: { borderRadius: 14 },
    palette: {
      mode,
      primary: { main: '#1877f2' },
      background: { default: mode === 'light' ? '#f4f6f8' : '#121212', paper: mode === 'light' ? '#ffffff' : '#1d1d1d' },
      text: { primary: mode === 'light' ? '#111827' : '#f9fafb', secondary: mode === 'light' ? '#6b7280' : '#cbd5e1' },
      divider: mode === 'light' ? '#e5e7eb' : '#374151',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#f4f6f8' : '#121212',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            boxShadow: mode === 'light' ? '0px 8px 24px rgba(15, 23, 42, 0.06)' : '0px 8px 24px rgba(0, 0, 0, 0.35)',
            border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
          },
        },
      },
    },
  });

  const { user, logout } = useAuth();
  if (!user) return <Login />;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="staff" element={<StaffDirectory />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="timesheet" element={<Timesheet />} />
              <Route path="appraisals" element={<PerformanceAppraisal />} />
              <Route path="sheet" element={<IndependentSheet />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="upload" element={<Upload />} />
            </Route>
          </Routes>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
