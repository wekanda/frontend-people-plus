import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Card, CardContent, Typography, Box, Button, TextField,
  Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Chip, Snackbar,
  Alert
} from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function LeaveManagement() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [balance, setBalance] = useState({ remaining: 0, used: 0, total_allowed: 0 });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    type: 'Annual Leave'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchLeaves();
    }
  }, [user, token]);

  const fetchBalance = async () => {
    if (!user?.employee_id) return;
    try {
      const res = await api.get(
        `/api/leave/balance/${user.employee_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(res.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const params = user.role === 'hr_admin' || user.role === 'project_manager'
        ? {}
        : { employee_id: user.employee_id };
      const res = await api.get('/api/leave/requests', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(
        '/api/leave/request',
        { employee_id: user.employee_id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
      fetchBalance();
      fetchLeaves();
    } catch (err) {
      console.error('Error creating leave request:', err);
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Error submitting leave request', severity: 'error' });
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      await api.put(`/api/leave/${action}/${requestId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: `Leave ${action}ed successfully`, severity: 'success' });
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      console.error(`Error ${action}ing leave:`, err);
      setSnackbar({ open: true, message: err.response?.data?.detail || `Unable to ${action} leave`, severity: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="🏖️ Leave Management"
        subtitle="Manage leave requests with a dedicated menu for actions and approvals."
        primaryAction={(
          <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: 'primary.main' }}>
            Request Leave
          </Button>
        )}
        menuItems={[
          { label: 'Refresh Data', onClick: fetchLeaves },
          { label: 'Go to Staff Directory', onClick: () => navigate('/staff') },
          { label: 'Open Timesheet', onClick: () => navigate('/timesheet') }
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Allowed', value: balance.total_allowed },
          { label: 'Used Days', value: balance.used },
          { label: 'Remaining Days', value: balance.remaining },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper sx={{ p: 3, minHeight: 150, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6, mb: 1 }}>
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, minHeight: 150, borderRadius: 3, display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenDialog(true)}
              sx={{ background: 'primary.main', height: '100%', fontSize: '16px', fontWeight: 'bold', textTransform: 'none' }}
            >
              Request Leave
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            📅 Leave Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review leave activity with clean row spacing and actions.
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead sx={{ backgroundColor: theme => theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave.id} sx={{ '&:hover': { backgroundColor: theme => theme.palette.action.hover } }}>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{leave.employee_id}</TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{leave.start_date}</TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{leave.end_date}</TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{leave.days}</TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{leave.type}</TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>
                      <Chip
                        label={leave.status}
                        color={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>
                      {leave.status === 'Pending' && (user.role === 'hr_admin' || user.role === 'project_manager') ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button size="small" variant="contained" color="success" onClick={() => handleAction(leave.id, 'approve')}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleAction(leave.id, 'reject')}>
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No leave requests yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 3, py: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
            Showing {leaves.length} leave requests
          </Typography>
          <Button size="small" variant="contained" sx={{ background: 'text.primary', color: 'primary.contrastText', textTransform: 'none', px: 2, py: 1, minHeight: 32, fontSize: '0.78rem' }} onClick={() => setOpenDialog(true)}>
            New request
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            label="Leave Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Unpaid Leave</option>
            <option>Other</option>
          </TextField>
          <TextField
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            fullWidth
            multiline
            rows={3}
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
