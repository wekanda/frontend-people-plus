import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box, Paper, Typography, Grid, Button, Chip, Stack, CircularProgress,
  Tabs, Tab, Container, Alert,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function Pipeline() {
  const [tab, setTab] = useState('recruitment');
  const [board, setBoard] = useState({});
  const [alerts, setAlerts] = useState({ alerts: {}, counts: {} });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [piplineRes, alertsRes] = await Promise.all([
        api.get('/ats/pipeline'),
        api.get('/api/alerts', { params: { days: 90 } }),
      ]);
      setBoard(piplineRes.data || {});
      setAlerts(alertsRes.data || { alerts: {}, counts: {} });
    } catch (e) {
      console.error('Pipeline load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upcoming = (key) => alerts.alerts?.[key] || [];

  return (
    <Box>
      <PageHeader
        title="📈 Pipeline & Upcoming"
        subtitle="Recruitment pipeline plus everything coming up — contract ends, project completions and milestones."
        primaryAction={<Button variant="contained" onClick={load} sx={{ textTransform: 'none' }}>Refresh</Button>}
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="🧑‍💼 Recruitment Pipeline" value="recruitment" />
        <Tab label="📅 Upcoming (Contracts & Projects)" value="upcoming" />
      </Tabs>

      {loading ? <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box> : (
        <>
          {tab === 'recruitment' && (
            <Grid container spacing={2}>
              {Object.keys(board).length === 0 && <Alert severity="info">No recruitment activity yet.</Alert>}
              {Object.keys(board).map((stage) => (
                <Grid item xs={12} md={3} key={stage}>
                  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 220 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {stage} ({board[stage].length})
                    </Typography>
                    {board[stage].map((entry) => (
                      <Box key={entry.application?.id} sx={{ borderTop: '1px solid #eee', pt: 1, mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.application?.applicant_name || 'Unnamed'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{entry.application?.email}</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Button size="small" href={`#/applicant/${entry.application?.id}`}>Open</Button>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 'upcoming' && (
            <Grid container spacing={3}>
              {[
                { key: 'contract_expiry', title: '📜 Contracts Ending Soon', color: '#ed6c02' },
                { key: 'project_end', title: '🏗️ Projects Completing', color: '#9c27b0' },
                { key: 'anniversaries', title: '🎉 Anniversaries', color: '#2e7d32' },
                { key: 'birthdays', title: '🎂 Birthdays', color: '#d32f2f' },
                { key: 'probation_end', title: '🧑‍🎓 Probation Ends', color: '#0288d1' },
              ].map((s) => (
                <Grid item xs={12} md={6} lg={4} key={s.key}>
                  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>
                    <Stack spacing={1}>
                      {upcoming(s.key).length === 0 && <Typography variant="body2" color="text.secondary">Nothing coming up.</Typography>}
                      {upcoming(s.key).map((it, i) => (
                        <Box key={`${s.key}-${i}`} sx={{ p: 1.25, borderRadius: 2, borderLeft: `4px solid ${s.color}`, bgcolor: 'background.paper', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{it.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {it.file_code ? `${it.file_code} · ` : ''}
                            {it.project ? `${it.project} · ` : ''}
                            {new Date(it.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}