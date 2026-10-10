import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, TextField, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, Alert } from '@mui/material';
import { Boxes, Tag, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const KEY = 'pp_assets';
const AQUIRE = ['Purchase', 'Donation', 'Transfer', 'Lease', 'Grant', 'Other'];
const EMPTY = {
  tag_number: '', date_acquir: '', name: '', description: '', serial_number: '',
  accessories: '', acquir_type: 'Purchase', department: '', custodian: '', last_count: '',
};

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => { try { setAssets(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { setAssets([]); } }, []);
  const save = (list) => { setAssets(list); localStorage.setItem(KEY, JSON.stringify(list)); };

  const handleAdd = () => {
    if (!form.name || !form.serial_number || !form.department) {
      setNotice({ ok: false, text: 'Asset name, serial number and department are required.' });
      return;
    }
    const tag = form.tag_number || `TAG-${String(Date.now()).slice(-6)}`;
    save([...assets, { ...form, tag_number: tag }]);
    setForm(EMPTY);
    setNotice({ ok: true, text: 'Asset added to the register.' });
  };

  const remove = (idx) => { save(assets.filter((_, i) => i !== idx)); };

  const filtered = assets.filter((a) =>
    [a.tag_number, a.name, a.description, a.serial_number, a.department, a.custodian]
      .some((v) => (v || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Asset Management" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Boxes size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Register New Asset</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Tag Number" value={form.tag_number} onChange={(e) => setForm({ ...form, tag_number: e.target.value })} fullWidth placeholder="e.g. TAG-0001" />
              <TextField label="Date of Acquisition" type="date" value={form.date_acquir} onChange={(e) => setForm({ ...form, date_acquir: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Name of Asset" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
              <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
              <TextField label="Serial Number" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} fullWidth required />
              <TextField label="Accessories" value={form.accessories} onChange={(e) => setForm({ ...form, accessories: e.target.value })} fullWidth placeholder="e.g. charger, bag, cables" />
              <TextField label="Type of Acquisition" select value={form.acquir_type} onChange={(e) => setForm({ ...form, acquir_type: e.target.value })} fullWidth>
                {AQUIRE.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
              <TextField label="Department Assigned To" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} fullWidth required />
              <TextField label="Current Custodian" value={form.custodian} onChange={(e) => setForm({ ...form, custodian: e.target.value })} fullWidth />
              <TextField label="Date of Last Physical Count" type="date" value={form.last_count} onChange={(e) => setForm({ ...form, last_count: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              {notice && <Alert severity={notice.ok ? 'success' : 'error'} onClose={() => setNotice(null)}>{notice.text}</Alert>}
              <Button variant="contained" onClick={handleAdd}>Add Asset</Button>
            </Box>
          </Paper>
        </Grid>
<Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Asset Register ({filtered.length})</Typography>
              <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." size="small" sx={{ ml: 'auto', width: '100%', maxWidth: 300 }} />
            </Box>
            <TableContainer sx={{ maxHeight: 620 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tag</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Asset</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Serial</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Acquired</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Custodian</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Count</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No assets registered.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((a, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell><Chip icon={<Tag size={14} />} label={a.tag_number} size="small" color="primary" sx={{ fontWeight: 600 }} /></TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{a.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.description}</Typography>
                        {a.accessories && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Acc: {a.accessories}</Typography>}
                      </TableCell>
                      <TableCell>{a.serial_number}</TableCell>
                      <TableCell>{a.date_acquir || '—'}</TableCell>
                      <TableCell>{a.acquir_type}</TableCell>
                      <TableCell>{a.department}</TableCell>
                      <TableCell>{a.custodian || '—'}</TableCell>
                      <TableCell>{a.last_count || '—'}</TableCell>
                      <TableCell><Button size="small" color="error" onClick={() => remove(idx)}>Delete</Button></TableCell>
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