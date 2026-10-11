import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, TextField, Typography,
} from '@mui/material';
import { Download, Landmark, Plus, ShieldCheck, Wallet } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const FUNCTIONS = [
  { key: 'budget', label: 'Budgets', title: 'Budget Management', amountLabel: 'Approved budget' },
  { key: 'cash', label: 'Cash', title: 'Cash Management', amountLabel: 'Amount' },
  { key: 'report', label: 'Reports', title: 'Report Management', amountLabel: 'Amount' },
  { key: 'control', label: 'Controls', title: 'Internal Controls', amountLabel: 'Amount' },
  { key: 'risk', label: 'Risk', title: 'Risk Management', amountLabel: 'Amount' },
  { key: 'audit', label: 'Audit', title: 'Audit Compliance', amountLabel: 'Amount' },
];
const PAYE_EMPTY = {
  period: new Date().toISOString().slice(0, 7), due_date: '', paye_amount: '',
  salary_deductions_processed: false, monthly_return_filed: false, return_filed_date: '',
  remitted: false, remittance_date: '', penalty_amount: '', interest_amount: '',
  audit_status: 'Not scheduled', notes: '',
};
const ENTRY_EMPTY = {
  title: '', description: '', department: '', period: '', direction: '', amount: '',
  committed_amount: '', actual_amount: '', status: 'Open', due_date: '', owner: '', evidence_reference: '',
};
const fmt = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const inputDate = (value) => value ? String(value).slice(0, 10) : '';

export default function FinanceDepartment() {
  const { user } = useAuth();
  const canManage = ['hr_admin', 'finance', 'pay', 'it_officer'].includes(user?.role);
  const [tab, setTab] = useState('budget');
  const [entries, setEntries] = useState([]);
  const [payeRecords, setPayeRecords] = useState([]);
  const [entryDialog, setEntryDialog] = useState(false);
  const [payeDialog, setPayeDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingPaye, setEditingPaye] = useState(null);
  const [entryForm, setEntryForm] = useState(ENTRY_EMPTY);
  const [payeForm, setPayeForm] = useState(PAYE_EMPTY);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const [entryResponse, payeResponse] = await Promise.all([
        api.get('/finance/operations'),
        api.get('/finance/paye-compliance'),
      ]);
      setEntries(entryResponse.data);
      setPayeRecords(payeResponse.data);
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to load finance records.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const activeFunction = FUNCTIONS.find((item) => item.key === tab);
  const visibleEntries = entries.filter((entry) => entry.category === tab);
  const metrics = useMemo(() => {
    if (tab === 'paye') {
      return {
        total: payeRecords.length,
        outstanding: payeRecords.filter((record) => !record.remitted).length,
        charges: payeRecords.reduce((sum, record) => sum + Number(record.penalty_amount || 0) + Number(record.interest_amount || 0), 0),
      };
    }
    const selected = entries.filter((entry) => entry.category === tab);
    return {
      total: selected.length,
      amount: selected.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      outstanding: selected.filter((entry) => !['Complete', 'Closed'].includes(entry.status)).length,
    };
  }, [entries, payeRecords, tab]);

  const openCreateEntry = () => {
    setEditingEntry(null);
    setEntryForm(ENTRY_EMPTY);
    setEntryDialog(true);
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryForm({
      ...ENTRY_EMPTY,
      ...entry,
      due_date: inputDate(entry.due_date),
      amount: entry.amount ?? '',
      committed_amount: entry.committed_amount ?? '',
      actual_amount: entry.actual_amount ?? '',
    });
    setEntryDialog(true);
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...entryForm,
      category: tab,
      amount: Number(entryForm.amount || 0),
      committed_amount: Number(entryForm.committed_amount || 0),
      actual_amount: Number(entryForm.actual_amount || 0),
      due_date: entryForm.due_date || null,
      direction: tab === 'cash' ? entryForm.direction : null,
    };
    try {
      if (editingEntry) await api.patch(`/finance/operations/${editingEntry.id}`, payload);
      else await api.post('/finance/operations', payload);
      setEntryDialog(false);
      setNotice({ ok: true, text: editingEntry ? 'Finance record updated.' : 'Finance record added.' });
      await loadRecords();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to save this finance record.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (entry) => {
    try {
      await api.delete(`/finance/operations/${entry.id}`);
      setNotice({ ok: true, text: 'Finance record deleted.' });
      await loadRecords();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to delete this finance record.' });
    }
  };

  const openCreatePaye = () => {
    setEditingPaye(null);
    setPayeForm(PAYE_EMPTY);
    setPayeDialog(true);
  };

  const openEditPaye = (record) => {
    setEditingPaye(record);
    setPayeForm({
      ...PAYE_EMPTY,
      ...record,
      due_date: inputDate(record.due_date),
      return_filed_date: inputDate(record.return_filed_date),
      remittance_date: inputDate(record.remittance_date),
    });
    setPayeDialog(true);
  };

  const savePaye = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...payeForm,
      paye_amount: Number(payeForm.paye_amount || 0),
      penalty_amount: Number(payeForm.penalty_amount || 0),
      interest_amount: Number(payeForm.interest_amount || 0),
      due_date: payeForm.due_date || null,
      return_filed_date: payeForm.return_filed_date || null,
      remittance_date: payeForm.remittance_date || null,
    };
    try {
      if (editingPaye) await api.patch(`/finance/paye-compliance/${editingPaye.id}`, payload);
      else await api.post('/finance/paye-compliance', payload);
      setPayeDialog(false);
      setNotice({ ok: true, text: editingPaye ? 'PAYE period updated.' : 'PAYE period added.' });
      await loadRecords();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to save this PAYE period.' });
    } finally {
      setSaving(false);
    }
  };

  const deletePaye = async (record) => {
    try {
      await api.delete(`/finance/paye-compliance/${record.id}`);
      setNotice({ ok: true, text: `PAYE record for ${record.period} deleted.` });
      await loadRecords();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to delete this PAYE record.' });
    }
  };

  const downloadCsv = () => {
    const rows = tab === 'paye' ? payeRecords : visibleEntries;
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = tab === 'paye' ? 'paye-compliance.csv' : `${tab}-finance-register.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Finance Department" subtitle="Financial planning, cash oversight, reporting and statutory compliance." />
      {notice && <Alert severity={notice.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice.text}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5, borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5 }}>
        <Landmark size={20} color="#087D78" />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Financial Framework</Typography>
          <Typography variant="body2" color="text.secondary">Budget plans, cash movements, reports, controls, risks and audits are maintained as dated, attributable registers.</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {FUNCTIONS.map((item) => <Tab key={item.key} value={item.key} label={item.label} />)}
        <Tab value="paye" label="PAYE Compliance" />
      </Tabs>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        {tab === 'paye' ? <>
          <Metric label="Monthly periods" value={metrics.total} />
          <Metric label="Remittance outstanding" value={metrics.outstanding} />
          <Metric label="Penalty + interest recorded" value={`UGX ${fmt(metrics.charges)}`} />
        </> : <>
          <Metric label={`${activeFunction?.title || 'Records'}`} value={metrics.total} />
          <Metric label={activeFunction?.key === 'budget' ? 'Budget allocation' : activeFunction?.key === 'cash' ? 'Recorded cash movement' : 'Amount recorded'} value={`UGX ${fmt(metrics.amount)}`} />
          <Metric label="Open items" value={metrics.outstanding} />
        </>}
      </Stack>

      <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{tab === 'paye' ? 'PAYE Monthly Returns' : activeFunction?.title}</Typography>
            <Typography variant="caption" color="text.secondary">{tab === 'paye' ? 'Record salary deductions, monthly filings, remittances and charges.' : 'Every entry is saved with its creator and change history.'}</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="outlined" size="small" onClick={downloadCsv} startIcon={<Download size={15} />} sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>Export CSV</Button>
            {canManage && <Button variant="contained" size="small" onClick={tab === 'paye' ? openCreatePaye : openCreateEntry} startIcon={<Plus size={15} />} sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>{tab === 'paye' ? 'Add period' : 'Add record'}</Button>}
          </Stack>
        </Stack>

        <TableContainer sx={{ maxHeight: 600 }}>
          {tab === 'paye' ? <Table stickyHeader size="small">
            <TableHead><TableRow>
              <TableCell>Period</TableCell><TableCell>PAYE Amount</TableCell><TableCell>Salary Deductions</TableCell><TableCell>Return Filed</TableCell><TableCell>Remitted</TableCell><TableCell>Penalty / Interest</TableCell><TableCell>Audit</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={22} /></TableCell></TableRow>}
              {!loading && payeRecords.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>No PAYE periods recorded.</TableCell></TableRow>}
              {payeRecords.map((record) => <TableRow key={record.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{record.period}<Typography display="block" variant="caption" color="text.secondary">Due {inputDate(record.due_date) || 'not set'}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>UGX {fmt(record.paye_amount)}</TableCell>
                <TableCell><ComplianceChip value={record.salary_deductions_processed} /></TableCell>
                <TableCell><ComplianceChip value={record.monthly_return_filed} /><Typography display="block" variant="caption" color="text.secondary">{inputDate(record.return_filed_date) || ''}</Typography></TableCell>
                <TableCell><ComplianceChip value={record.remitted} /><Typography display="block" variant="caption" color="text.secondary">{inputDate(record.remittance_date) || ''}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>UGX {fmt(Number(record.penalty_amount || 0) + Number(record.interest_amount || 0))}<Typography display="block" variant="caption" color="text.secondary">Penalty {fmt(record.penalty_amount)} · Interest {fmt(record.interest_amount)}</Typography></TableCell>
                <TableCell><Chip size="small" label={record.audit_status} color={record.audit_status === 'Complete' ? 'success' : 'default'} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{canManage && <><Button size="small" onClick={() => openEditPaye(record)}>Edit</Button><Button size="small" color="error" onClick={() => deletePaye(record)}>Delete</Button></>}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table> : <Table stickyHeader size="small">
            <TableHead><TableRow>
              <TableCell>Record</TableCell><TableCell>Department / Period</TableCell>{tab === 'cash' && <TableCell>Direction</TableCell>}<TableCell align="right">Amount</TableCell>{tab === 'budget' && <><TableCell align="right">Committed</TableCell><TableCell align="right">Actual</TableCell><TableCell align="right">Balance</TableCell></>}<TableCell>Owner / Due Date</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={tab === 'budget' ? 9 : 7} align="center"><CircularProgress size={22} /></TableCell></TableRow>}
              {!loading && visibleEntries.length === 0 && <TableRow><TableCell colSpan={tab === 'budget' ? 9 : tab === 'cash' ? 7 : 6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No {activeFunction?.title.toLowerCase()} entries recorded.</TableCell></TableRow>}
              {visibleEntries.map((entry) => <TableRow key={entry.id} hover>
                <TableCell sx={{ minWidth: 180, fontWeight: 700 }}>{entry.title}<Typography display="block" variant="caption" color="text.secondary">{entry.description || entry.evidence_reference || 'No description or evidence reference'}</Typography></TableCell>
                <TableCell>{entry.department || '—'}<Typography display="block" variant="caption" color="text.secondary">{entry.period || '—'}</Typography></TableCell>
                {tab === 'cash' && <TableCell><Chip size="small" label={entry.direction || '—'} color={entry.direction === 'inflow' ? 'success' : 'warning'} /></TableCell>}
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>UGX {fmt(entry.amount)}</TableCell>
                {tab === 'budget' && <><TableCell align="right">UGX {fmt(entry.committed_amount)}</TableCell><TableCell align="right">UGX {fmt(entry.actual_amount)}</TableCell><TableCell align="right">UGX {fmt(Number(entry.amount || 0) - Number(entry.actual_amount || 0))}</TableCell></>}
                <TableCell>{entry.owner || '—'}<Typography display="block" variant="caption" color="text.secondary">{inputDate(entry.due_date) || ''}</Typography></TableCell>
                <TableCell><Chip size="small" label={entry.status} color={entry.status === 'Complete' || entry.status === 'Closed' ? 'success' : 'default'} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{canManage && <><Button size="small" onClick={() => openEditEntry(entry)}>Edit</Button><Button size="small" color="error" onClick={() => deleteEntry(entry)}>Delete</Button></>}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>}
        </TableContainer>
      </Paper>

      <Dialog open={entryDialog} onClose={() => !saving && setEntryDialog(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveEntry}>
          <DialogTitle>{editingEntry ? 'Edit finance record' : `Add ${activeFunction?.title.toLowerCase()} record`}</DialogTitle>
          <DialogContent><Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <TextField label="Title" required value={entryForm.title} onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })} fullWidth />
            <TextField label="Description / Action" multiline minRows={2} value={entryForm.description} onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })} fullWidth />
            <Grid container spacing={1.5}>
              <Grid item xs={6}><TextField label="Department" value={entryForm.department} onChange={(e) => setEntryForm({ ...entryForm, department: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Period" placeholder="e.g. FY2026 or 2026-Q1" value={entryForm.period} onChange={(e) => setEntryForm({ ...entryForm, period: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label={activeFunction?.amountLabel || 'Amount'} type="number" inputProps={{ min: 0 }} value={entryForm.amount} onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })} fullWidth /></Grid>
              {tab === 'budget' && <>
                <Grid item xs={6}><TextField label="Committed" type="number" inputProps={{ min: 0 }} value={entryForm.committed_amount} onChange={(e) => setEntryForm({ ...entryForm, committed_amount: e.target.value })} fullWidth /></Grid>
                <Grid item xs={6}><TextField label="Actual Spend" type="number" inputProps={{ min: 0 }} value={entryForm.actual_amount} onChange={(e) => setEntryForm({ ...entryForm, actual_amount: e.target.value })} fullWidth /></Grid>
              </>}
              {tab === 'cash' && <Grid item xs={6}><TextField label="Direction" select required value={entryForm.direction} onChange={(e) => setEntryForm({ ...entryForm, direction: e.target.value })} fullWidth><MenuItem value="inflow">Inflow</MenuItem><MenuItem value="outflow">Outflow</MenuItem></TextField></Grid>}
              <Grid item xs={6}><TextField label="Status" select value={entryForm.status} onChange={(e) => setEntryForm({ ...entryForm, status: e.target.value })} fullWidth>{['Open', 'In progress', 'Awaiting review', 'Complete', 'Closed', 'Overdue'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6}><TextField label="Due Date" type="date" value={entryForm.due_date} onChange={(e) => setEntryForm({ ...entryForm, due_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Owner" value={entryForm.owner} onChange={(e) => setEntryForm({ ...entryForm, owner: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Evidence / Report Reference" value={entryForm.evidence_reference} onChange={(e) => setEntryForm({ ...entryForm, evidence_reference: e.target.value })} fullWidth /></Grid>
            </Grid>
          </Stack></DialogContent>
          <DialogActions><Button onClick={() => setEntryDialog(false)} disabled={saving}>Cancel</Button><Button type="submit" variant="contained" disabled={saving}>Save record</Button></DialogActions>
        </Box>
      </Dialog>

      <Dialog open={payeDialog} onClose={() => !saving && setPayeDialog(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={savePaye}>
          <DialogTitle>{editingPaye ? 'Update PAYE period' : 'Add PAYE period'}</DialogTitle>
          <DialogContent><Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}><TextField label="Return Period" type="month" required disabled={Boolean(editingPaye)} value={payeForm.period} onChange={(e) => setPayeForm({ ...payeForm, period: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="PAYE Amount (UGX)" type="number" inputProps={{ min: 0 }} value={payeForm.paye_amount} onChange={(e) => setPayeForm({ ...payeForm, paye_amount: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Remittance Due Date" type="date" value={payeForm.due_date} onChange={(e) => setPayeForm({ ...payeForm, due_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Return Filed Date" type="date" value={payeForm.return_filed_date} onChange={(e) => setPayeForm({ ...payeForm, return_filed_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Remittance Date" type="date" value={payeForm.remittance_date} onChange={(e) => setPayeForm({ ...payeForm, remittance_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Penalty (UGX)" type="number" inputProps={{ min: 0 }} value={payeForm.penalty_amount} onChange={(e) => setPayeForm({ ...payeForm, penalty_amount: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Interest (UGX)" type="number" inputProps={{ min: 0 }} value={payeForm.interest_amount} onChange={(e) => setPayeForm({ ...payeForm, interest_amount: e.target.value })} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Compliance Audit" select value={payeForm.audit_status} onChange={(e) => setPayeForm({ ...payeForm, audit_status: e.target.value })} fullWidth>{['Not scheduled', 'Scheduled', 'In progress', 'Complete', 'Findings'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
            </Grid>
            <TextField label="Notes" multiline minRows={2} value={payeForm.notes} onChange={(e) => setPayeForm({ ...payeForm, notes: e.target.value })} fullWidth />
            <Stack direction="row" flexWrap="wrap" gap={2}>
              <ComplianceToggle label="Salary deductions processed" checked={payeForm.salary_deductions_processed} onChange={(checked) => setPayeForm({ ...payeForm, salary_deductions_processed: checked })} />
              <ComplianceToggle label="Monthly return filed" checked={payeForm.monthly_return_filed} onChange={(checked) => setPayeForm({ ...payeForm, monthly_return_filed: checked })} />
              <ComplianceToggle label="Tax remitted" checked={payeForm.remitted} onChange={(checked) => setPayeForm({ ...payeForm, remitted: checked })} />
            </Stack>
            <Alert severity="info">Enter PAYE, penalty and interest amounts from your approved payroll and tax assessment. Tax rates are not calculated by this tracker.</Alert>
          </Stack></DialogContent>
          <DialogActions><Button onClick={() => setPayeDialog(false)} disabled={saving}>Cancel</Button><Button type="submit" variant="contained" disabled={saving}>Save PAYE period</Button></DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

function Metric({ label, value }) {
  return <Box sx={{ minWidth: 150, borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5 }}>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>;
}

function ComplianceChip({ value }) {
  return <Chip size="small" label={value ? 'Done' : 'Pending'} color={value ? 'success' : 'warning'} />;
}

function ComplianceToggle({ label, checked, onChange }) {
  return <TextField select label={label} size="small" value={checked ? 'yes' : 'no'} onChange={(event) => onChange(event.target.value === 'yes')} sx={{ minWidth: 190 }}>
    <MenuItem value="yes">Complete</MenuItem><MenuItem value="no">Pending</MenuItem>
  </TextField>;
}