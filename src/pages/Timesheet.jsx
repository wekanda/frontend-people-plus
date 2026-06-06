import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
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
      setLoading(false);
    }
  }, [user, token]);

  const fetchAllTimesheets = async () => {
    try {
      const res = await api.get('/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimesheets(res.data);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimesheets = async () => {
    try {
      const res = await api.get(
        `/api/timesheet/employee/${user.employee_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimesheets(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
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

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="⏱️ Timesheet"
        subtitle="Each timesheet view has its own menu and actions for a cleaner workflow."
        primaryAction={user?.employee_id ? (
          <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: '#1877f2' }}>
            Add Entry
          </Button>
        ) : null}
        menuItems={[
          { label: 'Refresh Entries', onClick: user?.employee_id ? fetchTimesheets : fetchAllTimesheets },
          { label: 'Open Leave', onClick: () => navigate('/leave') },
          { label: 'Open Staff', onClick: () => navigate('/staff') }
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {user?.employee_id && (
          <>
            {[
              { label: 'Total Hours', value: summary?.total_hours ?? 0 },
              { label: 'Overtime Hours', value: summary?.total_overtime ?? 0 },
              { label: 'Days Recorded', value: summary?.days_recorded ?? 0 },
            ].map((item) => (
              <Grid item xs={12} sm={4} key={item.label}>
                <Paper sx={{ minHeight: 150, borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#f8fbff', boxShadow: 3 }}>
                  <Typography sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', mb: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </>
        )}
        {!user?.employee_id && (user?.role === 'hr_admin' || user?.role === 'project_manager') && (
          <Grid item xs={12}>
            <Alert severity="info">Showing all timesheet entries. You can view and approve timesheets for all employees.</Alert>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ⏱️ Timesheet Entries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review hours recorded with a clean table and clear approval actions.
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead sx={{ backgroundColor: '#e8f0fe' }}>
              <TableRow>
                {!user?.employee_id && <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Employee ID</TableCell>}
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Hours Worked</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Overtime</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheets.map(ts => (
                <TableRow key={ts.id} sx={{ '&:hover': { backgroundColor: '#f5f7ff' } }}>
                  {!user?.employee_id && <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{ts.employee_id}</TableCell>}
                  <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{ts.date}</TableCell>
                  <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{ts.hours_worked}</TableCell>
                  <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>{ts.overtime_hours}</TableCell>
                  <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>
                    <Typography component="span" sx={{ color: ts.approved ? '#34a853' : '#fbbc04', fontWeight: 'bold' }}>
                      {ts.approved ? '✓ Approved' : '⏳ Pending'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottomColor: 'divider' }}>
                    {(!ts.approved && (user.role === 'hr_admin' || user.role === 'project_manager')) ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(ts.id)}>
                        Approve
                      </Button>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 3, py: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderTop: '1px solid #e5e7eb', bgcolor: '#f8fafc' }}>
          <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
            Showing {timesheets.length} timesheet entries
          </Typography>
          {user?.employee_id ? (
            <Button size="small" variant="contained" sx={{ background: '#111827', color: '#ffffff', textTransform: 'none', px: 2, py: 1, minHeight: 32, fontSize: '0.78rem' }} onClick={() => setOpenDialog(true)}>
              Add entry
            </Button>
          ) : (
            <Button size="small" variant="contained" sx={{ background: '#111827', color: '#ffffff', textTransform: 'none', px: 2, py: 1, minHeight: 32, fontSize: '0.78rem' }} onClick={fetchAllTimesheets}>
              Refresh
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
