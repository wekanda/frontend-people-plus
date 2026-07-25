import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function Timesheet() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours_worked: 8,
    overtime_hours: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?.employee_id) {
      fetchTimesheets();
      fetchSummary();
    } else if (user?.role === 'hr_admin' || user?.role === 'project_manager') {
      fetchAllTimesheets();
    } else if (user) {
      setError('No employee record associated with this account. Please contact HR.');
      setLoading(false);
    }
  }, [user, token]);

  const fetchAllTimesheets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimesheets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setError(err.response?.data?.detail || 'Failed to load timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimesheets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setError(err.response?.data?.detail || 'Failed to load your timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/api/timesheet/summary/${user.employee_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(
        '/api/timesheet/entry',
        { employee_id: user.employee_id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      if (user.employee_id) {
        fetchTimesheets();
        fetchSummary();
      } else {
        fetchAllTimesheets();
      }
      setSnackbar({ open: true, message: 'Timesheet entry saved', severity: 'success' });
    } catch (err) {
      console.error('Error creating timesheet:', err);
      setSnackbar({ open: true, message: 'Unable to save timesheet entry', severity: 'error' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/timesheet/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (user.employee_id) {
        fetchTimesheets();
      } else {
        fetchAllTimesheets();
      }
      setSnackbar({ open: true, message: 'Timesheet approved', severity: 'success' });
    } catch (err) {
      console.error('Error approving timesheet:', err);
      setSnackbar({ open: true, message: 'Unable to approve entry', severity: 'error' });
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 4 }}>
      <PageHeader
        title="⏱️ Timesheet"
        subtitle="Track and manage time entries with clear approval workflow."
        primaryAction={user?.employee_id ? (
          <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            ➕ Add Entry
          </Button>
        ) : null}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Summary Cards for Staff */}
      {user?.employee_id && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Hours', value: summary?.total_hours ?? 0, color: 'primary' },
            { label: 'Overtime Hours', value: summary?.total_overtime ?? 0, color: 'info' },
            { label: 'Days Recorded', value: summary?.days_recorded ?? 0, color: 'success' },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.label}>
              <Paper sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${item.color === 'primary' ? '#0D47A1' : item.color === 'info' ? '#1976D2' : '#4CAF50'} 0%, ${item.color === 'primary' ? '#1565C0' : item.color === 'info' ? '#2196F3' : '#66BB6A'} 100%)`, color: 'white', boxShadow: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {!user?.employee_id && (user?.role === 'hr_admin' || user?.role === 'project_manager') && (
        <Alert severity="info" sx={{ mb: 3 }}>
          ℹ️ Showing all timesheet entries. You can view and approve timesheets for all employees.
        </Alert>
      )}

      {/* Timesheets Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
        <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid #E0E0E0`, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            ⏱️ Timesheet Entries
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {timesheets.length} entries recorded
          </Typography>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                <TableRow>
                  {!user?.employee_id && <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Employee</TableCell>}
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Overtime</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={!user?.employee_id ? 6 : 5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No timesheet entries found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  timesheets.map(ts => (
                    <TableRow key={ts.id} hover sx={{ transition: 'background-color 0.2s' }}>
                      {!user?.employee_id && <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ts.employee_id}</TableCell>}
                      <TableCell>{ts.date}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{ts.hours_worked}</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{ts.overtime_hours}</TableCell>
                      <TableCell>
                        <Chip
                          label={ts.approved ? '✓ Approved' : '⏳ Pending'}
                          color={ts.approved ? 'success' : 'warning'}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {!ts.approved && (user?.role === 'hr_admin' || user?.role === 'project_manager') ? (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handleApprove(ts.id)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderTop: '1px solid #E0E0E0', bgcolor: '#F5F7FA' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Total: {timesheets.length} entries
          </Typography>
          {(user?.employee_id || user?.role === 'hr_admin' || user?.role === 'project_manager') && (
          <Button
            size="small"
            variant="contained"
            onClick={user?.employee_id ? () => setOpenDialog(true) : fetchAllTimesheets}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {user?.employee_id ? '➕ Add Entry' : '🔄 Refresh'}
          </Button>
        )}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Timesheet Entry</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hours Worked"
            type="number"
            value={formData.hours_worked}
            onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Overtime Hours"
            type="number"
            value={formData.overtime_hours}
            onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: '#1877f2' }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
