import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Typography, Box, Paper, Stack, Chip, Button, TextField,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, CircularProgress, Grid,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function Internship() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ interns: 0, volunteers: 0 });
  const [tab, setTab] = useState('intern');
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    candidate_name: '', email: '', participant_type: 'intern',
    start_date: '', end_date: '', status: 'planned', notes: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/recruitment/internships', { params: { participant_type: tab } }),
        api.get('/recruitment/internships/summary'),
      ]);
      setItems(listRes.data || []);
      setSummary(sumRes.data || { interns: 0, volunteers: 0 });
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const handleAdd = async () => {
    try {
      await api.post('/recruitment/internships', form);
      setAddOpen(false);
      setForm({ candidate_name: '', email: '', participant_type: 'intern', start_date: '', end_date: '', status: 'planned', notes: '' });
      load();
    } catch (e) {
      console.error('Add failed', e);
      alert('Failed to add participant');
    }
  };

  const isIntern = tab === 'intern';

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🎓 Internships & Volunteers"
        subtitle="Manage interns and volunteers separately — same pipeline, distinct tracks."
        primaryAction={<Button variant="contained" onClick={() => setAddOpen(true)} sx={{ textTransform: 'none' }}>+ Add {isIntern ? 'Intern' : 'Volunteer'}</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{summary.interns}</Typography>
            <Typography variant="caption" color="text.secondary">🎓 Interns</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{summary.volunteers}</Typography>
            <Typography variant="caption" color="text.secondary">🤝 Volunteers</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`🎓 Interns (${summary.interns})`} value="intern" />
        <Tab label={`🤝 Volunteers (${summary.volunteers})`} value="volunteer" />
      </Tabs>
{loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">No {tab}s registered yet. Add your first one above.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i.id}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{i.candidate_name}</Typography>
                  <Chip label={i.participant_type === 'volunteer' ? '🤝 Volunteer' : '🎓 Intern'} size="small" color={i.participant_type === 'volunteer' ? 'secondary' : 'primary'} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{i.email}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {i.start_date ? `${i.start_date} → ${i.end_date || 'open'}` : 'Dates TBD'}
                </Typography>
                <Chip label={i.status} size="small" variant="outlined" />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {isIntern ? 'Intern' : 'Volunteer'}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Full Name" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField select label="Type" value={form.participant_type} onChange={(e) => setForm({ ...form, participant_type: e.target.value })}>
            <MenuItem value="intern">Intern</MenuItem>
            <MenuItem value="volunteer">Volunteer</MenuItem>
          </TextField>
          <TextField label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField label="Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}