import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import api from '../api';

export default function Compliance() {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openExport, setOpenExport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/hr/audit_log');
        setAuditLog(response.data || []);
      } catch (err) {
        console.error('Failed to load audit log:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const handleExport = () => {
    const csv = auditLog.map(log => `${log.id},${log.action},${log.timestamp}`).join('\n');
    const blob = new Blob(['ID,Action,Timestamp\n' + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    setOpenExport(false);
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Compliance & Audit</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>Audit log and compliance metrics</Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenExport(true)}>Export CSV</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Compliance Metrics</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box>
              <Typography sx={{ color: '#666', fontSize: 12 }}>Documentation Rate</Typography>
              <Typography variant="h6">75%</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#666', fontSize: 12 }}>Consent Rate</Typography>
              <Typography variant="h6">92%</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#666', fontSize: 12 }}>Total Employees</Typography>
              <Typography variant="h6">100</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#666', fontSize: 12 }}>Last Audit</Typography>
              <Typography variant="h6">{new Date().toLocaleDateString()}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Audit Log ({auditLog.length})</Typography>
          {auditLog.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.slice(0, 10).map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{log.id || '-'}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{log.action || '-'}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{log.timestamp || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography sx={{ color: '#999', py: 4, textAlign: 'center' }}>No audit logs available</Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={openExport} onClose={() => setOpenExport(false)}>
        <DialogTitle>Export Audit Log</DialogTitle>
        <DialogContent>
          <Typography>Export {auditLog.length} records as CSV?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExport(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
