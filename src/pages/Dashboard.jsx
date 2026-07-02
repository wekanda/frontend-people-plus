import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Stack, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Chip, TextField } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data);
        setError('');
      } catch (err) {
        console.error('Dashboard error:', err);
        const message = err?.response?.data?.detail || err?.message || 'Unable to load dashboard data.';
        setError(`Dashboard failed: ${message}`);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Notification error:', err);
      }
    };

    if (token) {
      Promise.all([fetchDashboard(), fetchNotifications()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const filteredContracts = useMemo(() => {
    if (!dashboardData?.expiring_contracts) return [];
    if (!search.trim()) return dashboardData.expiring_contracts;
    return dashboardData.expiring_contracts.filter((contract) =>
      [contract.full_name, contract.file_code, contract.project].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [dashboardData, search]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Failed to load dashboard</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {error || 'Please refresh the page or check your network connection.'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ textTransform: 'none' }}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  const topCards = [
    { label: 'Total Staff', value: dashboardData.total_staff, borderColor: '#d1d5db' },
    { label: 'Active Staff', value: dashboardData.active_staff, borderColor: '#d1d5db' },
    { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, borderColor: '#fde68a' },
    { label: 'Missing Documents', value: dashboardData.staff_with_missing_docs, borderColor: '#e9d5ff' },
  ];

  const featuredEmployee = dashboardData.featured_employee;
  const documentChecklist = featuredEmployee ? [
    { label: 'App Resume', missing: featuredEmployee.missing_app_resume },
    { label: 'Appointment Letter', missing: featuredEmployee.missing_appointment_letter },
    { label: 'Academic Docs', missing: featuredEmployee.missing_academic_docs },
    { label: 'National ID', missing: featuredEmployee.missing_national_id },
  ] : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Internal HR Dashboard"
        subtitle="Your workspace for contract tracking, staff status, payroll metrics and action alerts."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#111827', color: '#ffffff', textTransform: 'none' }} onClick={() => navigate('/upload')}>
            Upload Excel Data
          </Button>
        )}
        menuItems={[
          { label: 'Refresh dashboard', onClick: () => window.location.reload() },
          { label: 'View notifications', onClick: () => navigate('/notifications') },
          { label: 'Open staff directory', onClick: () => navigate('/staff') },
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {topCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: item.borderColor, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.8, color: '#6b7280' }}>
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Contracts Notes</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#6b7280' }}>
                Track contracts that require review soon and drill into the most urgent records.
              </Typography>
            </Box>
            <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contracts, names or project codes"
                size="small"
                sx={{ width: '100%', maxWidth: 400 }}
              />
              <Chip label={`${dashboardData.expiring_contracts.length} expiring contracts`} color="warning" />
              <Chip label={`${dashboardData.staff_with_missing_docs} missing docs`} color="error" />
            </Box>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Staff Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151' }}>File Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Contract End</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ color: '#111827' }}>{contract.full_name}</TableCell>
                        <TableCell sx={{ color: '#111827' }}>{contract.file_code}</TableCell>
                        <TableCell sx={{ color: '#111827' }}>{contract.project}</TableCell>
                        <TableCell sx={{ color: '#b91c1c', fontWeight: 600 }}>{contract.contract_end}</TableCell>
                        <TableCell>
                          <Chip label="Expiring" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        No expiring contracts match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ px: 3, py: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderTop: '1px solid #e5e7eb', bgcolor: '#f8fafc' }}>
              <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
                Showing {filteredContracts.length} of {dashboardData.expiring_contracts.length} expiring contracts
              </Typography>
              <Button size="small" variant="contained" sx={{ background: '#111827', color: '#ffffff', textTransform: 'none', px: 2, py: 1, minHeight: 32, fontSize: '0.78rem' }} onClick={() => navigate('/staff')}>
                View all
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: '#d1d5db', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Staff Profile</Typography>
              {featuredEmployee ? (
                <>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={featuredEmployee.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(featuredEmployee.full_name) + '&background=1877f2&color=fff&rounded=true'}
                        alt={featuredEmployee.full_name}
                        sx={{ width: 72, height: 72, borderRadius: '18px', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{featuredEmployee.full_name}</Typography>
                      <Typography variant="body2" color="text.secondary">{featuredEmployee.position || 'Staff'}</Typography>
                      <Typography variant="body2" color="text.secondary">{featuredEmployee.project || 'Unknown project'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">File Code: <strong>{featuredEmployee.file_code}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Contract End: <strong>{featuredEmployee.contract_end}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Status: <strong>{featuredEmployee.status || 'Active'}</strong></Typography>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Document Checklist</Typography>
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    {documentChecklist.map((doc) => (
                      <Box key={doc.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 2, bgcolor: doc.missing ? '#fef2f2' : '#ecfdf5' }}>
                        <Typography variant="body2">{doc.label}</Typography>
                        <Chip label={doc.missing ? 'Missing' : 'OK'} size="small" color={doc.missing ? 'error' : 'success'} />
                      </Box>
                    ))}
                  </Box>

                  <Button variant="contained" fullWidth sx={{ background: '#1877f2', textTransform: 'none' }} onClick={() => navigate('/staff')}>
                    View Profile
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No featured employee available right now.
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: '#d1d5db', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>Payroll Summary</Typography>
              <Typography sx={{ mb: 2, color: '#475569' }}>
                Summaries are based on the current year’s timesheet entries.
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">YTD hours</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{dashboardData.year_to_date_hours}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Pending timesheets</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{dashboardData.pending_timesheet_approvals}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Contract alerts</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{dashboardData.contracts_expiring_soon}</Typography>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
