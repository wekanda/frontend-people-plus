import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Boxes, Pencil, Plus, Tag } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const ACQUISITION_TYPES = ['Purchase', 'Donation', 'Transfer', 'Lease', 'Grant', 'Other'];
const EMPTY = {
  tag_number: '', acquisition_date: '', name: '', description: '', serial_number: '',
  accessories: '', acquisition_type: 'Purchase', department: '', custodian: '',
  received_by: '', location: '', condition: 'Good', utilization_status: 'In use',
  asset_status: 'Active', last_count_date: '',
};
const dateValue = (value) => value ? String(value).slice(0, 10) : '';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editForm, setEditForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data);
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to load the asset register.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const metrics = useMemo(() => ({
    active: assets.filter((asset) => asset.asset_status === 'Active').length,
    underused: assets.filter((asset) => ['Underused', 'Idle'].includes(asset.utilization_status)).length,
    countDue: assets.filter((asset) => !asset.last_count_date || (Date.now() - new Date(asset.last_count_date).getTime()) > 180 * 86400000).length,
  }), [assets]);

  const filtered = assets.filter((asset) =>
    [asset.tag_number, asset.name, asset.description, asset.serial_number, asset.department, asset.custodian, asset.received_by, asset.location]
      .some((value) => (value || '').toLowerCase().includes(search.toLowerCase())));

  const createAsset = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/assets', {
        ...form,
        acquisition_date: form.acquisition_date || null,
        last_count_date: form.last_count_date || null,
      });
      setForm(EMPTY);
      setNotice({ ok: true, text: 'Asset added to the register.' });
      await loadAssets();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to register this asset.' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (asset) => {
    setEditing(asset);
    setEditForm({
      ...EMPTY,
      ...asset,
      acquisition_date: dateValue(asset.acquisition_date),
      last_count_date: dateValue(asset.last_count_date),
    });
  };

  const updateAsset = async () => {
    setSaving(true);
    try {
      await api.patch(`/assets/${editing.id}`, {
        ...editForm,
        acquisition_date: editForm.acquisition_date || null,
        last_count_date: editForm.last_count_date || null,
      });
      setEditing(null);
      setNotice({ ok: true, text: 'Asset tracking details updated.' });
      await loadAssets();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to update this asset.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAsset = async (asset) => {
    try {
      await api.delete(`/assets/${asset.id}`);
      setNotice({ ok: true, text: `${asset.tag_number} removed from the register.` });
      await loadAssets();
    } catch (error) {
      setNotice({ ok: false, text: error.response?.data?.detail || 'Unable to remove this asset.' });
    }
  };

  const renderFields = (values, setValues, compact = false) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : '1fr', gap: 1.25 }}>
      <TextField label="Tag Number" value={values.tag_number || ''} onChange={(e) => setValues({ ...values, tag_number: e.target.value })} placeholder="Auto-generated if blank" size="small" />
      <TextField label="Name of Asset" required value={values.name || ''} onChange={(e) => setValues({ ...values, name: e.target.value })} size="small" />
      <TextField label="Description" multiline minRows={2} value={values.description || ''} onChange={(e) => setValues({ ...values, description: e.target.value })} size="small" />
      <TextField label="Serial Number" required value={values.serial_number || ''} onChange={(e) => setValues({ ...values, serial_number: e.target.value })} size="small" />
      <TextField label="Accessories" value={values.accessories || ''} onChange={(e) => setValues({ ...values, accessories: e.target.value })} size="small" />
      <TextField label="Type of Acquisition" select value={values.acquisition_type || 'Purchase'} onChange={(e) => setValues({ ...values, acquisition_type: e.target.value })} size="small">
        {ACQUISITION_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
      </TextField>
      <TextField label="Date of Acquisition" type="date" value={values.acquisition_date || ''} onChange={(e) => setValues({ ...values, acquisition_date: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
      <TextField label="Department Assigned To" required value={values.department || ''} onChange={(e) => setValues({ ...values, department: e.target.value })} size="small" />
      <TextField label="Current Custodian" value={values.custodian || ''} onChange={(e) => setValues({ ...values, custodian: e.target.value })} size="small" />
      <TextField label="Received By" value={values.received_by || ''} onChange={(e) => setValues({ ...values, received_by: e.target.value })} size="small" />
      <TextField label="Location" value={values.location || ''} onChange={(e) => setValues({ ...values, location: e.target.value })} size="small" />
      <TextField label="Condition" select value={values.condition || 'Good'} onChange={(e) => setValues({ ...values, condition: e.target.value })} size="small">
        {['Good', 'Fair', 'Poor'].map((condition) => <MenuItem key={condition} value={condition}>{condition}</MenuItem>)}
      </TextField>
      <TextField label="Utilization" select value={values.utilization_status || 'In use'} onChange={(e) => setValues({ ...values, utilization_status: e.target.value })} size="small">
        {['In use', 'Underused', 'Idle', 'Under maintenance'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
      </TextField>
      <TextField label="Asset Status" select value={values.asset_status || 'Active'} onChange={(e) => setValues({ ...values, asset_status: e.target.value })} size="small">
        {['Active', 'Retired', 'Missing'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
      </TextField>
      <TextField label="Date of Last Physical Count" type="date" value={values.last_count_date || ''} onChange={(e) => setValues({ ...values, last_count_date: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Asset Management" subtitle="Identify, assign, count and track organizational assets." />
      {notice && <Alert severity={notice.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice.text}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        {[['Active assets', metrics.active], ['Underused / idle', metrics.underused], ['Physical count due', metrics.countDue]].map(([label, value]) => (
          <Box key={label} sx={{ minWidth: 150, borderLeft: '3px solid', borderColor: label === 'Underused / idle' ? 'secondary.main' : 'primary.main', pl: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper component="form" onSubmit={createAsset} sx={{ p: 2.5, borderRadius: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Boxes size={19} color="#087D78" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Register Asset</Typography>
            </Stack>
            {renderFields(form, setForm)}
            <Button type="submit" variant="contained" disabled={saving} startIcon={<Plus size={16} />} sx={{ mt: 1.5, width: '100%' }}>{saving ? 'Saving...' : 'Add Asset'}</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Asset Register <Typography component="span" color="text.secondary">{filtered.length}</Typography></Typography>
              <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tag, asset, custodian..." size="small" sx={{ width: { xs: '100%', sm: 280 } }} />
            </Stack>
            <TableContainer sx={{ maxHeight: 690 }}>
              <Table stickyHeader size="small">
                <TableHead><TableRow>
                  <TableCell>Tag / Asset</TableCell><TableCell>Acquisition</TableCell><TableCell>Department / Location</TableCell><TableCell>Custody</TableCell><TableCell>Condition / Use</TableCell><TableCell>Last Count</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {loading && <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={22} /></TableCell></TableRow>}
                  {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No assets match this register.</TableCell></TableRow>}
                  {filtered.map((asset) => <TableRow key={asset.id} hover>
                    <TableCell sx={{ minWidth: 165 }}>
                      <Chip icon={<Tag size={13} />} label={asset.tag_number} size="small" color="primary" variant="outlined" />
                      <Typography sx={{ mt: 0.5, fontWeight: 700 }}>{asset.name}</Typography>
                      <Typography variant="caption" color="text.secondary">SN {asset.serial_number}{asset.accessories ? ` · ${asset.accessories}` : ''}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>{dateValue(asset.acquisition_date) || '—'}<Typography display="block" variant="caption" color="text.secondary">{asset.acquisition_type}</Typography></TableCell>
                    <TableCell>{asset.department}<Typography display="block" variant="caption" color="text.secondary">{asset.location || 'Location not set'}</Typography></TableCell>
                    <TableCell>{asset.custodian || 'Unassigned'}<Typography display="block" variant="caption" color="text.secondary">Received by: {asset.received_by || '—'}</Typography></TableCell>
                    <TableCell><Chip size="small" label={asset.condition} color={asset.condition === 'Poor' ? 'warning' : 'default'} /><Typography display="block" variant="caption" color="text.secondary">{asset.utilization_status} · {asset.asset_status}</Typography></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{dateValue(asset.last_count_date) || 'Not counted'}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" aria-label={`Edit ${asset.tag_number}`} title="Edit asset" onClick={() => openEdit(asset)}><Pencil size={15} /></Button>
                      <Button size="small" color="error" onClick={() => deleteAsset(asset)}>Delete</Button>
                    </TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="md">
        <DialogTitle>Update asset tracking</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>{renderFields(editForm, setEditForm, true)}</DialogContent>
        <DialogActions><Button onClick={() => setEditing(null)} disabled={saving}>Cancel</Button><Button variant="contained" onClick={updateAsset} disabled={saving}>Save Changes</Button></DialogActions>
      </Dialog>
    </Container>
  );
}