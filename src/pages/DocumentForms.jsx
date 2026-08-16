/**
 * Document Forms — fill official HR documents in-app, see a live A4 preview that
 * looks exactly like the original printed documents, print or download them, and
 * upload an Excel file to auto-populate every document automatically.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button, MenuItem, Chip,
  CircularProgress, Alert, Stack, Divider, IconButton, Tooltip,
} from '@mui/material';
import { Printer, Download, Upload, RefreshCcw, FileSpreadsheet, ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api';

const CATEGORY_ICON = {
  'Contracts & Letters': '📜',
  'Internships': '🎓',
  'HR & Finance': '🏦',
  'Operations': '🧾',
  'Performance': '⭐',
};

export default function DocumentForms() {
  const [forms, setForms] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [values, setValues] = useState({});
  const [preview, setPreview] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/api/form-documents')
      .then((res) => {
        const list = res.data?.forms || [];
        setForms(list);
        if (list.length) {
          setActiveKey(list[0].key);
          const defaults = {};
          list[0].fields.forEach((f) => { if (f.default) defaults[f.name] = f.default; });
          setValues(defaults);
        }
      })
      .catch((err) => console.error('Failed to load forms', err))
      .finally(() => setLoadingList(false));
  }, []);

  // Debounced live render of the chosen document.
  useEffect(() => {
    if (!activeKey) return;
    const t = setTimeout(() => {
      setRendering(true);
      api.post(`/api/form-documents/${activeKey}/render`, { values })
        .then((res) => setPreview(res.data?.html || ''))
        .catch((e) => console.error('Render failed', e))
        .finally(() => setRendering(false));
    }, 350);
    return () => clearTimeout(t);
  }, [activeKey, values]);

  const activeForm = forms.find((f) => f.key === activeKey);

  const selectForm = (key) => {
    const form = forms.find((f) => f.key === key);
    if (!form) return;
    setActiveKey(key);
    const defaults = {};
    form.fields.forEach((f) => { if (f.default) defaults[f.name] = f.default; });
    setValues((prev) => ({ ...defaults, ...prev }));
    setNotice(null);
  };

  const setField = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));
const handlePrint = () => {
    const win = iframeRef.current;
    if (win?.contentWindow) {
      win.contentWindow.focus();
      win.contentWindow.print();
    }
  };

  const handleOpenExternal = () => {
    if (!preview) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(preview);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleDownload = async () => {
    try {
      setBusy(true);
      const res = await api.post(`/api/form-documents/${activeKey}/download`, { values }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeKey}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNotice({ ok: false, text: 'Download failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setNotice(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/api/form-documents/excel-autofill', fd);
      const data = res.data || {};
      const cur = data.forms?.[activeKey];
      setValues((prev) => {
        const merged = { ...prev };
        if (cur?.values) Object.assign(merged, cur.values);
        return merged;
      });
      setNotice({
        ok: true,
        text: `Read ${data.rows || 0} row(s) from "${data.filename}". Auto-filled ${Object.keys(cur?.values || {}).length} field(s) for this document; ${Object.keys(data.forms || {}).length} document(s) populated.`,
      });
    } catch (err) {
      setNotice({ ok: false, text: err.response?.data?.detail || 'Excel upload failed' });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setBusy(true);
      const res = await api.post('/form-documents/excel-template', {}, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'form_documents_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNotice({ ok: false, text: 'Template download failed' });
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    if (!activeForm) return;
    const defaults = {};
    activeForm.fields.forEach((f) => { if (f.default) defaults[f.name] = f.default; });
    setValues(defaults);
    setNotice(null);
  };

  const renderField = (f) => {
    const common = {
      label: f.label + (f.required ? ' *' : ''),
      variant: 'outlined',
      value: values[f.name] || '',
      required: f.required,
      placeholder: f.placeholder || undefined,
      fullWidth: true,
      size: 'small',
      InputLabelProps: f.type === 'date' ? { shrink: true } : undefined,
      onChange: (ev) => setField(f.name, ev.target.value),
    };
    if (f.type === 'longtext' || f.type === 'textarea') {
      return <TextField {...common} multiline minRows={2} />;
    }
    if (f.type === 'select') {
      return (
        <TextField select {...common}>
          {f.options.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
      );
    }
    return <TextField {...common} type={f.type === 'number' ? 'number' : f.type} />;
  };
if (loadingList) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activeForm) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Forms Library" subtitle="No documents available." />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <PageHeader
        title="📄  Forms Library"
        subtitle="Fill the form on the left and watch the A4 document update live — print it exactly as TPO Uganda's official documents, or download the .doc. Upload an Excel file to auto-complete every document at once."
      />

      {notice && (
        <Alert severity={notice.ok ? 'success' : 'error'} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr 1.4fr' }, gap: 2, alignItems: 'start' }}>
        {/* ---- Document library ---- */}
        <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Documents ({forms.length})
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={busy ? <CircularProgress size={13} color="inherit" /> : <Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              sx={{ textTransform: 'none' }}
            >
              Excel Autofill
            </Button>
            <Button size="small" variant="outlined" onClick={handleDownloadTemplate} disabled={busy} sx={{ textTransform: 'none' }}>
              Template
            </Button>
          </Stack>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xlsm" style={{ display: 'none' }} onChange={handleExcelUpload} />
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
            {forms.map((f) => (
              <Box
                key={f.key}
                onClick={() => selectForm(f.key)}
                sx={{
                  p: 1.25, mb: 0.75, borderRadius: 2, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: f.key === activeKey ? 'primary.main' : 'divider',
                  bgcolor: f.key === activeKey ? 'primary.main' : 'transparent',
                  color: f.key === activeKey ? 'primary.contrastText' : 'text.primary',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {CATEGORY_ICON[f.category] || '📄'} {f.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{f.category}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
{/* ---- Fillable form ---- */}
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{activeForm.name}</Typography>
            <Tooltip title="Clear all fields">
              <IconButton size="small" onClick={resetForm}><RefreshCcw size={15} /></IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {activeForm.description}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {activeForm.fields.map((f) => renderField(f))}
          </Stack>
        </Paper>

        {/* ---- Live A4 preview ---- */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: '#1e293b', color: '#fff', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              A4 Preview {rendering && <SpinBox />}
            </Typography>
            <Stack direction="row" spacing={0.75}>
              <Button size="small" variant="contained" color="primary" startIcon={<Printer size={14} />} onClick={handlePrint} sx={{ textTransform: 'none' }}>
                Print
              </Button>
              <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={handleDownload} disabled={busy} sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                .doc
              </Button>
              <Button size="small" variant="text" startIcon={<ExternalLink size={14} />} onClick={handleOpenExternal} sx={{ textTransform: 'none', color: '#fff' }}>
                Open
              </Button>
            </Stack>
          </Box>
          <Box sx={{ height: 'calc(100vh - 200px)', minHeight: 640, overflow: 'auto', bgcolor: '#5b5f66', p: 2 }}>
            {preview ? (
              <iframe
                ref={iframeRef}
                title="A4 preview"
                srcDoc={preview}
                sandbox="allow-same-origin allow-modals"
                style={{ width: '100%', minWidth: 780, height: '1180px', border: 'none', background: '#fff', display: 'block', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              />
            ) : (
              <Box sx={{ color: '#eee', textAlign: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

function SpinBox() {
  return <span style={{ display: 'inline-flex', marginLeft: 4, verticalAlign: 'middle' }}><CircularProgress size={12} /></span>;
}