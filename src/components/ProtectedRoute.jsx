import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * ProtectedRoute component to enforce role-based access control
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not logged in, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified and user role is not in the list, deny access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Access Denied</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You do not have permission to access this page. Required roles: {allowedRoles.join(', ')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role: {user.role}
        </Typography>
      </Box>
    );
  }

  // User is authorized, render the component
  return children;
}
