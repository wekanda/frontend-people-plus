import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Paper, Typography, Alert, MenuItem, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleOptions = [
  { value: 'staff', label: 'Staff' },
];

export default function Login() {
  const { login, register, user, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user && token) {
      navigate('/', { replace: true });
    }
  }, [user, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        await register({
          email,
          password,
          full_name: fullName,
          role,
          employee_id: employeeId ? Number(employeeId) : null,
        });

        await login(email, password);
        navigate('/', { replace: true });
      } catch (err) {
        setError(err?.response?.data?.detail || 'Account creation failed. Please try again.');
      }

      return;
    }

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 480, p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {isRegistering ? 'Create your account' : 'People Pluse Login'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isRegistering
            ? 'Register a new account and start using People Pluse immediately.'
            : 'Enter your credentials to continue.'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          {isRegistering && (
            <>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Role"
                value="staff"
                fullWidth
                disabled
                helperText="Public registration creates a staff account"
              />
              <TextField
                label="Employee ID (optional)"
                type="number"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                fullWidth
              />
            </>
          )}

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          {isRegistering && (
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
            />
          )}

          <Button type="submit" variant="contained" sx={{ bgcolor: 'primary.main', textTransform: 'none', py: 1.2 }}>
            {isRegistering ? 'Create account' : 'Login'}
          </Button>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {isRegistering ? 'Already have an account?' : 'New user?'}
          </Typography>
          <Button
            variant="text"
            onClick={() => {
              setIsRegistering((prev) => !prev);
              setError('');
            }}
            sx={{ textTransform: 'none' }}
          >
            {isRegistering ? 'Sign in' : 'Create account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
