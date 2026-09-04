import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CakeIcon from '@mui/icons-material/Cake';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Stack, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Chip, TextField } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const DASHBOARD_SECTIONS = [
  {
    id: 'analytics',
    icon: '📊',
    title: 'Analytics',
    subtitle: 'Workforce analytics at a glance.',
  },
  {
    id: 'performance',
    icon: '⭐',
    title: 'Performance Analysis',
    subtitle: 'Ratings across units, staff and projects.',
  },
  {
    id: 'pipeline',
    icon: '📈',
    title: 'Pipeline',
    subtitle: 'Vacancies, applications, internships & volunteers.',
  },
  {
    id: 'reports',
    icon: '📋',
    title: 'Reports',
    subtitle: 'Standard report types and reporting schedule.',
  },
];

function MetricCard({ label, value, color }) {
  return (
    <Paper
      sx={{
        p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role;
  const isHRorManager = role === 'hr_admin' || role === 'project_manager';
  const isFinance = role === 'finance' || role === 'pay';
  const isStaff = role === 'staff';

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

  const featuredEmployee = dashboardData.featured_employee;
  const birthdaysToday = dashboardData.birthdays_today || [];
  const upcomingBirthdays = dashboardData.upcoming_birthdays || [];
  const birthdayMessage = dashboardData.birthday_message;

  const analytics = dashboardData.analytics || {};
  const performance = dashboardData.performance_analysis || {};
  const pipeline = dashboardData.pipeline || {};
  const reports = dashboardData.reports || {};
  const smartAlerts = dashboardData.smart_alerts || {};

  const renderBirthdayEntry = (entry, isToday = false) => (
    <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: isToday ? '#ffffff' : '#f8fafc', border: '1px solid', borderColor: isToday ? '#bfdbfe' : '#e2e8f0' }}>
      <Box
        component="img"
        src={entry.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.full_name)}&background=2563eb&color=fff&rounded=true`}
        alt={entry.full_name}
        sx={{ width: 48, height: 48, borderRadius: '14px', objectFit: 'cover' }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{entry.full_name}</Typography>
        <Typography variant="body2" color="text.secondary">{entry.position || 'Team member'}</Typography>
      </Box>
      <Chip label={isToday ? 'Today' : `In ${entry.days_until}d`} size="small" color={isToday ? 'primary' : 'default'} sx={{ minWidth: 80 }} />
    </Box>
  );

  const documentChecklist = featuredEmployee ? [
    { label: 'App Resume', missing: featuredEmployee.missing_app_resume },
    { label: 'Appointment Letter', missing: featuredEmployee.missing_appointment_letter },
    { label: 'Academic Docs', missing: featuredEmployee.missing_academic_docs },
    { label: 'National ID', missing: featuredEmployee.missing_national_id },
  ] : [];

  const topCards = isHRorManager
    ? [
        { label: 'Total Staff', value: dashboardData.total_staff, borderColor: '#d1d5db' },
        { label: 'Active Staff', value: dashboardData.active_staff, borderColor: '#d1d5db' },
        { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, borderColor: '#fde68a' },
        { label: 'Missing Documents', value: dashboardData.staff_with_missing_docs, borderColor: '#e9d5ff' },
      ]
    : isFinance
      ? [
          { label: 'Total Staff', value: dashboardData.total_staff, borderColor: '#d1d5db' },
          { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, borderColor: '#fde68a' },
          { label: 'Pending Timesheets', value: dashboardData.pending_timesheet_approvals, borderColor: '#dbeafe' },
        ]
      : isStaff
        ? [
            { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, borderColor: '#fde68a' },
            { label: 'Missing Documents', value: dashboardData.staff_with_missing_docs, borderColor: '#e9d5ff' },
            { label: 'Notifications', value: notifications.length, borderColor: '#bfdbfe' },
          ]
        : [
            { label: 'Total Staff', value: dashboardData.total_staff, borderColor: '#d1d5db' },
            { label: 'Active Staff', value: dashboardData.active_staff, borderColor: '#d1d5db' },
            { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, borderColor: '#fde68a' },
          ];

  const primaryActionLabel = isStaff ? 'View your documents' : 'Upload Excel Data';
  const primaryActionHandler = () => navigate(isStaff ? '/documents' : '/upload');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Internal HR Dashboard"
        subtitle="Your workspace for contract tracking, staff status, payroll metrics and action alerts."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#111827', color: '#ffffff', textTransform: 'none' }} onClick={primaryActionHandler}>
            {primaryActionLabel}
          </Button>
        )}
        menuItems={[
          { label: 'Refresh dashboard', onClick: () => window.location.reload() },
          { label: 'View notifications', onClick: () => navigate('/notifications') },
          { label: 'Open staff directory', onClick: () => navigate('/staff') },
        ]}
      />

      {(() => {
        const actions =
          role === 'hr_admin' || role === 'project_manager'
            ? [['🔔 Smart Alerts', '/alerts'], ['📄 Forms Library', '/forms'], ['🏖️ Leave', '/leave'], ['⏱️ Timesheets', '/timesheet']]
            : isFinance
              ? [['🔔 Smart Alerts', '/alerts'], ['🧾 Payslips', '/payslips'], ['🏦 Finance', '/finance'], ['📄 Forms Library', '/forms']]
              : [['🔔 Smart Alerts', '/alerts'], ['📄 My Documents', '/documents'], ['🏖️ Apply Leave', '/leave'], ['⏱️ My Timesheet', '/timesheet']];
        return (
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
            {actions.map(([label, path]) => (
              <Button key={path + label} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 20 }} onClick={() => navigate(path)}>
                {label}
              </Button>
            ))}
          </Stack>
        );
      })()}

      {birthdayMessage && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#dbeafe', border: '1px solid #bfdbfe' }} elevation={0}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: '#2563eb', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <CakeIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                {birthdayMessage}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1e3a8a', mt: 1 }}>
                Celebrate with your teammates today. Check the birthday section for details and plans.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {topCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: item.borderColor, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.8, color: '#475569' }}>
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
            {birthdayMessage && (
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#eef2ff', border: '1px solid #c7d2fe' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: '#6366f1', display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <CakeIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>Birthday Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">Keep the team celebration on schedule.</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a' }}>{birthdayMessage}</Typography>
                <Typography variant="body2" sx={{ color: '#334155', mt: 1 }}>Today’s birthdays and upcoming staff celebrations are listed below.</Typography>
              </Paper>
            )}

            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: '#d1d5db', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Birthdays</Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>Celebrate the next two weeks of staff birthdays and stay ahead of recognition plans.</Typography>
              {birthdaysToday.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Today</Typography>
                  {birthdaysToday.map((entry) => renderBirthdayEntry(entry, true))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No birthdays today. Keep an eye on upcoming team milestones.</Typography>
              )}
              {upcomingBirthdays.length > 0 && (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Upcoming</Typography>
                  {upcomingBirthdays.map((entry) => renderBirthdayEntry(entry))}
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: '#d1d5db', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>🔔 Smart Alerts Snapshot</Typography>
              <Typography sx={{ mb: 2, color: '#475569' }}>
                Key dates and actions needing attention.
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Contracts expiring</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{dashboardData.contracts_expiring_soon}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Staff with missing docs</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: dashboardData.staff_with_missing_docs ? '#b91c1c' : 'inherit' }}>{dashboardData.staff_with_missing_docs}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Approvals pending</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{dashboardData.pending_timesheet_approvals}</Typography>
                </Box>
              </Box>
              <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#0f172a', textTransform: 'none' }} onClick={() => navigate('/alerts')}>
                Open Smart Alerts
              </Button>
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

      {/* ── Dashboard content groups ── */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Smart Alerts, Analytics, Performance Analysis, Pipeline and Reports at a glance.
      </Typography>

      <Stack spacing={4}>
        {/* Smart Alerts */}
        <Box>
          <SectionTitle icon="🔔" title="Smart Alerts" subtitle="Milestones and approvals that need attention." />
          <Grid container spacing={2}>
            {[
              { label: 'Birthdays', value: smartAlerts.birthdays, color: '#d32f2f', icon: '🎂' },
              { label: 'Company anniversary', value: smartAlerts.company_anniversaries, color: '#7b1fa2', icon: '🏢' },
              { label: 'Staff anniversary', value: smartAlerts.staff_anniversaries, color: '#2e7d32', icon: '🎉' },
              { label: 'Employee of the month', value: smartAlerts.employee_of_the_month || '—', color: '#ed6c02', icon: '🏆' },
              { label: 'Missing docs', value: smartAlerts.missing_docs, color: '#c62828', icon: '📂' },
              { label: 'End of project notice', value: smartAlerts.end_of_project_notice, color: '#9c27b0', icon: '🏗️' },
              { label: 'Contract expiring', value: smartAlerts.contract_expiring, color: '#ed6c02', icon: '📜' },
              { label: 'Probation period', value: smartAlerts.probation_period, color: '#0288d1', icon: '🧑‍🎓' },
              { label: 'Contracts to review', value: smartAlerts.contracts_to_review, color: '#7b1fa2', icon: '📝' },
              { label: 'Leave reqs & approvals', value: smartAlerts.leave_requests_approvals, color: '#1565c0', icon: '🏖️' },
              { label: 'Retirement', value: smartAlerts.retirement, color: '#6d4c41', icon: '👵' },
              { label: 'Registration', value: smartAlerts.registration, color: '#00838f', icon: '📌' },
            ].map((item) => (
              <Grid item xs={6} sm={4} md={2} key={item.label}>
                <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: item.color }}>{item.icon} {item.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Analytics */}
        <Box>
          <SectionTitle icon="📊" title="Analytics" subtitle="Total staff, employment types, recess, exits, gender and organizational spread." />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Total staff" value={analytics.total_staff ?? 0} color="#111827" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Active staff" value={analytics.active_staff ?? 0} color="#16a34a" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Permanent staff" value={analytics.permanent_staff ?? 0} color="#2563eb" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Temporary / SLA" value={analytics.temporary_staff ?? 0} color="#ed6c02" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="On recess" value={analytics.on_recess ?? 0} color="#7c3aed" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Exited staff" value={analytics.exited_staff ?? 0} color="#dc2626" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Turnover rate" value={`${analytics.turnover_rate_percent ?? 0}%`} color="#b45309" /></Grid>
            <Grid item xs={6} sm={4} md={3}><MetricCard label="Organizational" value={analytics.organizational ?? 0} color="#0f766e" /></Grid>
          </Grid>
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per project</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {Object.entries(analytics.per_project || {}).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 0.75 }}>
                      <Typography variant="body2">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                    </Box>
                  ))}
                  {Object.keys(analytics.per_project || {}).length === 0 && <Typography variant="body2" color="text.secondary">No projects recorded.</Typography>}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per unit / department</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {Object.entries(analytics.per_unit || {}).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 0.75 }}>
                      <Typography variant="body2">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                    </Box>
                  ))}
                  {Object.keys(analytics.per_unit || {}).length === 0 && <Typography variant="body2" color="text.secondary">No units recorded.</Typography>}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Gender breakdown</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(analytics.gender_breakdown || {}).map(([k, v]) => (
                <Chip key={k} label={`${k}: ${v}`} color={k.toLowerCase() === 'male' ? 'primary' : k.toLowerCase() === 'female' ? 'secondary' : 'default'} sx={{ fontWeight: 700 }} />
              ))}
            </Box>
          </Paper>
        </Box>
{/* Performance Analysis */}
        <Box>
          <SectionTitle icon="⭐" title="Performance Analysis" subtitle="Ratings across the organization, units, staff and projects." />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MetricCard label="Organizational rating" value={performance.organizational_rating ?? '—'} color="#7c3aed" />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per unit / department rating</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {Object.entries(performance.per_unit || {}).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 0.75 }}>
                      <Typography variant="body2">{k}</Typography>
                      <Chip size="small" label={v} sx={{ fontWeight: 700 }} />
                    </Box>
                  ))}
                  {Object.keys(performance.per_unit || {}).length === 0 && <Typography variant="body2" color="text.secondary">No unit ratings yet.</Typography>}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per project rating</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {(performance.per_project || []).map((p) => (
                    <Box key={p.project} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 0.75 }}>
                      <Typography variant="body2">{p.project}</Typography>
                      <Chip size="small" label={`${p.score}`} sx={{ fontWeight: 700 }} />
                    </Box>
                  ))}
                  {(performance.per_project || []).length === 0 && <Typography variant="body2" color="text.secondary">No project ratings yet.</Typography>}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per staff rating</Typography>
                <Box sx={{ display: 'grid', gap: 0.5, maxHeight: 260, overflow: 'auto' }}>
                  {(performance.per_staff || []).map((s) => (
                    <Box key={`${s.file_code}-${s.name}`} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', pt: 0.5 }}>
                      <Typography variant="body2">{s.name} <Box component="span" sx={{ color: 'text.secondary' }}>({s.file_code})</Box></Typography>
                      <Chip size="small" label={`${s.score}`} sx={{ fontWeight: 700 }} />
                    </Box>
                  ))}
                  {(performance.per_staff || []).length === 0 && <Typography variant="body2" color="text.secondary">No staff ratings yet.</Typography>}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
{/* Pipeline */}
        <Box>
          <SectionTitle icon="📈" title="Pipeline" subtitle="Vacancies, job-description building blocks, applications, internships and volunteers." />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}><MetricCard label="Open vacancies" value={pipeline.open_vacancies ?? 0} color="#2563eb" /></Grid>
            <Grid item xs={6} sm={4} md={2}><MetricCard label="Applications" value={pipeline.applications ?? 0} color="#7c3aed" /></Grid>
            <Grid item xs={6} sm={4} md={2}><MetricCard label="Volunteer requests" value={pipeline.volunteer_requests ?? 0} color="#16a34a" /></Grid>
            <Grid item xs={6} sm={4} md={2}><MetricCard label="Internship requests" value={pipeline.internship_requests ?? 0} color="#0288d1" /></Grid>
            <Grid item xs={6} sm={4} md={2}><MetricCard label="Total vacancies" value={pipeline.vacancies ?? 0} color="#dc2626" /></Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', alignItems: 'center' }}>
                <Button size="small" variant="contained" fullWidth sx={{ textTransform: 'none' }} onClick={() => navigate('/pipeline')}>Open Pipeline</Button>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Job description sections</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(pipeline.job_description_sections || []).map((s) => (
                <Chip key={s} size="small" label={s} variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Reports */}
        <Box>
          <SectionTitle icon="📋" title="Reports" subtitle="Standard report types and the schedule that keeps reporting on track." />
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Report types</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(reports.report_types || []).map((r) => (
                    <Chip key={r} label={r} variant="outlined" sx={{ fontWeight: 600 }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Report durations</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {(reports.report_durations || []).map((d) => (
                    <Box key={d.name} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{d.frequency}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{icon} {title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
  );
}
