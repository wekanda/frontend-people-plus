import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Button, Stack,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider,
  Chip, TextField,
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  BellRing as NotificationsActiveIcon,
  ChartColumn as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  FileText as SummarizeIcon,
  Gauge as AssessmentIcon,
  Cake as CakeIcon,
  Briefcase as BusinessCenterIcon,
  Star as StarIcon,
  Award as WorkspacePremiumIcon,
  FolderOpen as FolderOpenIcon,
  CalendarDays as EventNoteIcon,
  Clock as AccessTimeIcon,
  FileText as DescriptionIcon,
  TreePalm as HolidayVillageIcon,
  User as ManIcon,
  IdCard as BadgeIcon,
  ArrowRight as ArrowForwardIcon,
} from 'lucide-react';

const DASHBOARD_TABS = [
  { key: 'alerts', label: 'Smart Alerts', icon: NotificationsActiveIcon },
  { key: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
  { key: 'performance', label: 'Performance', icon: AssessmentIcon },
  { key: 'pipeline', label: 'Pipeline', icon: TrendingUpIcon },
  { key: 'reports', label: 'Reports', icon: SummarizeIcon },
];

const ALERT_ITEMS = [
  { key: 'birthdays', label: 'Birthdays', color: '#d32f2f', path: '/staff' },
  { key: 'company_anniversaries', label: 'Company anniversary', color: '#7b1fa2', path: '/staff' },
  { key: 'staff_anniversaries', label: 'Staff anniversary', color: '#2e7d32', path: '/staff' },
  { key: 'employee_of_the_month', label: 'Employee of the month', color: '#ed6c02', path: '/staff' },
  { key: 'missing_docs', label: 'Missing documents', color: '#c62828', path: '/personnel-file' },
  { key: 'end_of_project_notice', label: 'End of project notice', color: '#9c27b0', path: '/pipeline' },
  { key: 'contract_expiring', label: 'Contract expiry', color: '#ed6c02', path: '/alerts' },
  { key: 'probation_period', label: 'Probation period', color: '#0288d1', path: '/alerts' },
  { key: 'contracts_to_review', label: 'Contracts to review', color: '#7b1fa2', path: '/contracts' },
  { key: 'leave_requests_approvals', label: 'Leave requests & approvals', color: '#1565c0', path: '/leave' },
  { key: 'retirement', label: 'Retirement', color: '#6d4c41', path: '/staff' },
  { key: 'registration', label: 'Registration', color: '#00838f', path: '/staff' },
];

const ALERT_ICONS = {
  birthdays: CakeIcon,
  company_anniversaries: BusinessCenterIcon,
  staff_anniversaries: StarIcon,
  employee_of_the_month: WorkspacePremiumIcon,
  missing_docs: FolderOpenIcon,
  end_of_project_notice: TrendingUpIcon,
  contract_expiring: EventNoteIcon,
  probation_period: AccessTimeIcon,
  contracts_to_review: DescriptionIcon,
  leave_requests_approvals: HolidayVillageIcon,
  retirement: ManIcon,
  registration: BadgeIcon,
};

function MetricCard({ label, value, color }) {
  return (
    <Paper
      sx={{
        p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: color || 'text.primary' }}>{value ?? '—'}</Typography>
    </Paper>
  );
}

function AlertCard({ item, value, onOpen }) {
  const Icon = ALERT_ICONS[item.key] || NotificationsActiveIcon;
  const shown = value === undefined || value === null || value === '' ? '—' : value;
  return (
    <Paper
      onClick={onOpen}
      sx={{
        p: 1.75, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%',
        display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': { boxShadow: 3, borderColor: 'primary.main' },
      }}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: `${item.color}1a`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={22} style={{ color: item.color }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.1 }}>{shown}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.25 }}>{item.label}</Typography>
      </Box>
      <ArrowForwardIcon size={18} style={{ color: 'inherit' }} />
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
  const [section, setSection] = useState('alerts');

  const role = user?.role;
  const isHRorManager = ['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant'].includes(role);
  const isFinance = role === 'finance' || role === 'pay';
  const isStaff = role === 'staff';
  const [sub, setSub] = useState(null);
  const [events, setEvents] = useState([]);

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

    const fetchEvents = async () => {
      try {
        const res = await api.get('/api/calendar/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.events) ? res.data.events : [];
        setEvents(list);
      } catch (err) {
        console.error('Calendar events error:', err);
      }
    };

    if (token) {
      Promise.all([
        fetchDashboard(),
        fetchNotifications(),
        fetchEvents(),
        api.get('/api/subscription').then((r) => setSub(r.data || null)).catch(() => setSub(null)),
      ]).finally(() => setLoading(false));
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

  const birthdaysToday = dashboardData.birthdays_today || [];
  const upcomingBirthdays = dashboardData.upcoming_birthdays || [];
  const birthdayMessage = dashboardData.birthday_message;

  const analytics = dashboardData.analytics || {};
  const performance = dashboardData.performance_analysis || {};
  const pipeline = dashboardData.pipeline || {};
  const reports = dashboardData.reports || {};
  const smartAlerts = dashboardData.smart_alerts || {};
const renderBirthdayEntry = (entry, isToday = false) => (
    <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, bgcolor: isToday ? 'background.paper' : 'transparent', border: '1px solid', borderColor: isToday ? 'primary.light' : 'divider' }}>
      <Box
        component="img"
        src={entry.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.full_name)}&background=2563eb&color=fff&rounded=true`}
        alt={entry.full_name}
        sx={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover' }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{entry.full_name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.position || 'Team member'}</Typography>
      </Box>
      <Chip label={isToday ? 'Today' : `In ${entry.days_until}d`} size="small" color={isToday ? 'primary' : 'default'} sx={{ minWidth: 76 }} />
    </Box>
  );

  const topCards = isHRorManager
    ? [
        { label: 'Total Staff', value: dashboardData.total_staff, color: '#111827' },
        { label: 'Active Staff', value: dashboardData.active_staff, color: '#16a34a' },
        { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, color: '#d97706' },
        { label: 'Missing Documents', value: dashboardData.staff_with_missing_docs, color: '#dc2626' },
      ]
    : isFinance
      ? [
          { label: 'Total Staff', value: dashboardData.total_staff, color: '#111827' },
          { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, color: '#d97706' },
          { label: 'Pending Timesheets', value: dashboardData.pending_timesheet_approvals, color: '#2563eb' },
        ]
      : isStaff
        ? [
            { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, color: '#d97706' },
            { label: 'Missing Documents', value: dashboardData.staff_with_missing_docs, color: '#dc2626' },
            { label: 'Notifications', value: notifications.length, color: '#2563eb' },
          ]
        : [
            { label: 'Total Staff', value: dashboardData.total_staff, color: '#111827' },
            { label: 'Active Staff', value: dashboardData.active_staff, color: '#16a34a' },
            { label: 'Contracts Expiring', value: dashboardData.contracts_expiring_soon, color: '#d97706' },
          ];

  const quickActions = isStaff
    ? [['My Documents', '/documents'], ['Apply Leave', '/leave'], ['My Timesheet', '/timesheet'], ['Smart Alerts', '/alerts'], ['Calendar', '/calendar']]
    : isFinance
      ? [['Payslips', '/payslips'], ['Finance', '/finance'], ['Calendar', '/calendar'], ['Smart Alerts', '/alerts']]
      : [['Smart Alerts', '/alerts'], ['Staff', '/staff'], ['Calendar', '/calendar'], ['Leave', '/leave'], ['Timesheets', '/timesheet'], ['Reports', '/reports']];

  const primaryActionLabel = isStaff ? 'My Documents' : role === 'ceo' || role === 'ceo_assistant' ? 'Executive Reports' : isFinance ? 'Financial Management' : 'HR Tools';
  const primaryActionPath = isStaff ? '/documents' : role === 'ceo' || role === 'ceo_assistant' ? '/reports' : isFinance ? '/finance' : '/hr-tools';

  const renderAlerts = (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {ALERT_ITEMS.map((item) => (
          <Grid item xs={6} sm={4} md={3} key={item.key}>
            <AlertCard item={item} value={smartAlerts[item.key]} onOpen={() => navigate(item.path)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
const renderAnalytics = (
    <Box sx={{ p: 3 }}>
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
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.75 }}>
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
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.75 }}>
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
  );
const renderPerformance = (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><MetricCard label="Organizational rating" value={performance.organizational_rating ?? '—'} color="#7c3aed" /></Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Per unit / department rating</Typography>
            <Box sx={{ display: 'grid', gap: 0.75 }}>
              {Object.entries(performance.per_unit || {}).map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.75 }}>
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
                <Box key={p.project} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.75 }}>
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
            <Box sx={{ display: 'grid', gap: 0.5, maxHeight: 300, overflow: 'auto' }}>
              {(performance.per_staff || []).map((s) => (
                <Box key={`${s.file_code}-${s.name}`} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.5 }}>
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
  );
const renderPipeline = (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}><MetricCard label="Open vacancies" value={pipeline.open_vacancies ?? 0} color="#2563eb" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard label="Applications" value={pipeline.applications ?? 0} color="#7c3aed" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard label="Volunteer requests" value={pipeline.volunteer_requests ?? 0} color="#0d9488" /></Grid>
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
  );

  const renderReports = (
    <Box sx={{ p: 3 }}>
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
                <Box key={d.name} sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'divider', pt: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{d.frequency}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Button variant="outlined" sx={{ mt: 2, textTransform: 'none' }} endIcon={<ArrowForwardIcon size={16} />} onClick={() => navigate('/reports')}>
        Open Reports
      </Button>
    </Box>
  );
return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Dashboard"
        primaryAction={(
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={() => navigate(primaryActionPath)}>
            {primaryActionLabel}
          </Button>
        )}
        menuItems={[
          { label: 'View notifications', onClick: () => navigate('/notifications') },
          { label: 'Open staff directory', onClick: () => navigate('/staff') },
          { label: 'Refresh dashboard', onClick: () => window.location.reload() },
        ]}
      />

      {(role === 'ceo' || role === 'ceo_assistant') && (
        <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 3, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {role === 'ceo' ? 'CEO — Executive View' : 'CEO Assistant — Executive Access'}
          </Typography>
          <Box flex={1} />
          <Button size="small" variant="outlined" onClick={() => navigate('/reports')} sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)', textTransform: 'none' }}>
            Executive Reports
          </Button>
        </Paper>
      )}

      {['hr_admin', 'project_manager', 'finance', 'it_officer', 'ceo', 'ceo_assistant'].includes(role) && (
        <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Plan: {(sub?.plan || 'yearly').charAt(0).toUpperCase() + (sub?.plan || 'yearly').slice(1)} · {sub?.status || 'inactive'}
          </Typography>
          <Box flex={1} />
          <Button size="small" variant="outlined" onClick={() => navigate('/subscription')} sx={{ textTransform: 'none' }}>
            Plan &amp; Billing
          </Button>
        </Paper>
      )}

      {/* Quick actions */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        {quickActions.map(([label, path]) => (
          <Button key={path + label} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 20 }} onClick={() => navigate(path)}>
            {label}
          </Button>
        ))}
      </Stack>

      {/* Top summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {topCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <MetricCard label={item.label} value={item.value} color={item.color} />
          </Grid>
        ))}
      </Grid>

      {/* Contracts + Birthdays */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Contracts Expiring</Typography>
            </Box>
            <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contracts..." size="small" sx={{ width: '100%', maxWidth: 360 }} />
              <Chip label={`${dashboardData.expiring_contracts.length} expiring`} color="warning" />
              <Chip label={`${dashboardData.staff_with_missing_docs} missing docs`} color="error" />
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Staff Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contract End</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract, index) => (
                      <TableRow key={contract.id || index} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/staff')}>
                        <TableCell>{contract.full_name}</TableCell>
                        <TableCell>{contract.file_code}</TableCell>
                        <TableCell>{contract.project}</TableCell>
                        <TableCell sx={{ color: '#b45309', fontWeight: 600 }}>{contract.contract_end}</TableCell>
                        <TableCell><Chip label="Expiring" size="small" color="warning" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>No expiring contracts match your search.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button size="small" onClick={() => navigate('/alerts')} sx={{ textTransform: 'none' }} endIcon={<ArrowForwardIcon size={16} />}>
                View all alerts
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CakeIcon size={22} style={{ color: 'inherit' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Birthdays</Typography>
              </Box>
              {birthdaysToday.length > 0 && (
                <Box sx={{ display: 'grid', gap: 1, mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Today</Typography>
                  {birthdaysToday.map((entry) => renderBirthdayEntry(entry, true))}
                </Box>
              )}
              {upcomingBirthdays.length > 0 && (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Upcoming</Typography>
                  {upcomingBirthdays.map((entry) => renderBirthdayEntry(entry))}
                </Box>
              )}
              {birthdaysToday.length === 0 && upcomingBirthdays.length === 0 && (
                <Typography variant="body2" color="text.secondary">No birthdays this week.</Typography>
              )}
            </Paper>
<Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <EventNoteIcon size={22} style={{ color: 'inherit' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Upcoming Events</Typography>
              </Box>
              {events.length === 0 && (
                <Typography variant="body2" color="text.secondary">No upcoming events.</Typography>
              )}
              <Box sx={{ display: 'grid', gap: 1, maxHeight: 220, overflowY: 'auto' }}>
                {[...events]
                  .filter((e) => !e.start_at || new Date(e.start_at) >= new Date(new Date().setHours(0, 0, 0, 0)))
                  .sort((a, b) => new Date(a.start_at || a.start || 0) - new Date(b.start_at || b.start || 0))
                  .slice(0, 4)
                  .map((e, i) => {
                    const when = new Date(e.start_at || e.start || e.date);
                    return (
                      <Box key={`${e.id || e.title}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: 'primary.light', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.15 }}>
                            {isNaN(when.getTime()) ? '—' : when.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title || 'Event'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.event_type || ''}{e.event_type && when && !isNaN(when.getTime()) ? ' · ' : ''}{isNaN(when.getTime()) ? '' : when.toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
              <Button fullWidth variant="outlined" sx={{ mt: 1.5, textTransform: 'none' }} onClick={() => navigate('/calendar')}>
                Open Calendar
              </Button>
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <FolderOpenIcon size={22} style={{ color: 'inherit' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Personnel Files</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Staff with missing documents</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{dashboardData.staff_with_missing_docs}</Typography>
              </Box>
              <Button fullWidth variant="contained" sx={{ mt: 1, textTransform: 'none' }} onClick={() => navigate('/personnel-file')}>
                Open Personnel File Tracker
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Breakdown navigation */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                size="small"
                variant={section === tab.key ? 'contained' : 'outlined'}
                startIcon={<Icon size={18} />}
                onClick={() => setSection(tab.key)}
                sx={{ textTransform: 'none', borderRadius: 30 }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
      </Box>
      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {section === 'alerts' && renderAlerts}
        {section === 'analytics' && renderAnalytics}
        {section === 'performance' && renderPerformance}
        {section === 'pipeline' && renderPipeline}
        {section === 'reports' && renderReports}
      </Paper>
    </Container>
  );
}