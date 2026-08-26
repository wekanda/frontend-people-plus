import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Typography, Box, Paper, Stack, Button, Grid, CircularProgress, Alert, Divider } from '@mui/material';
import { Download, FileSpreadsheet, Wallet } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EXCEL_TOOLS = [
  ['PAYROLL MASTERSHEET TOOL.xlsx', 'Payroll master-sheet'],
  ['PAYSLIP TOOL.xlsx', 'Pay slip tool'],
  ['MEDICAL INSURANCE TOOL.xlsx', 'Medical insurance tool'],
  ['CONTRACT TOOL.xlsx', 'Contract tool'],
];
const BENEFITS = ['fuel_allowance|⛽ Fuel allowance', 'condolence_benefit|🕊️ Condolence', 'transport_claim|🚌 Transport allowance', 'airtime_allowance|📱 Airtime allowance', 'internet_allowance|🌐 Internet bundles'];
const CAT_Q = '/forms?category=Payroll%20%26%20Benefits';
const fmt = (v) => { try { return Number(v || 0).toLocaleString(); } catch { return v || 0; } };

export default function Finance() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/finance/reports/payslips_summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Unable to load payslip summary.'));
  }, []);
  const downloadCsv = async () => {
    try {
      const res = await api.get('/finance/reports/payslips_csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'payslips.csv');
      document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
    } catch (e) { console.error(e); }
  };
  const downloadTool = async (filename) => {
    try {
      const res = await api.get('/api/hr-resources/file', { params: { folder: 'hr_tools', filename }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); setError('Download failed. Check permissions.'); }
  };
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="🏦 Finance — Payroll & Benefits" subtitle="Payroll controls, pay slips, medical insurance and staff allowances in one place." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>🧾 Payslip Summary</Typography>
          <Button size="small" variant="outlined" onClick={downloadCsv} startIcon={<Download size={14} />} sx={{ textTransform: 'none' }}>Download CSV</Button>
        </Stack>
        {summary ? (
          <Grid container spacing={2}>
            <Metric label="Total payslips" value={summary.count} />
            <Metric label="Gross" value={fmt(summary.gross)} />
            <Metric label="Tax" value={fmt(summary.tax)} />
            <Metric label="Net" value={fmt(summary.net)} />
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
        )}
      </Paper>
      <Grid container spacing={3}>
<Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🧮 Payroll & Pay-slip Tools</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Official Excel tools used to compile payroll, pay slips & insurance.</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {EXCEL_TOOLS.map(([name, label]) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FileSpreadsheet size={20} color="#2e7d32" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={() => downloadTool(name)} sx={{ textTransform: 'none' }}>Download</Button>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🎁 Staff Benefits</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Fillable, print-ready benefit request forms.</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {BENEFITS.map((entry) => {
                const [key, label] = entry.split('|');
                return (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Wallet size={18} color="#0f6ba8" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                    </Stack>
                    <Button size="small" variant="outlined" onClick={() => navigate(CAT_Q)} sx={{ textTransform: 'none' }}>Open form</Button>
                  </Box>
                );
              })}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Button size="small" variant="contained" onClick={() => navigate(CAT_Q)} sx={{ textTransform: 'none' }}>Open full Benefits forms library</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
function Metric({ label, value }) {
  return (
    <Grid item xs={6} sm={3}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Grid>
  );
}