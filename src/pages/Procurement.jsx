import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, TextField, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, Alert } from '@mui/material';
import { ClipboardList, ShoppingCart, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const STAGES = [
  'Purchase Request', 'Request for Quotation', 'Quotation Analysis', 'Award',
  'Local Purchase Order', 'Delivery Note', 'Attendance Lists', 'Distribution Lists',
  'Acknowledgement Forms', 'Invoicing',
];

const KEY = 'pp_procurement_items';
const EMPTY = { number: '', department: '', item: '', supplier: '', amount: '', stage: 0, date: '' };

function stageColor(i) { return i < 4 ? 'primary' : i < 7 ? 'secondary' : 'success'; }

export default function Procurement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState(null);

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { setItems([]); } }, []);

  const save = (list) => { setItems(list); localStorage.setItem(KEY, JSON.stringify(list)); };

  const handleAdd = () => {
    if (!form.item || !form.department) { setNotice({ ok: false, text: 'Item and department are required.' }); return; }
    const number = form.number || `PR-${String(Date.now()).slice(-6)}`;
    save([...items, { ...form, number, stage: Number(form.stage) || 0, amount: form.amount || '' }]);
    setForm(EMPTY);
    setNotice({ ok: true, text: 'Procurement request added.' });
  };

  const advance = (idx) => { const list = [...items]; if (list[idx].stage < STAGES.length - 1) list[idx].stage += 1; save(list); };
  const remove = (idx) => { save(items.filter((_, i) => i !== idx)); };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Procurement" />

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {STAGES.map((stage, i) => (
            <Stack key={stage} direction="row" alignItems="center" spacing={0.5}>
              <Chip label={stage} size="medium" color={stageColor(i)} sx={{ fontWeight: 700 }} />
              {i < STAGES.length - 1 && <ChevronRight size={16} style={{ color: '#9ea7b3' }} />}
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <ShoppingCart size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>New Procurement Request</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Request Number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} fullWidth placeholder="e.g. PR-000123" />
              <TextField label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} fullWidth required />
              <TextField label="Item / Description" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} fullWidth required multiline minRows={2} />
              <TextField label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} fullWidth />
              <TextField label="Amount (UGX)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth />
              <TextField label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Current Stage" select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} fullWidth>
                {STAGES.map((s, i) => <MenuItem key={s} value={i}>{s}</MenuItem>)}
              </TextField>
              {notice && <Alert severity={notice.ok ? 'success' : 'error'} onClose={() => setNotice(null)}>{notice.text}</Alert>}
              <Button variant="contained" onClick={handleAdd}>Add Request</Button>
            </Box>
          </Paper>
        </Grid>
<Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Procurement Register ({items.length})</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ref</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Stage</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No procurement requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((it, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{it.number}</TableCell>
                      <TableCell>{it.department}</TableCell>
                      <TableCell>{it.item}</TableCell>
                      <TableCell>{it.supplier || '—'}</TableCell>
                      <TableCell>{it.amount ? Number(it.amount).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        <Chip label={STAGES[it.stage]} size="small" color={stageColor(it.stage)} sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" disabled={it.stage >= STAGES.length - 1} onClick={() => advance(idx)}>Next</Button>
                          <Button size="small" color="error" onClick={() => remove(idx)}>Delete</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}