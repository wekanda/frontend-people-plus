import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Card, CardContent } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0f6ba8', '#e53e3e', '#8cd24f', '#ff9a2e', '#9f7aea'];

export default function Reporting() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await api.get('/reporting/export_dashboard_summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
      } catch (err) {
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [token]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!metrics) return <Typography>No data available</Typography>;

  const hr = metrics.hr_metrics || {};
  const recruitment = metrics.recruitment_metrics || {};
  const payroll = metrics.payroll_metrics || {};
  const timesheet = metrics.timesheet_metrics || {};
  const performance = metrics.performance_metrics || {};

  // Prepare chart data
  const departmentData = Object.entries(hr.departments || {}).map(([dept, count]) => ({ name: dept, employees: count }));
  const applicationStatusData = Object.entries(recruitment.applications_status_breakdown || {}).map(([status, count]) => ({ name: status, count }));
  const performanceData = [
    { name: 'High (4+)', value: performance.high_performers },
    { name: 'Mid (2.5-4)', value: performance.mid_performers },
    { name: 'Low (<2.5)', value: performance.low_performers }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Analytics & Reporting"
        subtitle="Comprehensive HR, recruitment, payroll, and performance metrics."
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* HR Metrics Cards */}
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Total Staff</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{hr.total_employees}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>All employees on record</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Active Staff</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#16a34a' }}>{hr.active_employees}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Currently active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>On Recess</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>{hr.on_recess_count}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Staff on recess</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Exited / Turnover</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#e53e3e' }}>{hr.turnover_rate_percent}%</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Exited: {hr.exited_count ?? hr.employees_left}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gender breakdown + Project performance visuals */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Gender Breakdown</Typography>
            <Box sx={{ mb: 2 }}>
              {Object.entries(hr.gender_breakdown || {}).map(([gender, count]) => (
                <Box key={gender} sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="body2">{gender}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{count}</Typography>
                </Box>
              ))}
              {Object.keys(hr.gender_breakdown || {}).length === 0 && (
                <Typography variant="body2" color="text.secondary">No gender data recorded yet.</Typography>
              )}
            </Box>
            {Object.keys(hr.gender_breakdown || {}).length > 0 && (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={Object.entries(hr.gender_breakdown).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={85} dataKey="value">
                    {Object.keys(hr.gender_breakdown).map((entry, index) => (
                      <Cell key={`gb-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Project Performance</Typography>
            {Object.keys(hr.project_performance || {}).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={Object.entries(hr.project_performance).map(([name, p]) => ({ name, staff: p.staff, active: p.active, recess: p.recess, exited: p.exited }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#16a34a" />
                  <Bar dataKey="recess" fill="#f59e0b" />
                  <Bar dataKey="exited" fill="#e53e3e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">No project data recorded yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Department Breakdown */}
        {departmentData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Employees by Department</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="employees" fill="#1877f2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Recruitment Pipeline */}
        {applicationStatusData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Application Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38a169" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Recruitment Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Applications</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{recruitment.total_applications}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Interview Pass Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{recruitment.interview_pass_rate_percent}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Offer Acceptance</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{recruitment.offer_acceptance_rate_percent}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Open Positions</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{recruitment.open_positions}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payroll Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Total Gross Pay</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>KES {payroll.total_gross_pay?.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Total Tax</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>KES {payroll.total_tax?.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Total Deductions</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>KES {payroll.total_deductions?.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>Total Net Pay</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>KES {payroll.total_net_pay?.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance & Timesheet */}
      <Grid container spacing={3}>
        {/* Performance Distribution */}
        {performanceData.some(d => d.value > 0) && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Performance Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={performanceData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Timesheet Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Timesheet Overview</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="body2">Total Timesheets</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{timesheet.total_timesheets}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="body2">Approved</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{timesheet.approved_timesheets}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="body2">Pending</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{timesheet.pending_timesheets}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="body2">Total Hours</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{timesheet.total_hours_logged}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Overtime Timesheets</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{timesheet.overtime_timesheets}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
