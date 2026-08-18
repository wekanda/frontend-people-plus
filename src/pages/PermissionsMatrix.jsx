/**
 * Role & Permissions Matrix — printable guide of what Admin / Manager / Staff
 * can and cannot do on People Pulse (matches the HR role-based design guide).
 */
import React from 'react';
import {
  Container, Paper, Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider, Button,
} from '@mui/material';
import { Printer } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const PRINT_CSS = `@media print { body * { visibility: hidden; } #perm-page, #perm-page * { visibility: visible; } #perm-page { position: absolute; left:0; top:0; } @page { size: A4 portrait; margin: 10mm; } }`;

const SUMMARY = [
  ['Add / Edit / Delete employees', true, false, false],
  ['Generate contracts & official documents', true, false, false],
  ['Approve leave requests', true, 'team', false],
  ['View payslips', true, false, 'own'],
  ['View salaries / payroll', true, false, false],
  ['Upload documents', 'all', 'dept', 'pending'],
  ['Download / Print documents', true, 'access', 'own'],
  ['See other staff data', true, 'team', false],
  ['Configure system & users', true, false, false],
  ['Apply for leave', true, true, true],
  ['Submit timesheet', true, true, true],
  ['Update own profile contacts', true, true, true],
];

const ROLES = [
  {
    name: 'Admin (HRM / PCM)',
    color: '#b91c1c',
    login: 'admin@peoplepluse.com',
    can: [
      'Employee records — create, view, edit, delete, import/export',
      'Document management — upload all types, approve staff uploads, audit trail',
      'Contract & letter generator — all templates, PDF/DOCX, print/email',
      'Leave — configure entitlements, approve all, reports',
      'Payroll mastersheet & all payslips',
      'Recruitment, timesheets, performance cycles',
      'User management, system configuration, analytics & reports',
    ],
    cannot: [
      'Cannot delete final payroll without audit trail',
      'Cannot approve own leave request',
      'Cannot view staff passwords (encrypted only)',
      'Cannot bypass approval workflow for document uploads',
    ],
  },
  {
    name: 'Manager (Team Oversight)',
    color: '#1d4ed8',
    login: 'manager@peoplepluse.com',
    can: [
      'Dashboard — team count, pending approvals, contract expiries',
      'View team list & profiles (view-only); export list',
      'Approve / reject team leave and team timesheets',
      'Conduct appraisals for direct reports',
      'Upload appraisals, training records, department reports',
      'View vacancies, interview feedback, dept reports',
    ],
    cannot: [
      'Cannot add / edit / delete employees',
      'Cannot generate contracts or official letters',
      'Cannot view salaries, payslips, payroll or bank details',
      'Cannot see other departments’ data',
      'Cannot create accounts or change roles',
      'Cannot delete official documents or approve own leave',
      'Cannot modify leave entitlement rules',
    ],
  },
  {
    name: 'Staff (Self-Service)',
    color: '#15803d',
    login: 'Outlook email (e.g. j.doe@peoplepluse.com)',
    can: [
      'Dashboard — own leave balance, contract end, notifications',
      'View own profile; edit phone, email, address, next of kin',
      'Apply for leave with auto-calculated days; track status',
      'Create & submit monthly timesheet',
      'View, download & print own payslips',
      'Upload own documents (CV, certificates, ID, bank/tax) → pending HR approval',
      'Self-review; apply to vacancies; track own applications',
    ],
    cannot: [
      'Cannot see ANY other employee’s data',
      'Cannot approve anything',
      'Cannot edit salary, contract dates, ID, NSSF, TIN',
      'Cannot upload directly to official file — all pending HR',
      'Cannot generate contracts or letters',
      'Cannot view payroll totals or other payslips',
      'Cannot delete documents or create accounts',
    ],
  },
];

const cell = (v) => {
  if (v === true) return '✅ Yes';
  if (v === false) return '❌ No';
  const map = { team: '✅ Team only', own: '✅ Own only', all: '✅ All types', dept: '✅ Dept only', access: '✅ Accessible' };
  return map[v] || '—';
};

export { SUMMARY, ROLES, cell };
export default function PermissionsMatrix() {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <style>{PRINT_CSS}</style>
      <PageHeader
        title="🔐 Role & Permissions Matrix"
        subtitle="Who can do what on People Pulse — Admin, Manager and Staff. Use Print to export a copy."
        primaryAction={
          <Button variant="contained" startIcon={<Printer size={16} />} onClick={() => window.print()} sx={{ textTransform: 'none' }}>
            Print matrix
          </Button>
        }
      />
      <Box id="perm-page" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Quick Reference</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 700 }}>Function</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Staff</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SUMMARY.map((row, i) => (
                <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{row[0]}</TableCell>
                  <TableCell>{cell(row[1])}</TableCell>
                  <TableCell>{cell(row[2])}</TableCell>
                  <TableCell>{cell(row[3])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {ROLES.map((role) => (
            <Paper key={role.name} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: role.color }}>{role.name}</Typography>
                <Typography variant="caption" color="text.secondary">{role.login}</Typography>
              </Box>
              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803d' }}>✅ What they CAN do</Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {role.can.map((item) => <li key={item}><Typography variant="body2">{item}</Typography></li>)}
              </ul>
              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b91c1c' }}>❌ What they CANNOT do</Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {role.cannot.map((item) => <li key={item}><Typography variant="body2">{item}</Typography></li>)}
              </ul>
            </Paper>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Every screen checks the user's role before displaying — hidden options or graceful "Access Denied", no errors.
        </Typography>
      </Box>
    </Container>
  );
}