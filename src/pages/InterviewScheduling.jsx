import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from '@mui/material';
import api from '../api';

export default function InterviewScheduling() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    candidate_name: '',
    position: '',
    date: '',
    time: '',
    interviewer: '',
    notes: '',
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get('/hr/interviews');
        setInterviews(response.data || []);
      } catch (err) {
        console.error('Failed to load interviews:', err);
      }
    };
    fetchInterviews();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ candidate_name: '', position: '', date: '', time: '', interviewer: '', notes: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleInterview = async () => {
    if (!formData.candidate_name || !formData.position || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const response = await api.post('/hr/interviews', {
        ...formData,
        status: 'Scheduled',
      });
      setInterviews([...interviews, response.data]);
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
  };

  const handleDeleteInterview = async (id) => {
    try {
      await api.delete(`/hr/interviews/${id}`);
      setInterviews(interviews.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete interview:', err);
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Interview Scheduling</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>Schedule and manage interviews</Typography>
        </Box>
        <Button variant="contained" onClick={handleOpenDialog}>Schedule Interview</Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Scheduled Interviews ({interviews.length})</Typography>
          {interviews.length > 0 ? (
            <Stack spacing={2}>
              {interviews.map((interview) => (
                <Card key={interview.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{interview.candidate_name}</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>{interview.position}</Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>{interview.date} at {interview.time}</Typography>
                      </Box>
                      <Button color="error" onClick={() => handleDeleteInterview(interview.id)}>Delete</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: '#999', py: 4, textAlign: 'center' }}>No interviews scheduled yet</Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Interview</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Candidate Name" fullWidth name="candidate_name" value={formData.candidate_name} onChange={handleFormChange} />
            <TextField label="Position" fullWidth name="position" value={formData.position} onChange={handleFormChange} />
            <TextField label="Interview Date" fullWidth type="date" name="date" value={formData.date} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            <TextField label="Interview Time" fullWidth type="time" name="time" value={formData.time} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            <TextField label="Interviewer" fullWidth name="interviewer" value={formData.interviewer} onChange={handleFormChange} />
            <TextField label="Notes" fullWidth name="notes" value={formData.notes} onChange={handleFormChange} multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleScheduleInterview} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
