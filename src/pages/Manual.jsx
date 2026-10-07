import React from 'react';
import { Container, Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Chip, Alert, Divider, Stack } from '@mui/material';
import { ChevronDown, BookOpen, Users, Shield, CalendarCheck, Wallet, Loader } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SEC = [
  {
    icon: '', title: 'Getting Started & Accounts',
    body: 'Sign in at the app login page with your organisation email and password. The system is pre-loaded with accounts for each role. After logging in you land on the Dashboard, where the sidebar menu is grouped into modules with dropdown arrows.',
  },
  {
    icon: '', title: 'Roles & What Each Can Do',
    body: 'HR Admin - manages employees, documents, tools, branding and subscriptions. Project Manager - runs recruitment, leave and team operations. Staff - self-service: profile, photos, signature, documents, leave and timesheets. Finance/Pay - payroll and payslips. IT Officer - manages the whole application (employees, imports, documents, tools, branding, subscriptions). CEO & CEO Assistant - executive view of analytics, reports, alerts, staff and the organisation plan.',
  },
  {
    icon: '', title: 'Modules',
    body: 'Dashboard • Staff Management • Recruitment Management • Financial Management (finance, payroll, payslips, medical insurance) • Time & Leave (leave management + inbuilt leave tracker) • Performance • Reports • HR Tools & Documents (inbuilt Excel tools with branded downloads, fillable documents) • Calendar & Scheduling • Organization & Settings (branding, compliance, profile, manual, integrations) • Subscription & Billing.',
  },
  {
    icon: '', title: 'Organization Branding & Documents',
    body: 'Open Organization & Settings  Organization Branding to upload your logo and letterhead. They automatically appear on every generated document (contracts, offers, notices, medical insurance forms). Built-in Excel HR tools can be downloaded pre-filled with your organisation name and logo (branded). Documents are also editable with a text toolbar (bold, italic, lists) before download.',
  },
  {
    icon: '', title: 'Calendar & Scheduling',
    body: 'The Organization Calendar tracks meetings, interviews, trainings and check-ins. Create an event, add a meeting link, then share that link with everyone in the organisation - each person receives a notification (also shown as sliding alerts).',
  },
  {
    icon: '', title: 'Subscription & Billing',
    body: 'Companies subscribe quarterly (UGX 150,000 per 3 months) or yearly (UGX 3,000,000 per 12 months). Payments & online billing will be activated when the app is fully built - until then this is a preview and no charges are made. The plan can be set up now by the HR Admin or IT Officer.',
  },
  {
    icon: '', title: 'Security & Data',
    body: 'All access is role-based and every action is tied to the signed-in user. Uploaded files (photos, logos, signatures, documents) are stored securely and served over HTTPS. End-to-end encryption and full data isolation between organisations is on the roadmap for the multi-tenant release (see below).',
  },
  {
    icon: '', title: 'Roadmap (next releases)',
    body: 'AI integration, payroll connections (URA, banks, mobile money and other modes), file sharing between users, report storage for future reference, a demo video, real organisation email addresses on all accounts, and end-to-end encryption so no organisation can ever see another organisation\'s data.',
  },
];

export default function Manual() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader title="People Pulse — System Manual" subtitle="Everything you need to run HR with PEOPLE PULSE: accounts, modules, documents, calendar and billing." />

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#eef2ff' }}>
        <BookOpen color="#4f46e5" />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#312e81' }}>Welcome to PEOPLE PULSE</Typography>
          <Typography variant="body2" color="text.secondary">
            A complete HR management system for organizations of any size — built with dropdowns on every section so it stays clean on phones, tablets and laptops.
          </Typography>
        </Box>
      </Paper>

      {SEC.map((s) => (
        <Accordion key={s.title} square defaultExpanded={s.title === 'Getting Started & Accounts'}>
          <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 1, py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.icon} {s.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{s.body}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip icon={<Users size={14} />} label="8 roles" variant="outlined" />
        <Chip icon={<CalendarCheck size={14} />} label="Shared calendar" variant="outlined" />
        <Chip icon={<Wallet size={14} />} label="Quarterly / Yearly plans" variant="outlined" />
        <Chip icon={<Shield size={14} />} label="Role-based access" variant="outlined" />
        <Chip icon={<Loader size={14} />} label="AI & integrations coming" variant="outlined" />
      </Stack>
    </Container>
  );
}