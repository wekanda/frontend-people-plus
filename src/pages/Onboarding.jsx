import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Card, CardContent, Checkbox, Stack, FormControlLabel } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const { user, token } = useAuth();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  useEffect(() => {
    const loadChecklists = async () => {
      try {
        const res = await api.get('/hr/onboarding', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChecklists(res.data || []);
        if (res.data?.length > 0) {
          setSelectedChecklist(res.data[0]);
        }
      } catch (err) {
        console.error('Error loading checklists:', err);
      } finally {
        setLoading(false);
      }
    };
    loadChecklists();
  }, [token]);

  const handleItemToggle = async (checklistId, itemIndex) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) return;

      const items = checklist.items_json || [];
      items[itemIndex].completed = !items[itemIndex].completed;

      await api.put(`/hr/onboarding/${checklistId}`, { items_json: items }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChecklists(checklists.map(c => c.id === checklistId ? { ...c, items_json: items } : c));
      setSelectedChecklist({ ...selectedChecklist, items_json: items });
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Onboarding Checklists"
        subtitle="Track and manage new employee onboarding tasks."
      />

      <Grid container spacing={3}>
        {/* Checklist List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #d1d5db', maxHeight: '600px', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Active Checklists</Typography>
            <Stack spacing={1}>
              {checklists.length > 0 ? (
                checklists.map((checklist) => (
                  <Card
                    key={checklist.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedChecklist?.id === checklist.id ? '2px solid #1877f2' : '1px solid #d1d5db',
                      bgcolor: selectedChecklist?.id === checklist.id ? '#eff6ff' : '#ffffff',
                      borderRadius: 2,
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedChecklist(checklist)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {checklist.candidate_name || `Checklist ${checklist.id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {checklist.status || 'Active'}
                    </Typography>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No checklists available</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Checklist Details */}
        <Grid item xs={12} md={8}>
          {selectedChecklist ? (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedChecklist.candidate_name || 'Onboarding Checklist'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedChecklist.status || 'Active'} • Created: {new Date(selectedChecklist.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Stack spacing={1}>
                {selectedChecklist.items_json && selectedChecklist.items_json.length > 0 ? (
                  selectedChecklist.items_json.map((item, idx) => (
                    <Card key={idx} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e5e7eb' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.completed || false}
                            onChange={() => handleItemToggle(selectedChecklist.id, idx)}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 500,
                                textDecoration: item.completed ? 'line-through' : 'none',
                                color: item.completed ? '#9ca3af' : '#111827'
                              }}
                            >
                              {item.task}
                            </Typography>
                            {item.notes && (
                              <Typography variant="caption" color="text.secondary">
                                {item.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No items in this checklist</Typography>
                )}
              </Stack>

              {/* Progress Bar */}
              {selectedChecklist.items_json && selectedChecklist.items_json.length > 0 && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Completion</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {Math.round((selectedChecklist.items_json.filter(i => i.completed).length / selectedChecklist.items_json.length) * 100)}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: '#1877f2',
                        width: `${(selectedChecklist.items_json.filter(i => i.completed).length / selectedChecklist.items_json.length) * 100}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Typography color="text.secondary">Select a checklist to view details</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
