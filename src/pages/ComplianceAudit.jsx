import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Card, CardContent, Stack, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ComplianceAudit() {
  const { user, token } = useAuth();
  const [auditLog, setAuditLog] = useState([]);
  const [complianceMetrics, setComplianceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openExport, setOpenExport] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadComplianceData();
  }, [token]);

  const loadComplianceData = async () => {
    try {
      // Fetch audit logs
      const res1 = await api.get('/hr/audit_log', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLog(res1.data || []);

      // Calculate compliance metrics
      const total_employees = 100; // placeholder
      const documented_employees = auditLog.filter(log => log.action === 'document_uploaded').length;
      const consents_collected = auditLog.filter(log => log.action === 'consent_recorded').length;
      
      setComplianceMetrics({
        total_employees,
        documented_employees,
        documentation_rate: ((documented_employees / total_employees) * 100).toFixed(1),
        consents_collected,
        consent_rate: ((consents_collected / total_employees) * 100).toFixed(1),
        last_audit: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error('Error loading compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAuditLog = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Object Type', 'Details'],
      ...auditLog.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_id,
        log.action,
        log.object_type,
        log.details
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `audit_log_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setOpenExport(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Compliance & Audit"
        subtitle="Monitor compliance metrics and track all system activities."
        primaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<RefreshIcon />} sx={{ background: '#111827', textTransform: 'none' }} onClick={loadComplianceData}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setOpenExport(true)}>
              Export
            </Button>
          </Box>
        }
      />

      {/* Compliance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Documentation Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {complianceMetrics?.documentation_rate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {complianceMetrics?.documented_employees} of {complianceMetrics?.total_employees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Consent Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {complianceMetrics?.consent_rate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {complianceMetrics?.consents_collected} consents recorded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Total Employees</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {complianceMetrics?.total_employees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Last Audit</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>
                {complianceMetrics?.last_audit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Audit Log */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Activity Audit Log</Typography>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid', borderColor: 'var(--pp-divider, #e5e7eb)', backgroundColor: 'var(--pp-surface, #ffffff)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Date/Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Action</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Object Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.length > 0 ? (
                    auditLog.slice(0, 50).map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid', borderColor: 'var(--pp-divider, #e5e7eb)', backgroundColor: idx % 2 === 0 ? 'var(--pp-white, #ffffff)' : 'var(--pp-surface, #f8fafc)' }}>
                        <td style={{ padding: '12px' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>User {log.user_id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            backgroundColor: 'var(--pp-primary-2, #dbeafe)', 
                            color: 'var(--pp-primary, #1e40af)', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{log.object_type}</td>
                        <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                        No audit logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>

            {auditLog.length > 50 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Showing 50 of {auditLog.length} records. Use export to view all.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={openExport} onClose={() => setOpenExport(false)}>
        <DialogTitle>Export Audit Log</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Export {auditLog.length} audit records as CSV file.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            The file will include: Date, User, Action, Object Type, and Details columns.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExport(false)}>Cancel</Button>
          <Button variant="contained" sx={{ background: '#1877f2' }} onClick={handleExportAuditLog}>
            Export CSV
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
