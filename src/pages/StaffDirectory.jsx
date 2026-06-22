import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Chip, CircularProgress, ButtonGroup, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert, Avatar, Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

const statusOptions = ['All', 'Active', 'Exited', 'On Recess'];

export default function StaffDirectory() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    file_code: '',
    full_name: '',
    project: '',
    position: '',
    location: '',
    contact_number: '',
    employment_type: '',
    photo_url: '',
    contract_end: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [status]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = status !== 'All' ? { status } : {};
      const res = await api.get('/api/employees/', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Could not load staff records.');
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      await api.post('/api/employees/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Employee added successfully.');
      setOpenDialog(false);
      setFormData({ file_code: '', full_name: '', project: '', position: '', location: '', contact_number: '', employment_type: '', contract_end: '' });
      fetchEmployees();
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(err.response?.data?.detail || 'Unable to add employee.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await api.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Employee removed successfully.');
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Unable to remove employee.');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.file_code?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success.main';
      case 'Exited': return 'error.main';
      case 'On Recess': return 'warning.main';
      default: return '#999';
    }
  };

  const getAvatarUrl = (emp) => {
    if (emp.photo_url) return emp.photo_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=1877f2&color=fff&rounded=true`;
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="📁 Staff Directory"
        subtitle="Each employee profile can include a photo and quick actions."
        primaryAction={(
          <Button variant="contained" sx={{ background: 'primary.main', color: 'primary.contrastText' }} onClick={() => setOpenDialog(true)}>
            Add Employee
          </Button>
        )}
        menuItems={[
          { label: 'Refresh List', onClick: fetchEmployees },
          { label: 'Import from Excel', onClick: () => navigate('/upload') },
          { label: 'Clear Filters', onClick: () => { setSearch(''); setStatus('All'); } }
        ]}
      />

      <Stack spacing={3} sx={{ mb: 3 }}>
        {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ borderRadius: 3 }}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 3 }}>{error}</Alert>}
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Staff', value: employees.length },
          { label: 'Matching Results', value: filteredEmployees.length },
          { label: 'Active', value: employees.filter((emp) => emp.status === 'Active').length },
          { label: 'On Recess', value: employees.filter((emp) => emp.status === 'On Recess').length },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#f8fbff' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1 }}>
                {card.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#ffffff', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or file code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
                sx={{ flex: 1, minWidth: 250, bgcolor: 'background.paper', borderRadius: 2 }}
          />
          <ButtonGroup variant="outlined" size="small" sx={{ boxShadow: 'none' }}>
            {statusOptions.map(s => (
              <Button
                key={s}
                onClick={() => setStatus(s)}
                variant={status === s ? 'contained' : 'outlined'}
                sx={{ background: status === s ? 'primary.main' : 'background.paper', color: status === s ? 'primary.contrastText' : 'inherit', textTransform: 'none' }}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
          {(user.role === 'hr_admin' || user.role === 'project_manager') && (
            <Button variant="contained" sx={{ background: '#1877f2', color: 'white', textTransform: 'none' }} onClick={() => setOpenDialog(true)}>
              Add Employee
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {filteredEmployees.map(emp => (
          <Grid item xs={12} sm={6} md={4} key={emp.id}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3, border: '1px solid rgba(0,0,0,0.08)', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'transform 0.2s ease' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {emp.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {emp.position || 'N/A'} • {emp.file_code}
                    </Typography>
                  </Box>
                  <Avatar src={getAvatarUrl(emp)} alt={emp.full_name} sx={{ width: 64, height: 64, bgcolor: 'primary.main' }} />
                </Box>

                <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, mb: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Project</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{emp.project || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{emp.location || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={emp.status || 'Unknown'}
                    size="small"
                    sx={{ backgroundColor: getStatusColor(emp.status), color: 'white' }}
                  />
                  {emp.contract_end && (
                    <Chip
                      label={`Expires: ${emp.contract_end}`}
                      size="small"
                      variant="outlined"
                      color={new Date(emp.contract_end) < new Date() ? 'error' : 'default'}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact: {emp.contact_number || 'N/A'}
                  </Typography>
                  {(user.role === 'hr_admin' || user.role === 'project_manager') && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(emp.id)}
                      sx={{ textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredEmployees.length === 0 && (
        <Typography sx={{ mt: 4, textAlign: 'center', color: '#999' }}>
          No employees found matching your search
        </Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="File Code"
            value={formData.file_code}
            onChange={(e) => setFormData({ ...formData, file_code: e.target.value })}
            fullWidth
          />
          <TextField
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Project"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            fullWidth
          />
          <TextField
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
          />
          <TextField
            label="Contact Number"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            fullWidth
          />
          <TextField
            label="Employment Type"
            value={formData.employment_type}
            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            fullWidth
          />
          <TextField
            label="Profile Photo URL"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            fullWidth
          />
          <TextField
            label="Contract End"
            type="date"
            value={formData.contract_end}
            onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee} sx={{ background: 'primary.main', color: 'primary.contrastText' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
