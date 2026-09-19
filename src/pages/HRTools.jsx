import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  Container, Typography, Box, Paper, Stack, Chip, Button, Grid,
  Tabs, Tab, CircularProgress, Alert, Divider, Card, TextField,
  IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { Download, FileSpreadsheet, FileText, Image as ImageIcon, Mail, Phone, Building2, Upload, Save, Trash2, Pencil, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function formatSize(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function currentUserRole() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').role || '';
  } catch {
    return '';
  }
}

function LetterheadPreview({ company }) {
  const name = company?.company_name || '';
  const motto = company?.motto || '';
  const bits = [company?.address, company?.contact_phone, company?.contact_email].filter(Boolean);
  const country = company?.country || '';
  let contact = bits.join('  |  ');
  if (country && !name.toLowerCase().includes(country.toLowerCase())) {
    contact = contact ? `${country}  |  ${contact}` : country;
  }
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ borderBottom: '1.5px solid #000', textAlign: 'center', pb: 1 }}>
        {company?.header_url ? (
          <Box component="img" src={company.header_url} alt="organization header" sx={{ width: '100%', display: 'block', mb: 0.5 }} />
        ) : null}
        {company?.logo_url ? (
          <Box component="img" src={company.logo_url} alt="company logo" sx={{ maxHeight: 64, maxWidth: 220, display: 'block', mx: 'auto', mb: 0.5 }} />
        ) : null}
        {name && <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>{name}</Typography>}
        {motto && <Typography variant="subtitle2" sx={{ fontStyle: 'italic' }}>{motto}</Typography>}
        {contact && <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 0.5 }}>{contact}</Typography>}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 12 }}>
        Live preview — this letterhead appears at the top of generated official documents
        (contracts, offer letters, notices, medical insurance forms, payslips etc.).
      </Typography>
    </Paper>
  );
}

export default function HRTools() {
  const [params] = useSearchParams();
  const initTab = params.get('tab') || 'excel';
  const [tab, setTab] = useState(['excel', 'documents', 'company'].includes(initTab) ? initTab : 'excel');
  const [groups, setGroups] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', motto: '', address: '', contact_email: '', contact_phone: '', country: '' });
  const isAdmin = currentUserRole() === 'hr_admin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [res, compRes] = await Promise.all([
          api.get('/api/hr-resources'),
          api.get('/api/hr-resources/company'),
        ]);
        setGroups(res.data?.groups || []);
        const c = compRes.data || null;
        setCompany(c);
        if (c) {
          setFormData({
            company_name: c.company_name || '',
            motto: c.motto || '',
            address: c.address || '',
            contact_email: c.contact_email || '',
            contact_phone: c.contact_phone || '',
            country: c.country || '',
          });
        }
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

  const downloadBuiltin = async (name) => {
    try {
      const res = await api.get(`/api/hr-resources/builtin-excel/${encodeURIComponent(name)}`, {
        params: { branded: 1 },
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
      console.error('Builtin download failed', e);
      setError('Download failed. Check your permissions.');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/api/hr-resources/company', formData);
      setCompany({ ...(company || {}), ...formData, ...res.data });
      setEditing(false);
    } catch (e) {
      setError('Could not save the organization profile.');
    } finally {
      setSaving(false);
    }
  };

  const uploadBrand = async (kind, file) => {
    if (!file) return;
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post(`/api/hr-resources/company/${kind}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const key = kind === 'logo' ? 'logo_url' : 'header_url';
      setCompany({ ...(company || {}), [key]: res.data[key] });
    } catch (e) {
      setError('Upload failed. Use a PNG/JPG/GIF/WEBP/SVG image under 10 MB.');
    }
  };

  const removeBrand = async (kind) => {
    setError('');
    try {
      await api.delete('/api/hr-resources/company/brand', { params: { which: kind } });
      const key = kind === 'logo' ? 'logo_url' : 'header_url';
      setCompany({ ...(company || {}), [key]: '' });
    } catch (e) {
      setError('Could not remove the image.');
    }
  };

  const excelFiles = (groups.find((g) => g.key === 'hr_tools') || {}).files || [];
  const builtinExcelFiles = (groups.find((g) => g.key === 'excel_tools') || {}).files || [];
  const refFiles = (groups.find((g) => g.key === 'reference_docs') || {}).files || [];
  const fillFiles = (groups.find((g) => g.key === 'fillable_forms') || {}).files || [];
  const pdfFiles = (groups.find((g) => g.key === 'pdfs') || {}).files || [];
  const wordFiles = (groups.find((g) => g.key === 'word_documents') || {}).files || [];
  const allDocFiles = [...refFiles, ...fillFiles, ...pdfFiles];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🧰 HR Tools & Resources"
        subtitle="Built-in Excel HR tools, company brand assets, email and the real document masters — all in one place."
        primaryAction={<Button variant="contained" onClick={() => downloadBuiltin('CONTRACT TOOL.xlsx')} sx={{ textTransform: 'none' }} startIcon={<Download size={15} />}>Download Contract Tool</Button>}
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="📊 Excel Tools" value="excel" />
        <Tab label="📄 Reference Documents" value="documents" />
        <Tab label="🏢 Company Profile" value="company" />
      </Tabs>

      {!loading && !company?.header_url && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="body2">
              🏢 Your organization's logo &amp; letterhead appear on every generated document.
            </Typography>
            <Button size="small" variant="outlined" onClick={() => setTab('company')} sx={{ textTransform: 'none' }}>
              Upload header &amp; logo
            </Button>
          </Box>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>}

      {!loading && tab === 'excel' && (
        <>
          <Accordion square defaultExpanded>
            <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 1, py: 1, m: 0, color: 'text.primary' }}>
              🧾 Built-in Excel HR Tools ({builtinExcelFiles.length})
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Ready-made tools bundled with the system (contracts, employee data, insurance, payslips, recruitment,
            personnel files, stores requisition). When your organization profile is set, downloads are automatically
            pre-filled with your organization name and logo.
          </Typography>
          <Grid container spacing={2}>
            {builtinExcelFiles.map((f) => (
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{f.name.replace(' TOOL.xlsx', '')}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatSize(f.size)}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Button fullWidth size="small" onClick={() => downloadBuiltin(f.name)} startIcon={<Download size={14} />} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, textTransform: 'none' }}>
                    Download (branded)
                  </Button>
                </Card>
              </Grid>
            ))}
            {builtinExcelFiles.length === 0 && <Alert severity="info">No built-in Excel HR tools available in the repository.</Alert>}
          </Grid>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />
          <Accordion square>
            <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 1, py: 1, m: 0, color: 'text.primary' }}>
              📁 Additional Excel HR Tools ({excelFiles.length})
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1.5 }}>
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
            {excelFiles.length === 0 && <Alert severity="info">No additional Excel HR tools available.</Alert>}
          </Grid>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      {!loading && tab === 'documents' && (
        <>
          {[
            ['reference_docs', '📄 Reference Documents', refFiles],
            ['word_documents', '📘 Word Master Documents', wordFiles],
            ['fillable_forms', '📝 Fillable Forms', fillFiles],
            ['pdfs', '📕 PDF Reference Files', pdfFiles],
          ].map(([folder, label, files]) => (
            <Accordion square key={folder} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 1, py: 1, m: 0, color: 'text.primary' }}>
                {label} ({files.length})
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1.5 }}>
                <Grid container spacing={2}>
                  {files.map((f) => (
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
                        <Button fullWidth size="small" onClick={() => download(folder, f.name)} startIcon={<Download size={14} />} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, textTransform: 'none' }}>
                          Download
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                  {files.length === 0 && <Alert severity="info">No files in this category.</Alert>}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      {!loading && tab === 'company' && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">🏢 {company?.company_name || 'Your Organization'}</Typography>
                {isAdmin && !editing && (
                  <Button size="small" variant="outlined" onClick={() => setEditing(true)} startIcon={<Pencil size={14} />} sx={{ textTransform: 'none' }}>
                    Edit Profile
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              {editing ? (
                <Stack spacing={1.2}>
                  <TextField size="small" label="Organization name" fullWidth value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
                  <TextField size="small" label="Motto / tagline (optional)" fullWidth value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })} />
                  <TextField size="small" label="Address" fullWidth value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  <TextField size="small" label="Contact email" fullWidth value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                  <TextField size="small" label="Contact phone" fullWidth value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                  <TextField size="small" label="Country" fullWidth value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="contained" disabled={saving} startIcon={<Save size={14} />}
                      onClick={saveProfile} sx={{ textTransform: 'none' }}>
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => { setEditing(false); setError(''); }} sx={{ textTransform: 'none' }}>Cancel</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {!isAdmin && <Alert severity="info" sx={{ mb: 1 }}>Only the HR Admin can edit the organization profile.</Alert>}
                  {company?.logo_url ? (
                    <Box sx={{ mb: 1, position: 'relative' }}>
                      <img src={company.logo_url} alt="company logo" style={{ maxHeight: 120, borderRadius: 8 }} />
                      {isAdmin && (
                        <Tooltip title="Remove logo">
                          <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => removeBrand('logo')}><Trash2 size={15} /></IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mb: 1 }}>No company logo uploaded yet.{isAdmin ? ' Upload one below.' : ''}</Alert>
                  )}
                  <Box display="flex" alignItems="center" gap={1}><Mail size={16} /><Typography variant="body2">Email: {company?.contact_email || '—'}</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1}><Phone size={16} /><Typography variant="body2">Phone: {company?.contact_phone || '—'}</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1}><Building2 size={16} /><Typography variant="body2">Address: {company?.address || '—'}</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1}><ImageIcon size={16} /><Typography variant="body2">Country: {company?.country || 'Uganda'}</Typography></Box>
                </Stack>
              )}
            </Paper>
          </Grid>

      {isAdmin && (
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>🖼️ Organization Header & Logo</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Upload your letterhead / banner image and company logo. Both appear automatically on every
                  document your organization generates (contracts, offer letters, notices, forms, branded Excel tools).
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>🏢 Letterhead / Header image</Typography>
                    {company?.header_url ? (
                      <Box sx={{ position: 'relative' }}>
                        <img src={company.header_url} alt="organization header" style={{ maxWidth: '100%', maxHeight: 90, borderRadius: 4, display: 'block' }} />
                        <Tooltip title="Remove header">
                          <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => removeBrand('header')}><Trash2 size={15} /></IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 1 }}>No header image.</Alert>
                    )}
                    <Button size="small" component="label" variant="outlined" startIcon={<Upload size={14} />} sx={{ textTransform: 'none', mt: 1 }}>
                      Upload header
                      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" hidden
                        onChange={(e) => { uploadBrand('header', e.target.files?.[0]); e.target.value = ''; }} />
                    </Button>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>🎨 Company Logo</Typography>
                    {company?.logo_url ? (
                      <Box sx={{ position: 'relative' }}>
                        <img src={company.logo_url} alt="company logo" style={{ maxWidth: 160, maxHeight: 90, borderRadius: 4, display: 'block' }} />
                        <Tooltip title="Remove logo">
                          <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => removeBrand('logo')}><Trash2 size={15} /></IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 1 }}>No logo uploaded.</Alert>
                    )}
                    <Button size="small" component="label" variant="outlined" startIcon={<Upload size={14} />} sx={{ textTransform: 'none', mt: 1 }}>
                      Upload logo
                      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" hidden
                        onChange={(e) => { uploadBrand('logo', e.target.files?.[0]); e.target.value = ''; }} />
                    </Button>
                  </Box>
                </Stack>

                <LetterheadPreview company={company} />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}