import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Chip, CircularProgress, ButtonGroup, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert, Avatar, Paper, Table,
  TableHead, TableBody, TableRow, TableCell, IconButton, Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import { X as XIcon } from 'lucide-react';

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
  const canManageEmployees = user?.role === 'hr_admin';

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
      case 'Active': return 'success';
      case 'Exited': return 'error';
      case 'On Recess': return 'warning';
      default: return 'default';
    }
  };

  const getAvatarUrl = (emp) => {
    return emp.photo_url || '';
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 4 }}>
      <PageHeader
        title="👥 Staff Directory"
        subtitle="Manage and view all employees in your organization."
        primaryAction={canManageEmployees ? (
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            ➕ Add Employee
          </Button>
        ) : undefined}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or employee code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' } }}
            InputProps={{
              startAdornment: '🔍',
            }}
          />
          <ButtonGroup variant="outlined" size="small">
            {statusOptions.map(s => (
              <Button
                key={s}
                onClick={() => setStatus(s)}
                variant={status === s ? 'contained' : 'outlined'}
                sx={{
                  textTransform: 'none',
                  fontWeight: status === s ? 600 : 500,
                  fontSize: '0.85rem',
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Staff Grid/Table Display */}
      {filteredEmployees.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="textSecondary">
            No employees found matching your search criteria.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Mobile: Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {filteredEmployees.map((emp) => (
                <Card key={emp.id} sx={{ borderRadius: 2, boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                      <Avatar
                        src={getAvatarUrl(emp)}
                        sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                      >
                        {emp.full_name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
                          {emp.full_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          {emp.file_code}
                        </Typography>
                        <Chip
                          label={emp.status || 'Active'}
                          color={getStatusColor(emp.status || 'Active')}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                      <strong>Position:</strong> {emp.position || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                      <strong>Department:</strong> {emp.project || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Location:</strong> {emp.location || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {canManageEmployees && (
                        <Button size="small" variant="outlined" sx={{ flex: 1, textTransform: 'none', fontSize: '0.8rem' }} onClick={() => handleDelete(emp.id)}>
                          Delete
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Desktop: Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id} hover sx={{ transition: 'background-color 0.2s' }}>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={getAvatarUrl(emp)}
                              sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem' }}
                            >
                              {emp.full_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {emp.full_name}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{emp.file_code}</TableCell>
                        <TableCell>{emp.position || 'N/A'}</TableCell>
                        <TableCell>{emp.project || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={emp.status || 'Active'}
                            color={getStatusColor(emp.status || 'Active')}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{emp.location || 'N/A'}</TableCell>
                        <TableCell align="right">
                          {canManageEmployees ? (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(emp.id)}
                              title="Delete employee"
                            >
                              <XIcon size={18} />
                            </IconButton>
                          ) : (
                            <Typography variant="caption" color="textSecondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderTop: '1px solid #E0E0E0', bgcolor: '#F5F7FA' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Total: {filteredEmployees.length} employees
                </Typography>
                {canManageEmployees && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setOpenDialog(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    ➕ Add Employee
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          ➕ Add New Employee
        </DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="File Code"
            value={formData.file_code}
            onChange={(e) => setFormData({ ...formData, file_code: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Department/Project"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Contact Number"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Employment Type"
            value={formData.employment_type}
            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Contract End Date"
            type="date"
            value={formData.contract_end}
            onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddEmployee}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
