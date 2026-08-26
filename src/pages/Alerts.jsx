import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container, Paper, Typography, Box, Stack, Chip, Grid, Button,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

const SECTIONS = [
  { key: 'birthdays', label: '🎂 Birthdays', color: '#d32f2f', icon: '🎂' },
  { key: 'anniversaries', label: '🎉 Work Anniversaries', color: '#2e7d32', icon: '🎉' },
  { key: 'contract_expiry', label: '📜 Contract Expiry', color: '#ed6c02', icon: '📜' },
  { key: 'project_end', label: '🏗️ End of Project', color: '#9c27b0', icon: '🏗️' },
  { key: 'probation_end', label: '🧑‍🎓 Probation Ends', color: '#0288d1', icon: '🧑‍🎓' },
  { key: 'review_due', label: '📝 Contract Review Due', color: '#7b1fa2', icon: '📝' },
  { key: 'missing_docs', label: '📂 Missing Personal-File Docs', color: '#c62828', icon: '📂' },
];

function daysLabel(d) {
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  return `In ${d} days`;
}

// missing_docs is grouped: { "Recruitment documents": [...], ... } -> flatten to cards
function flatItems(sectionKey, alerts) {
  if (sectionKey !== 'missing_docs') return alerts[sectionKey] || [];
  const groups = alerts.missing_docs || {};
  const out = [];
  Object.keys(groups).forEach((group) => {
    (groups[group] || []).forEach((item) => out.push({ ...item, _group: group }));
  });
  return out;
}

function groupTitle(item) {
  return item._group || item.group || '';
}

export default function Alerts() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/alerts', { params: { days: 60 } });
      setData(res.data);
      setError('');
    } catch (e) {
      console.error('Alerts load error', e);
      setError('Unable to load smart alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const al = data?.alerts || {};

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🔔 Smart Alerts"
        subtitle="Birthdays, staff anniversaries, contract & project milestones rolling up in the next 60 days."
        primaryAction={<Button variant="contained" onClick={load} sx={{ textTransform: 'none' }}>Refresh</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <Box>
          {/* Overview cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {SECTIONS.map((s) => (
              <Grid item xs={6} sm={4} md={3} key={s.key}>
                <Paper
                  sx={{
                    p: 1.5, borderRadius: 3, textAlign: 'center',
                    border: '1px solid', borderColor: 'divider',
                    bgcolor: flatItems(s.key, al).length ? `${s.color}18` : 'background.paper',
                  }}
                >
                  <Typography sx={{ fontSize: '1.6rem', lineHeight: 1 }}>{s.icon}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.3rem' }}>{flatItems(s.key, al).length}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Detailed alert lists */}
          <Grid container spacing={2}>
            {SECTIONS.map((s) => {
              const items = flatItems(s.key, al);
              return (
                <Grid item xs={12} md={6} lg={4} key={s.key}>
                  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{s.icon} {s.label}</Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    {items.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No {s.label.toLowerCase().replace(/s$/, '')}.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {items.map((it, i) => (
                          <Box
                            key={`${s.key}-${i}`}
                            sx={{
                              p: 1.25, borderRadius: 2,
                              borderLeft: `4px solid ${s.color}`,
                              bgcolor: 'background.paper',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{it.name}</Typography>
                              {s.key !== 'missing_docs' && <ChipNewText>{daysLabel(it.days)}</ChipNewText>}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {s.key === 'missing_docs'
                                ? `${groupTitle(it)} · ${it.doc}`
                                : it.file_code ? `${it.file_code} · ` : ''}
                              {s.key !== 'missing_docs' && new Date(it.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {it.detail ? ` · ${it.detail}` : ''}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            Smart alerts are computed automatically from the employee database. Onboarding a birth date for each
            employee ({' '}<code>Employee.date_of_birth</code>) improves birthday alerts.
          </Alert>
        </Box>
      )}
    </Container>
  );
}

function ChipNewText(props) {
  return (
    <Box component="span" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', px: 1, py: 0.25, borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>
      {props.children}
    </Box>
  );
}