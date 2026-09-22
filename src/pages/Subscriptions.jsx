import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Box, Typography, Grid, Chip, Button, Alert, Divider,
  Stack, Card, TextField, MenuItem, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ChevronDown, CalendarClock, CreditCard, ShieldCheck, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api';

const PLAN_LABELS = {
  quarterly: 'Quarterly (every 3 months)',
  yearly: 'Yearly (every 12 months)',
};

const STATUS_COLORS = {
  inactive: 'default',
  trial: 'primary',
  active: 'success',
  expired: 'error',
};

export default function Subscriptions() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ plan: 'yearly', status: 'inactive', amount: '', currency: 'UGX', start_date: '', end_date: '', auto_renew: false });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(['hr_admin', 'it_officer'].includes(u.role));
    } catch { /* ignore */ }
    api.get('/api/subscription')
      .then((res) => {
        const d = res.data || {};
        setSub(d);
        setForm({
          plan: d.plan || 'yearly',
          status: d.status || 'inactive',
          amount: d.amount != null ? String(d.amount) : '',
          currency: d.currency || 'UGX',
          start_date: d.start_date || '',
          end_date: d.end_date || '',
          auto_renew: !!d.auto_renew,
        });
      })
      .catch((e) => {
        console.error('Subscription load failed', e);
        setError('Unable to load subscription details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, amount: form.amount ? parseFloat(form.amount) : null };
      const res = await api.put('/api/subscription', payload);
      setSub(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not save the subscription.');
    } finally {
      setSaving(false);
    }
  };

  const startTrial = async (plan) => {
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/api/subscription/simulate-plan', { plan });
      setSub(res.data);
      setForm((f) => ({
        ...f,
        plan: res.data.plan,
        status: res.data.status,
        start_date: res.data.start_date || '',
        end_date: res.data.end_date || '',
      }));
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not start the trial.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Subscription & Billing"
        subtitle="Your organization's plan with People Plus — quarterly or yearly."
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Alert severity="info" sx={{ mb: 3 }} icon={<ShieldCheck size={18} />}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Payments &amp; subscriptions will be activated once the app is fully built.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          No charges are being made yet — you can set up the plan below and it will be ready to go live.
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Current Plan</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <CreditCard size={28} color="primary.main" />
              <Box flex={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {PLAN_LABELS[sub?.plan] || 'Plan not selected'}
                </Typography>
                <Chip
                  size="small"
                  label={`Status: ${sub?.status || 'inactive'}`}
                  color={STATUS_COLORS[sub?.status] || 'default'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {sub?.amount != null ? `${sub.currency || 'UGX'} ${Number(sub.amount).toLocaleString()}` : '—'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Start date</Typography>
                <Typography variant="body2">{sub?.start_date || '—'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">End date</Typography>
                <Typography variant="body2">{sub?.end_date || '—'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Trial ends</Typography>
                <Typography variant="body2">{sub?.trial_end_date || '—'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Auto-renew</Typography>
                <Typography variant="body2">{sub?.auto_renew ? 'Yes' : 'No'}</Typography>
              </Box>
            </Stack>
            {sub?.notes && (
              <Alert severity="warning" sx={{ mt: 2 }}><Typography variant="caption">{sub.notes}</Typography></Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          {isAdmin ? (
            <Accordion square defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 1, py: 1, fontWeight: 700 }}>
                🛠️ Manage Subscription (Admin / IT Officer)
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1.5 }}>
                <Stack spacing={1.5}>
                  <Button fullWidth variant="contained" disabled={saving} onClick={() => startTrial('quarterly')}
                    sx={{ textTransform: 'none' }} startIcon={<CalendarClock size={16} />}>
                    Start 14-day trial — Quarterly
                  </Button>
                  <Button fullWidth variant="contained" color="secondary" disabled={saving} onClick={() => startTrial('yearly')}
                    sx={{ textTransform: 'none' }} startIcon={<CalendarClock size={16} />}>
                    Start 14-day trial — Yearly
                  </Button>

                  <Divider sx={{ my: 1 }}>or configure manually</Divider>

                  <TextField select size="small" label="Plan type" value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </TextField>
                  <TextField select size="small" label="Status" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="trial">Trial</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </TextField>
                  <Box display="flex" gap={1}>
                    <TextField size="small" label="Amount" type="number" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} sx={{ flex: 1 }} />
                    <TextField select size="small" label="Currency" value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })} sx={{ width: 110 }}>
                      <MenuItem value="UGX">UGX</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="KES">KES</MenuItem>
                    </TextField>
                  </Box>
                  <Box display="flex" gap={1}>
                    <TextField size="small" label="Start date" type="date" value={form.start_date}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })} sx={{ flex: 1 }} />
                    <TextField size="small" label="End date" type="date" value={form.end_date}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })} sx={{ flex: 1 }} />
                  </Box>
                  <TextField size="small" label="Notes" value={form.notes || ''} fullWidth
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <Button variant="outlined" disabled={saving} onClick={save} sx={{ textTransform: 'none' }}
                    startIcon={<RotateCcw size={15} />}>
                    {saving ? 'Saving…' : 'Save plan'}
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Alert severity="info">Only the HR Admin or IT Officer can manage the organization subscription.</Alert>
            </Paper>
          )}

          <Card sx={{ mt: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>💡 How it works once live</Typography>
            <Typography variant="caption" color="text.secondary">
              Companies subscribe quarterly or yearly to keep using the system. Data stays intact when a
              subscription renews; a grace period protects the organization if a payment is late.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}