import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Paper, Typography, Box, Grid, Chip, Stack, CircularProgress, Alert,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/reporting/reports_catalog');
        setData(res.data);
        setError('');
      } catch (e) {
        console.error('Reports load error', e);
        setError('Unable to load reports catalog.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const types = data?.report_types || [];
  const durations = data?.report_durations || [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="📋 Reports"
        subtitle="Standard report types and the schedule (duration) that keeps reporting on track."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Report Types</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Every report the People & Culture and project teams produce is listed here.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {types.map((r) => (
                <Box
                  key={r.name}
                  sx={{
                    p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>{r.icon}</Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Standard People Plus report template
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Report Durations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              When each report is produced, so the team never misses a cycle.
            </Typography>
            <Stack spacing={1.5}>
              {durations.map((d) => (
                <Box key={d.name} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.name}</Typography>
                    <Chip size="small" label={d.frequency} variant="outlined" />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}