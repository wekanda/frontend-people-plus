import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Paper, Typography, Box, Grid, Button, Chip, Stack, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl, TextField,
} from '@mui/material';
import { Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const WORKFLOW = [
  { key: 'draft', label: 'Populate', color: '#64748b' },
  { key: 'generated', label: 'Generate', color: '#0288d1' },
  { key: 'submitted', label: 'Submit', color: '#ed6c02' },
  { key: 'approved', label: 'Approve', color: '#2e7d32' },
];

export default function MedicalInsurance() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [state, setState] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    relationship: 'Self',
    date_of_birth: '',
    national_id: '',
    cover_type: 'Inpatient & Outpatient',
    policy_number: '',
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [benRes, stateRes, empRes] = await Promise.all([
        api.get('/api/medical-insurance/beneficiaries'),
        api.get('/api/medical-insurance/state'),
        api.get('/api/employees'),
      ]);
      setBeneficiaries(benRes.data || []);
      setState(stateRes.data || null);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setError('');
    } catch (e) {
      console.error('Medical insurance load error', e);
      setError('Unable to load medical insurance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const action = async (id, verb) => {
    try {
      const endpoint = verb === 'remove' ? '' : `/${verb}`;
      if (verb === 'remove') await api.delete(`/api/medical-insurance/beneficiaries/${id}`);
      else await api.post(`/api/medical-insurance/beneficiaries/${id}${endpoint}`);
      await loadAll();
      setError('');
    } catch (e) {
      setError(e?.response?.data?.detail || `Unable to ${verb} beneficiary.`);
    }
  };

  const populate = async () => {
    if (!form.employee_id) {
      setError('Select a staff member to populate the medical insurance beneficiary.');
      return;
    }
    try {
      await api.post('/api/medical-insurance/beneficiaries', form);
      setForm({ employee_id: '', full_name: '', relationship: 'Self', date_of_birth: '', national_id: '', cover_type: 'Inpatient & Outpatient', policy_number: '' });
      await loadAll();
      setError('');
    } catch (e) {
      setError(e?.response?.data?.detail || 'Unable to create beneficiary.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="🩺 Medical Insurance" subtitle="Populate beneficiaries, generate cover records, submit and approve." />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Workflow overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(state?.workflow || WORKFLOW.map((w) => w.key)).map((key) => {
          const def = WORKFLOW.find((w) => w.key === key) || { label: key, color: '#64748b' };
          const count = state?.counts?.[key] ?? 0;
          return (
            <Grid item xs={6} sm={3} key={key}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', color: def.color, fontWeight: 700 }}>{def.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{count}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
{/* Populate form */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>➕ Populate Beneficiary from Staff</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Staff member</InputLabel>
              <Select
                value={form.employee_id}
                label="Staff member"
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.file_code})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" label="Full name (beneficiary)" fullWidth value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" select label="Relationship" fullWidth value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
              {['Self', 'Spouse', 'Child', 'Parent', 'Other'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" label="Date of birth" type="date" fullWidth value={form.date_of_birth} InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" label="National ID" fullWidth value={form.national_id}
              onChange={(e) => setForm({ ...form, national_id: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" label="Cover type" fullWidth value={form.cover_type}
              onChange={(e) => setForm({ ...form, cover_type: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField size="small" label="Policy number" fullWidth value={form.policy_number}
              onChange={(e) => setForm({ ...form, policy_number: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" fullWidth onClick={populate} sx={{ textTransform: 'none', height: '100%' }}>
              Populate Beneficiary
            </Button>
          </Grid>
        </Grid>
      </Paper>
{/* Beneficiaries table */}
      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Beneficiaries ({beneficiaries.length})</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Relationship</TableCell>
                <TableCell>Cover</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beneficiaries.map((b) => {
                const stepIdx = WORKFLOW.findIndex((w) => w.key === b.status);
                return (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.employee_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.file_code}</Typography>
                    </TableCell>
                    <TableCell>
                      {b.full_name}
                      {b.passport_photo_url && (
                        <Box component="img" src={b.passport_photo_url} alt="passport" sx={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'cover', ml: 1, verticalAlign: 'middle' }} />
                      )}
                    </TableCell>
                    <TableCell>{b.relationship}</TableCell>
                    <TableCell>{b.cover_type}</TableCell>
                    <TableCell>
                      <Chip size="small" label={b.status} sx={{ bgcolor: `${WORKFLOW[stepIdx >= 0 ? stepIdx : 0].color}22`, color: WORKFLOW[stepIdx >= 0 ? stepIdx : 0].color, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        {b.status === 'draft' && (
                          <Button size="small" variant="outlined" onClick={() => action(b.id, 'generate')} sx={{ textTransform: 'none' }}>
                            Generate
                          </Button>
                        )}
                        {(b.status === 'draft' || b.status === 'generated') && (
                          <Button size="small" variant="outlined" color="warning" onClick={() => action(b.id, 'submit')} sx={{ textTransform: 'none' }}>
                            Submit
                          </Button>
                        )}
                        {b.status === 'submitted' && (
                          <Button size="small" variant="contained" color="success" onClick={() => action(b.id, 'approve')} sx={{ textTransform: 'none' }}>
                            Approve
                          </Button>
                        )}
                        {b.status !== 'approved' && (
                          <Button size="small" variant="text" color="error" onClick={() => action(b.id, 'remove')} sx={{ textTransform: 'none' }}>
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {beneficiaries.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>No beneficiaries yet. Populate one above.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" startIcon={<Download size={14} />} sx={{ textTransform: 'none' }}
            onClick={() => {
              const csv = ['Staff,Beneficiary,Relationship,Cover,Status'].concat(beneficiaries.map((b) =>
                `${b.employee_name || ''},${b.full_name || ''},${b.relationship || ''},${b.cover_type || ''},${b.status || ''}`)).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medical-insurance.csv'; a.click();
            }}>
            Export CSV
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}