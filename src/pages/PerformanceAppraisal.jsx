import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, Card, CardContent, Typography, Box, Grid, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert, Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function PerformanceAppraisal() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const selectedEmployee = employees.find((emp) => emp.id === Number(selectedEmployeeId));
  const [formData, setFormData] = useState({
    employee_id: '',
    position: '',
    duration_in_position: '',
    achievements: '',
    challenges: '',
    point_outs: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchAppraisals(selectedEmployeeId);
  }, [token, selectedEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setLoading(false);
    }
  };

  const fetchAppraisals = async (employeeId) => {
    try {
      if (employeeId) {
        const res = await api.get(`/api/appraisal/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppraisals(res.data);
      } else {
        const res = await api.get('/api/appraisal/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppraisals(res.data);
      }
    } catch (err) {
      console.error('Error fetching appraisals:', err);
      setAppraisals([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/api/appraisal/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Appraisal created successfully', severity: 'success' });
      setFormData({ employee_id: '', position: '', duration_in_position: '', achievements: '', challenges: '', point_outs: '' });
      if (formData.employee_id) fetchAppraisals(formData.employee_id);
    } catch (err) {
      console.error('Error creating appraisal:', err);
      setSnackbar({ open: true, message: 'Unable to create appraisal', severity: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="📝 Performance Appraisals"
        subtitle="Review and manage appraisal records with an independent action menu."
        primaryAction={(
          <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: 'primary.main', color: 'primary.contrastText', textTransform: 'none' }}>
            Create Appraisal
          </Button>
        )}
        menuItems={[
          { label: 'Refresh Appraisals', onClick: () => fetchAppraisals(selectedEmployeeId) },
          { label: 'Select New Employee', onClick: () => setSelectedEmployeeId('') },
          { label: 'View Employees', onClick: () => navigate('/staff') }
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Appraisals', value: appraisals.length },
          { label: 'Employee Filter', value: selectedEmployee ? selectedEmployee.full_name : 'All employees' },
          { label: 'Team Size', value: employees.length },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1 }}>
                {card.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <TextField
          select
          label="Select Employee"
          value={selectedEmployeeId}
          onChange={(e) => {
            setSelectedEmployeeId(e.target.value);
            fetchAppraisals(e.target.value);
          }}
          fullWidth
          sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
        >
          <MenuItem value="">All employees</MenuItem>
          {employees.map(emp => (
            <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
          ))}
        </TextField>
      </Paper>

      <Grid container spacing={3}>
        {appraisals.map(appraisal => (
          <Grid item xs={12} md={6} key={appraisal.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'divider', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'transform 0.2s ease' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {appraisal.position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appraisal.appraisal_date}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Duration:</strong> {appraisal.duration_in_position || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Achievements:</strong> {appraisal.achievements}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Challenges:</strong> {appraisal.challenges}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Point Outs:</strong> {appraisal.point_outs || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appraisals.length === 0 && (
        <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          No appraisals found for this employee.
        </Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Performance Appraisal</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label="Employee"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            fullWidth
          >
            <MenuItem value="">Select an employee</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Duration in Position"
            value={formData.duration_in_position}
            onChange={(e) => setFormData({ ...formData, duration_in_position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Achievements"
            value={formData.achievements}
            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Challenges"
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Point Outs"
            value={formData.point_outs}
            onChange={(e) => setFormData({ ...formData, point_outs: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'primary.main' }}>
            Create
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
