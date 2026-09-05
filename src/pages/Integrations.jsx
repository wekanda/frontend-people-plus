import React from 'react';
import { Container, Paper, Typography, Box, Grid, Chip, Stack, Alert } from '@mui/material';
import PageHeader from '../components/PageHeader';

const INTEGRATIONS = [
  { icon: '📧', title: 'Outlook (SSO)', desc: 'Staff log in with Outlook credentials via Single Sign-On. Notifications and calendar events sync seamlessly.', status: 'Planned' },
  { icon: '💬', title: 'Teams', desc: 'Announcements, approvals and alerts delivered inside Microsoft Teams channels for the People & Culture team.', status: 'Planned' },
  { icon: '🟢', title: 'WhatsApp', desc: 'Smart alerts and reminders (birthdays, contract expiry, approvals) reach staff on their mobile via WhatsApp.', status: 'Planned' },
];

const SECURITY = [
  { icon: '🔐', title: 'End-to-End Encryption', desc: 'All uploads, downloads, prints and scans are transmitted securely and stored with encryption for privacy and confidentiality.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Admins, Managers and Staff see only what their role permits — protecting sensitive staff records.' },
  { icon: '🛡️', title: 'Audit Trail', desc: 'Every edit, approval and version is logged for compliance and traceability.' },
];

export default function Integrations() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🔗 Integrations & Security"
        subtitle="Seamless communication through Outlook, Teams and WhatsApp, with end-to-end encrypted document interactions."
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        These integrations are wired into the product roadmap. Staff already authenticate with their organisation accounts, and
        document upload / download / print / scan is available across all roles.
      </Alert>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Workplace Integrations</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {INTEGRATIONS.map((it) => (
          <Grid item xs={12} md={4} key={it.title}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ fontSize: '2rem', mb: 1 }}>{it.icon}</Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{it.title}</Typography>
                <Chip size="small" label={it.status} color="default" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary">{it.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>End-to-End Security</Typography>
      <Grid container spacing={2}>
        {SECURITY.map((s) => (
          <Grid item xs={12} md={4} key={s.title}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ fontSize: '2rem', mb: 1 }}>{s.icon}</Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>🎯 Expected Outcomes</Typography>
        <Stack spacing={1}>
          <Typography variant="body2">• Faster digital approvals and reduced manual delays</Typography>
          <Typography variant="body2">• Enhanced staff identity management with signatures and photos</Typography>
          <Typography variant="body2">• Improved employee recognition and engagement</Typography>
          <Typography variant="body2">• Secure, integrated workflows across Outlook, Teams, and WhatsApp</Typography>
        </Stack>
      </Paper>
    </Container>
  );
}