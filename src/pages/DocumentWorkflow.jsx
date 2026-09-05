import React from 'react';
import { Container, Paper, Typography, Box, Grid, Chip, Stack } from '@mui/material';
import PageHeader from '../components/PageHeader';

const STEPS = [
  { icon: '📤', title: 'Template Upload', desc: 'Managers from different companies upload their contractual document templates into the system.' },
  { icon: '🧩', title: 'Data Population', desc: 'Populate templates with relevant company, employee, or project information through structured input fields.' },
  { icon: '💾', title: 'Draft Save', desc: 'Save partially completed documents for later editing or review.' },
  { icon: '👁️', title: 'Document Preview', desc: 'Generate a preview version for validation, formatting checks, and approval before finalization.' },
  { icon: '🔒', title: 'Final Save', desc: 'Store the completed contractual document securely in the system repository.' },
  { icon: '🛠️', title: 'Document Generation', desc: 'Automatically compile the populated data into a finalized contractual document (PDF/Word).' },
  { icon: '🖨️', title: 'Print Dispatch', desc: 'Send the finalized document to the printer queue for physical copies.' },
  { icon: '🧾', title: 'Audit & Version Control', desc: 'Maintain logs of edits, approvals, and versions for compliance and traceability.' },
];

export default function DocumentWorkflow() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="🔁 Document Generation Workflow"
        subtitle="From template upload to audit trail — how contractual documents are produced end-to-end."
      />

      <Grid container spacing={2}>
        {STEPS.map((s, idx) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 12, fontSize: '2.2rem', opacity: 0.15, fontWeight: 800 }}>{idx + 1}</Box>
              <Box sx={{ fontSize: '2rem', mb: 1 }}>{s.icon}</Box>
              <Chip size="small" label={`Step ${idx + 1}`} sx={{ mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>⚙️ Available Contractual Templates</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Templates are uploaded by the managers of the different organisations and align with the in-built tools in the system.
        </Typography>
        <Stack spacing={1}>
          {[
            'Appointment letter template',
            'Contract (terms and conditions)',
            'End of contract notice template',
            'Job description template',
            'Practicum placement letter template (interns & volunteers)',
            'Service level agreement template',
            'Contract extension template',
            'Letter of undertaking template',
          ].map((t) => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="span" sx={{ color: '#2563eb', fontWeight: 700 }}>•</Box>
              <Typography variant="body2">{t}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}