import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { ChevronRight, ClipboardList, ShoppingCart } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const STAGES = [
  ['purchase_request', 'Purchase Request'],
  ['request_for_quotation', 'Request for Quotation'],
  ['quotation_analysis', 'Quotation Analysis'],
  ['award', 'Award'],
  ['local_purchase_order', 'Local Purchase Order'],
  ['delivery_note', 'Delivery Note'],
  ['attendance_lists', 'Attendance Lists'],
  ['distribution_lists', 'Distribution Lists'],
  ['acknowledgement_forms', 'Acknowledgement Forms'],
  ['invoicing', 'Invoicing'],
];
const EMPTY = { request_number: '', department: '', item_description: '', quantity: 1, estimated_amount: '', supplier: '', awarded_amount: '', date_requested: '', notes: '' };
const stageLabel = (value) => STAGES.find(([key]) => key === value)?.[1] || value;
const stageColor = (index) => index < 4 ? 'primary' : index < 7 ? 'secondary' : 'success';

export default function Procurement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [transition, setTransition] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [transitionForm, setTransitionForm] = useState({ reference: '', notes: '', supplier: '', awarded_amount: '' });
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const { data } = await api.get('/procurement');
      setItems(data);
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to load procurement records.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleAdd = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/procurement', {
        ...form,
        quantity: Number(form.quantity),
        estimated_amount: Number(form.estimated_amount || 0),
        awarded_amount: Number(form.awarded_amount || 0),
        date_requested: form.date_requested || null,
      });
      setForm(EMPTY);
      setNotice({ ok: true, text: 'Purchase request created.' });
      await loadItems();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to create the request.' });
    } finally {
      setSaving(false);
    }
  };

  const openTransition = (item) => {
    setTransition(item);
    setTransitionForm({ reference: '', notes: '', supplier: item.supplier || '', awarded_amount: item.awarded_amount || '' });
  };

  const saveTransition = async () => {
    const nextStage = STAGES[STAGES.findIndex(([key]) => key === transition.stage) + 1]?.[0];
    setSaving(true);
    try {
      await api.patch(`/procurement/${transition.id}/stage`, {
        stage: nextStage,
        ...transitionForm,
        awarded_amount: transitionForm.awarded_amount === '' ? null : Number(transitionForm.awarded_amount),
      });
      setTransition(null);
      setNotice({ ok: true, text: `Advanced to ${stageLabel(nextStage)}.` });
      await loadItems();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to advance this request.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteRequest = async (item) => {
    try {
      await api.delete(`/procurement/${item.id}`);
      setNotice({ ok: true, text: `${item.request_number} deleted.` });
      await loadItems();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to delete this request.' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Procurement" subtitle="Track requests, sourcing decisions, orders, delivery and invoice references." />
      {notice && <Alert severity={notice.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice.text}</Alert>}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 1, overflowX: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 860 }}>
          {STAGES.map(([key, label], index) => (
            <Stack key={key} direction="row" alignItems="center" spacing={0.75}>
              <Chip label={label} size="small" color={stageColor(index)} variant="outlined" sx={{ fontWeight: 700 }} />
              {index < STAGES.length - 1 && <ChevronRight size={16} color="#72828A" />}
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper component="form" onSubmit={handleAdd} sx={{ p: 2.5, borderRadius: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <ShoppingCart size={19} color="#E97535" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>New Purchase Request</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Request Number" value={form.request_number} onChange={(e) => setForm({ ...form, request_number: e.target.value })} placeholder="Auto-generated if blank" size="small" />
              <TextField label="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} size="small" />
              <TextField label="Item / Description" required multiline minRows={2} value={form.item_description} onChange={(e) => setForm({ ...form, item_description: e.target.value })} size="small" />
              <Grid container spacing={1}>
                <Grid item xs={5}><TextField label="Quantity" type="number" required inputProps={{ min: 1 }} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} fullWidth size="small" /></Grid>
                <Grid item xs={7}><TextField label="Estimated Amount (UGX)" type="number" inputProps={{ min: 0 }} value={form.estimated_amount} onChange={(e) => setForm({ ...form, estimated_amount: e.target.value })} fullWidth size="small" /></Grid>
              </Grid>
              <TextField label="Supplier / Vendor" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} size="small" />
              <TextField label="Request Date" type="date" value={form.date_requested} onChange={(e) => setForm({ ...form, date_requested: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
              <TextField label="Justification / Notes" multiline minRows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} size="small" />
              <Button type="submit" variant="contained" disabled={saving} startIcon={<ClipboardList size={16} />}>{saving ? 'Saving...' : 'Create Request'}</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Procurement Register <Typography component="span" color="text.secondary">{items.length}</Typography></Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 660 }}>
              <Table stickyHeader size="small">
                <TableHead><TableRow>
                  <TableCell>Reference</TableCell><TableCell>Department / Item</TableCell><TableCell>Supplier</TableCell><TableCell align="right">Value (UGX)</TableCell><TableCell>Stage</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {loading && <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={22} /></TableCell></TableRow>}
                  {!loading && items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No purchase requests recorded.</TableCell></TableRow>}
                  {items.map((item) => {
                    const index = STAGES.findIndex(([key]) => key === item.stage);
                    return <TableRow key={item.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{item.request_number}<Typography display="block" variant="caption" color="text.secondary">Qty {item.quantity}</Typography></TableCell>
                      <TableCell sx={{ minWidth: 160 }}>{item.department}<Typography display="block" variant="body2" color="text.secondary">{item.item_description}</Typography></TableCell>
                      <TableCell>{item.supplier || 'Not selected'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{Number(item.awarded_amount || item.estimated_amount || 0).toLocaleString()}</TableCell>
                      <TableCell><Chip label={stageLabel(item.stage)} size="small" color={stageColor(index)} /></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button size="small" onClick={() => setHistoryItem(item)}>Documents</Button>
                          {index < STAGES.length - 1 && <Button size="small" variant="outlined" onClick={() => openTransition(item)}>Next stage</Button>}
                          <Button size="small" color="error" onClick={() => deleteRequest(item)}>Delete</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(transition)} onClose={() => !saving && setTransition(null)} fullWidth maxWidth="sm">
        <DialogTitle>Advance procurement stage</DialogTitle>
        <DialogContent>
          {transition && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{transition.request_number}: {stageLabel(STAGES[STAGES.findIndex(([key]) => key === transition.stage) + 1]?.[0])}</Typography>}
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <TextField label="Document / Reference Number" value={transitionForm.reference} onChange={(e) => setTransitionForm({ ...transitionForm, reference: e.target.value })} fullWidth />
            <TextField label="Supplier" value={transitionForm.supplier} onChange={(e) => setTransitionForm({ ...transitionForm, supplier: e.target.value })} fullWidth />
            {transition?.stage === 'quotation_analysis' && <TextField label="Awarded Amount (UGX)" type="number" inputProps={{ min: 0 }} value={transitionForm.awarded_amount} onChange={(e) => setTransitionForm({ ...transitionForm, awarded_amount: e.target.value })} fullWidth />}
            <TextField label="Notes" multiline minRows={2} value={transitionForm.notes} onChange={(e) => setTransitionForm({ ...transitionForm, notes: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setTransition(null)} disabled={saving}>Cancel</Button><Button variant="contained" onClick={saveTransition} disabled={saving}>Save and advance</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(historyItem)} onClose={() => setHistoryItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>Procurement documents and history</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{historyItem?.request_number} · {historyItem?.item_description}</Typography>
          <Table size="small">
            <TableHead><TableRow><TableCell>Stage</TableCell><TableCell>Document / Reference</TableCell><TableCell>Notes</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
            <TableBody>
              {(historyItem?.history || []).map((event) => <TableRow key={event.id}>
                <TableCell>{stageLabel(event.to_stage)}</TableCell>
                <TableCell>{event.reference || '—'}</TableCell>
                <TableCell>{event.notes || '—'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{event.created_at ? new Date(event.created_at).toLocaleDateString() : '—'}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setHistoryItem(null)}>Close</Button></DialogActions>
      </Dialog>
    </Container>
  );
}