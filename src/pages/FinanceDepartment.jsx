import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, TextField, Stack, Chip, Alert, Checkbox } from '@mui/material';
import { Landmark, Wallet, ScrollText, ShieldCheck, TrendingDown, Scale, Percent } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const KEY = 'pp_finance_items';
const KEY_PAYE = 'pp_paye_checklist';

const FUNCTIONS = [
  { key: 'budget', title: 'Budget Management', icon: Wallet, color: '#6D28D9', hint: 'Prepare and track departmental budgets and allocations.' },
  { key: 'cash', title: 'Cash Management', icon: Scale, color: '#0EA5E9', hint: 'Monitor cash position, receipts and disbursements.' },
  { key: 'reports', title: 'Report Management', icon: ScrollText, color: '#7E14FF', hint: 'Generate financial statements and management reports.' },
  { key: 'controls', title: 'Internal Controls', icon: ShieldCheck, color: '#059669', hint: 'Segregation of duties and approval limits.' },
  { key: 'risk', title: 'Risk Management', icon: TrendingDown, color: '#EA580C', hint: 'Identify, assess and mitigate financial risks.' },
  { key: 'audit', title: 'Audit Compliance', icon: Landmark, color: '#DC2626', hint: 'Prepare for internal and external audits.' },
];

const PAYE_STEPS = [
  'Reduction of PAYE from salaries',
  'Filing of monthly returns',
  'Remit taxes on time',
  'Penalties',
  'Interest charges',
  'Compliance audits',
];

export default function FinanceDepartment() {
  const [notes, setNotes] = useState({});
  const [input, setInput] = useState('');
  const [active, setActive] = useState('budget');
  const [paye, setPaye] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_PAYE) || '[]'); } catch (e) { return []; }
  });

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (s && typeof s === 'object') setNotes(s); } catch (e) { /* ignore */ }
  }, []);

  const saveNotes = (next) => { setNotes(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const addNote = () => {
    const text = input.trim();
    if (!text) return;
    const list = notes[active] || [];
    saveNotes({ ...notes, [active]: [...list, { text, at: new Date().toLocaleDateString() }] });
    setInput('');
  };

  const togglePaye = (i) => {
    const next = paye.includes(i) ? paye.filter((x) => x !== i) : [...paye, i];
    setPaye(next);
    localStorage.setItem(KEY_PAYE, JSON.stringify(next));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Finance Department" />

      {/* Financial framework */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Landmark size={24} style={{ color: '#6D28D9' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Financial Framework</Typography>
            <Typography variant="body2" color="text.secondary">
              Budget management, cash management, reporting, internal controls, risk management and audit compliance
              operate within one framework. Statutory obligations (PAYE) are tracked below.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Management functions */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {FUNCTIONS.map((fn) => {
              const Icon = fn.icon;
              const activeList = notes[fn.key] || [];
              return (
                <Grid item xs={12} sm={6} key={fn.key}>
                  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Icon size={18} style={{ color: fn.color }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{fn.title}</Typography>
                      <Chip size="small" label={activeList.length} color="default" sx={{ ml: 'auto', fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>{fn.hint}</Typography>
                    <Box sx={{ flex: 1, display: 'grid', gap: 0.75, maxHeight: 180, overflowY: 'auto', mb: 1.5 }}>
                      {activeList.length === 0 && <Typography variant="body2" color="text.secondary">No entries yet.</Typography>}
                      {activeList.map((n, i) => (
                        <Box key={i} sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2">{n.text}</Typography>
                          <Typography variant="caption" color="text.secondary">{n.at}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <TextField size="small" placeholder={`Add to ${fn.title}...`} value={active === fn.key ? input : ''}
                        onChange={(e) => { setActive(fn.key); setInput(e.target.value); }} fullWidth />
                      <Button variant="contained" size="small" onClick={addNote} sx={{ flexShrink: 0 }}>Add</Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
<Grid item xs={12} md={4}>
          {/* Statutory compliance - PAYE */}
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Percent size={20} style={{ color: '#7E14FF' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Statutory Compliance</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              PAYE (Pay As You Earn) obligations
            </Typography>
            {PAYE_STEPS.map((step, i) => {
              const done = paye.includes(i);
              return (
                <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Checkbox checked={done} onChange={() => togglePaye(i)} size="small" sx={{ p: 0.25 }} />
                  <Typography variant="body2" sx={{ fontWeight: done ? 700 : 500, textDecoration: done ? 'line-through' : 'none' }}>
                    {step}
                  </Typography>
                </Box>
              );
            })}
            <Alert severity="info" sx={{ mt: 2 }}>
              Tracked automatically for compliance audits.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}