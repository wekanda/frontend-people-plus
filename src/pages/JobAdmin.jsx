import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, Chip } from '@mui/material';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function JobForm({ initial = {}, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: '', department: '', location: '', description: '', closing_date: '', is_internal: false, channels: ''
  });

  useEffect(() => { if (initial) setForm({ ...form, ...initial, channels: initial.channels || '' }); }, [initial]);

  const handleChange = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async () => {
    try {
      if (initial && initial.id) {
        const res = await api.put(`/recruitment/jobs/${initial.id}`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        onSaved(res.data);
      } else {
        const res = await api.post('/recruitment/jobs', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        onSaved(res.data);
      }
    } catch (e) { console.error(e); alert('Save failed'); }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{initial && initial.id ? 'Edit Job' : 'Create Job'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={handleChange('title')} fullWidth />
          <TextField label="Department" value={form.department} onChange={handleChange('department')} />
          <TextField label="Location" value={form.location} onChange={handleChange('location')} />
          <TextField label="Closing date (YYYY-MM-DD)" value={form.closing_date} onChange={handleChange('closing_date')} />
          <TextField label="Channels (comma separated)" value={form.channels} onChange={handleChange('channels')} />
          <TextField label="Description" value={form.description} onChange={handleChange('description')} multiline rows={4} fullWidth />
          <FormControlLabel control={<Switch checked={form.is_internal} onChange={handleChange('is_internal')} />} label="Internal only" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function JobAdmin() {
  const [jobs, setJobs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const load = async () => {
    try {
      const res = await api.get('/recruitment/jobs', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setJobs(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const onCreate = () => { setEditing(null); setOpenForm(true); };
  const onEdit = (job) => { setEditing(job); setOpenForm(true); };
  const onSaved = (job) => { setOpenForm(false); load(); };

  const publish = async (job) => {
    const channels = job.channels ? job.channels.split(',').map(s => s.trim()) : [];
    try {
      const res = await api.post(`/recruitment/jobs/${job.id}/publish`, { channels, is_internal: job.is_internal }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert('Published');
      load();
    } catch (e) { console.error(e); alert('Publish failed'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Job Postings</Typography>
        <Button variant="contained" onClick={onCreate}>Create Job</Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {jobs.map(j => (
            <ListItem key={j.id} secondaryAction={<>
              <Button size="small" onClick={() => onEdit(j)}>Edit</Button>
              <Button size="small" onClick={() => publish(j)}>Publish</Button>
            </>}>
              <ListItemText primary={j.title} secondary={<span>{j.department} • {j.location} • {j.status} {j.published_at ? '• Published' : ''}</span>} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {openForm && <JobForm initial={editing} onCancel={() => setOpenForm(false)} onSaved={onSaved} />}
    </Box>
  );
}
