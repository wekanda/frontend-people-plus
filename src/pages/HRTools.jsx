import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  Container, Typography, Box, Paper, Stack, Chip, Button, Grid,
  Tabs, Tab, CircularProgress, Alert, Divider, Card,
} from '@mui/material';
import { Download, FileSpreadsheet, FileText, Image as ImageIcon, Mail, Phone, Building2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function formatSize(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HRTools() {
  const [params] = useSearchParams();
  const initTab = params.get('tab') || 'excel';
  const [tab, setTab] = useState(['excel', 'documents', 'company'].includes(initTab) ? initTab : 'excel');
  const [groups, setGroups] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [res, compRes] = await Promise.all([
          api.get('/api/hr-resources'),
          api.get('/api/hr-resources/company'),
        ]);
        setGroups(res.data?.groups || []);
        setCompany(compRes.data || null);
      } catch (e) {
        console.error('HR tools load error', e);
        setError('Unable to load HR resources.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const download = async (folder, name) => {
    try {
      const res = await api.get('/api/hr-resources/file', {
        params: { folder, filename: name },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      setError('Download failed. Check your permissions.');
    }
  };

  const excelFiles = (groups.find((g) => g.key === 'hr_tools') || {}).files || [];
  const refFiles = (groups.find((g) => g.key === 'reference_docs') || {}).files || [];
  const fillFiles = (groups.find((g) => g.key === 'fillable_forms') || {}).files || [];
  const pdfFiles = (groups.find((g) => g.key === 'pdfs') || {}).files || [];
  const allDocFiles = [...refFiles, ...fillFiles, ...pdfFiles];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🧰 HR Tools & Resources"
        subtitle="Excel HR tools, company brand assets, email and the real TPO document masters — all in one place."
        primaryAction={<Button variant="contained" onClick={() => download('hr_tools', 'CONTRACT TOOL.xlsx')} sx={{ textTransform: 'none' }} startIcon={<Download size={15} />}>Download Contract Tool</Button>}
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="📊 Excel Tools" value="excel" />
        <Tab label="📄 Reference Documents" value="documents" />
        <Tab label="🏢 Company Profile" value="company" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>}
{!loading && tab === 'excel' && (
        <Grid container spacing={2}>
          {excelFiles.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.path}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, flex: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3} sm={4}>
                      <Box sx={{ width: 54, height: 54, borderRadius: 2, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileSpreadsheet size={30} color="#2e7d32" />
                      </Box>
                    </Grid>
                    <Grid item xs={9} sm={8}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{f.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatSize(f.size)}</Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Button fullWidth size="small" onClick={() => download('hr_tools', f.name)} startIcon={<Download size={14} />} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, textTransform: 'none' }}>
                  Download
                </Button>
              </Card>
            </Grid>
          ))}
          {excelFiles.length === 0 && <Alert severity="info">No Excel HR tools available in the repository.</Alert>}
        </Grid>
      )}

      {!loading && tab === 'documents' && (
        <Grid container spacing={2}>
          {allDocFiles.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.path}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, flex: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3} sm={4}>
                      <Box sx={{ width: 54, height: 54, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={30} color="#1565c0" />
                      </Box>
                    </Grid>
                    <Grid item xs={9} sm={8}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{f.name}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip label={(f.ext || '').toUpperCase()} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">{formatSize(f.size)}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
                <Button fullWidth size="small" onClick={() => download(f.folder, f.name)} startIcon={<Download size={14} />} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, textTransform: 'none' }}>
                  Download
                </Button>
              </Card>
            </Grid>
          ))}
          {allDocFiles.length === 0 && <Alert severity="info">No reference documents available.</Alert>}
        </Grid>
      )}

      {!loading && tab === 'company' && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>🏢 {company?.company_name || 'TPO Uganda'}</Typography>
          <Divider sx={{ mb: 2 }} />
          {company?.logo_url ? (
            <Box sx={{ mb: 2 }}>
              <img src={company.logo_url} alt="company logo" style={{ maxHeight: 120, borderRadius: 8 }} />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>No company logo uploaded yet. HR Admin can set it via API.</Alert>
          )}
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1}><Mail size={16} /><Typography variant="body2">Email: {company?.contact_email || '—'}</Typography></Box>
            <Box display="flex" alignItems="center" gap={1}><Phone size={16} /><Typography variant="body2">Phone: {company?.contact_phone || '—'}</Typography></Box>
            <Box display="flex" alignItems="center" gap={1}><Building2 size={16} /><Typography variant="body2">Address: {company?.address || '—'}</Typography></Box>
            <Box display="flex" alignItems="center" gap={1}><ImageIcon size={16} /><Typography variant="body2">Country: {company?.country || 'Uganda'}</Typography></Box>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}