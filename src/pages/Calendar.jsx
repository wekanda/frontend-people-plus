import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container, Paper, Box, Typography, Button, IconButton, Grid, Chip, Alert,
  CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarClock, Link2, Send, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api';

const TYPE_COLORS = {
  meeting: '#2563eb', interview: '#7c3aed', training: '#16a34a',
  checkin: '#0288d1', leave: '#ed6c02', other: '#64748b',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [params] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(new Date());
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(params.get('new') === '1');
  const [form, setForm] = useState({ title: '', event_type: 'meeting', date: '', start: '09:00', end: '', location: '', meeting_link: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/api/calendar/events');
      setEvents(res.data?.events || []);
      setError('');
    } catch (e) {
      setError('Unable to load calendar events.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsOn = (day) => {
    const dayKey = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.start_at && String(e.start_at).slice(0, 10) === dayKey);
  };

  const create = async () => {
    if (!form.title.trim() || !form.date) { setError('Title and date are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/api/calendar/events', {
        title: form.title,
        event_type: form.event_type,
        description: form.description,
        start_at: `${form.date}T${form.start || '09:00'}`,
        end_at: form.end ? `${form.date}T${form.end}` : null,
        location: form.location,
        meeting_link: form.meeting_link,
      });
      setOpenForm(false);
      setForm({ title: '', event_type: 'meeting', date: '', start: '09:00', end: '', location: '', meeting_link: '', description: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not create the event.');
    } finally {
      setSaving(false);
    }
  };

  const broadcast = async (ev) => {
    try {
      const res = await api.post(`/api/calendar/events/${ev.id}/broadcast`);
      setShared(`Meeting link shared with ${res.data?.shared_to || 0} people.`);
    } catch (e) {
      setError('Could not share the meeting link.');
    }
  };

  const remove = async (ev) => {
    try {
      await api.delete(`/api/calendar/events/${ev.id}`);
      setSelected(null);
      load();
    } catch (e) {
      setError('Could not delete the event.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Organization Calendar"
        subtitle="Track meetings, interviews, trainings and check-ins. Share meeting links with everyone."
        primaryAction={<Button variant="contained" onClick={() => setOpenForm(true)} startIcon={<Plus size={15} />} sx={{ textTransform: 'none' }}>Add Event</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {shared && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShared('')}>{shared}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton onClick={() => setView({ y: view.m === 0 ? view.y - 1 : view.y, m: view.m === 0 ? 11 : view.m - 1 })}><ChevronLeft /></IconButton>
              <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
                {MONTHS[view.m]} {view.y}
              </Typography>
              <IconButton onClick={() => setView({ y: view.m === 11 ? view.y + 1 : view.y, m: view.m === 11 ? 0 : view.m + 1 })}><ChevronRight /></IconButton>
            </Box>
            <Grid container spacing={0.5}>
              {DOW.map((d) => (
                <Grid item xs={12 / 7} key={d} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{d}</Typography>
                </Grid>
              ))}
              {cells.map((day, i) => {
                const isToday = day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                const evs = day ? eventsOn(day) : [];
                return (
                  <Grid item xs={12 / 7} key={i} sx={{ p: 0.25 }}>
                    <Box
                      onClick={() => day && evs.length && setSelected(evs[0])}
                      sx={{
                        minHeight: 74, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                        bgcolor: isToday ? 'primary.light' : 'background.paper', p: 0.5, cursor: evs.length ? 'pointer' : 'default',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: isToday ? 800 : 500 }}>{day || ''}</Typography>
                      {evs.slice(0, 2).map((e) => (
                        <Chip key={e.id} size="small" label={`${String(e.start_at || '').slice(11, 16)} ${e.event_type}`}
                          sx={{ height: 18, fontSize: '0.6rem', mb: 0.3, bgcolor: TYPE_COLORS[e.event_type] || '#64748b', color: '#fff', width: '100%' }} />
                      ))}
                      {evs.length > 2 && <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>+{evs.length - 2} more</Typography>}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          {selected ? (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip size="small" label={selected.event_type} sx={{ bgcolor: TYPE_COLORS[selected.event_type] || '#64748b', color: '#fff', textTransform: 'capitalize' }} />
                {selected.can_manage && <IconButton size="small" onClick={() => remove(selected)}><Trash2 size={15} /></IconButton>}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>{selected.title}</Typography>
              <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />
              {selected.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{selected.description}</Typography>}
              {selected.start_at && <Typography variant="body2"> {selected.start_at} {selected.end_at ? ` ${selected.end_at}` : ''}</Typography>}
              {selected.location && <Typography variant="body2"> {selected.location}</Typography>}
              <Stack sx={{ mt: 2, gap: 1 }}>
                {selected.meeting_link && (
                  <Button variant="contained" fullWidth startIcon={<Link2 size={15} />} href={selected.meeting_link} target="_blank" sx={{ textTransform: 'none' }}>
                    Join / Open Meeting
                  </Button>
                )}
                {selected.can_manage && (
                  <Button variant="outlined" fullWidth startIcon={<Send size={15} />} onClick={() => broadcast(selected)} sx={{ textTransform: 'none' }}>
                    Share meeting link with everyone
                  </Button>
                )}
              </Stack>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 3 }}>Click any day with an event to see its details and meeting link.</Alert>
          )}

          <Paper sx={{ p: 2, mt: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}> Event types</Typography>
            {Object.entries(TYPE_COLORS).map(([k, c]) => (
              <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: c }} />
                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}> Schedule an event</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 1.5, mt: 1 }}>
            <TextField size="small" label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField select size="small" label="Type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
              {Object.keys(TYPE_COLORS).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Date" type="date" InputLabelProps={{ shrink: true }} fullWidth value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" label="Start" type="time" InputLabelProps={{ shrink: true }} value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })} sx={{ flex: 1 }} />
              <TextField size="small" label="End" type="time" InputLabelProps={{ shrink: true }} value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })} sx={{ flex: 1 }} />
            </Box>
            <TextField size="small" label="Location" fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <TextField size="small" label="Meeting link (e.g. Google Meet / Zoom)" fullWidth value={form.meeting_link}
              onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
            <TextField size="small" label="Description" multiline minRows={2} fullWidth value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={create} sx={{ textTransform: 'none' }} startIcon={<CalendarClock size={15} />}>
            {saving ? 'Saving…' : 'Save Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}