import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

const sectionStyles = {
  paper: {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 3,
    overflow: 'hidden',
  },
  header: {
    p: 1.25,
    bgcolor: 'primary.main',
  },
  headerTitle: {
    color: 'primary.contrastText',
    fontWeight: 700,
    fontSize: '0.92rem',
    letterSpacing: '0.2px',
  },
  content: {
    p: 2,
  },
};

export default function IndependentSheet() {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState({ name: '', id: '', position: '', date: '' });
  const [renewal, setRenewal] = useState({ employee: '', contractEnd: '', renewalDate: '', notes: '' });
  const [extension, setExtension] = useState({ employee: '', currentEnd: '', newEnd: '', reason: '' });
  const [notice, setNotice] = useState({ project: '', client: '', completionDate: '', remarks: '' });
  const [undertaking, setUndertaking] = useState({ subject: '', details: '' });
  const [source, setSource] = useState({ applicant: '', date: '', reference: '', status: 'Pending' });
  const [leave, setLeave] = useState({ employee: '', startDate: '', endDate: '', type: 'Annual' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = (label) => {
    setSnackbar({ open: true, message: `${label} saved successfully.`, severity: 'success' });
  };

  const transferRows = [
    { name: 'John Doe', from: 'Project A', to: 'Project B', date: '2026-06-05', status: 'In progress' },
    { name: 'Amaka N.', from: 'Deployment', to: 'Support', date: '2026-05-28', status: 'Completed' },
    { name: 'Hassan T.', from: 'Contracts', to: 'Finance', date: '2026-06-01', status: 'Pending' },
  ];

  const renderSection = ({ title, actionLabel, actionHandler, children }) => (
    <Paper sx={sectionStyles.paper}>
      <Box sx={sectionStyles.header}>
        <Typography variant="subtitle1" sx={sectionStyles.headerTitle}>
          {title}
        </Typography>
      </Box>
      <Box sx={sectionStyles.content}>{children}</Box>
      {actionLabel ? (
        <Box sx={{ px: 2.5, pb: 2.5, pt: 0.75, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{ background: 'primary.main', textTransform: 'none', px: 2, py: 0.6, fontSize: '0.85rem', minHeight: 36 }}
            onClick={actionHandler}
          >
            {actionLabel}
          </Button>
        </Box>
      ) : null}
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Independent Sheet"
        subtitle="A multi-panel document dashboard for contracts, notices, and tracker workflows."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#111827', textTransform: 'none' }} onClick={() => navigate('/') }>
            Return to Dashboard
          </Button>
        )}
        menuItems={[
          { label: 'Refresh view', onClick: () => window.location.reload() },
          { label: 'Open staff', onClick: () => navigate('/staff') },
          { label: 'Open notifications', onClick: () => navigate('/notifications') },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          {renderSection({
            title: '📝 Appointment Letter',
            actionLabel: 'Save Letter',
            actionHandler: () => handleSave('Appointment Letter'),
            children: (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    value={appointment.name}
                    onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={appointment.id}
                    onChange={(e) => setAppointment({ ...appointment, id: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={appointment.position}
                    onChange={(e) => setAppointment({ ...appointment, position: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={appointment.date}
                    onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                  />
                </Grid>
              </Grid>
            ),
          })}
        </Grid>

        <Grid item xs={12} lg={6}>
          {renderSection({
            title: '🔁 Contract Renewal',
            actionLabel: 'Save Renewal',
            actionHandler: () => handleSave('Contract Renewal'),
            children: (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee"
                    value={renewal.employee}
                    onChange={(e) => setRenewal({ ...renewal, employee: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contract End"
                    value={renewal.contractEnd}
                    onChange={(e) => setRenewal({ ...renewal, contractEnd: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Renewal Date"
                    InputLabelProps={{ shrink: true }}
                    value={renewal.renewalDate}
                    onChange={(e) => setRenewal({ ...renewal, renewalDate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={renewal.notes}
                    onChange={(e) => setRenewal({ ...renewal, notes: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            ),
          })}
        </Grid>

        <Grid item xs={12} lg={6}>
          {renderSection({
            title: '✳️ Contract Extension',
            actionLabel: 'Submit Extension',
            actionHandler: () => handleSave('Contract Extension'),
            children: (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee"
                    value={extension.employee}
                    onChange={(e) => setExtension({ ...extension, employee: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current End"
                    value={extension.currentEnd}
                    onChange={(e) => setExtension({ ...extension, currentEnd: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New End"
                    value={extension.newEnd}
                    onChange={(e) => setExtension({ ...extension, newEnd: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason"
                    value={extension.reason}
                    onChange={(e) => setExtension({ ...extension, reason: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            ),
          })}
        </Grid>

        <Grid item xs={12} lg={6}>
          {renderSection({
            title: '✅ Notice of Completion',
            actionLabel: 'Publish Notice',
            actionHandler: () => handleSave('Notice of Completion'),
            children: (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project"
                    value={notice.project}
                    onChange={(e) => setNotice({ ...notice, project: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client"
                    value={notice.client}
                    onChange={(e) => setNotice({ ...notice, client: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Completion Date"
                    InputLabelProps={{ shrink: true }}
                    value={notice.completionDate}
                    onChange={(e) => setNotice({ ...notice, completionDate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={notice.remarks}
                    onChange={(e) => setNotice({ ...notice, remarks: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            ),
          })}
        </Grid>

        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            {renderSection({
              title: '📜 Letter of Undertaking',
              actionLabel: 'Save Undertaking',
              actionHandler: () => handleSave('Letter of Undertaking'),
              children: (
                <Box>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={undertaking.subject}
                    onChange={(e) => setUndertaking({ ...undertaking, subject: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Details"
                    value={undertaking.details}
                    onChange={(e) => setUndertaking({ ...undertaking, details: e.target.value })}
                    multiline
                    rows={4}
                  />
                </Box>
              ),
            })}

            {renderSection({
              title: '🏖️ Leave Application',
              actionLabel: 'Submit Leave',
              actionHandler: () => handleSave('Leave Application'),
              children: (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee"
                      value={leave.employee}
                      onChange={(e) => setLeave({ ...leave, employee: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      InputLabelProps={{ shrink: true }}
                      value={leave.startDate}
                      onChange={(e) => setLeave({ ...leave, startDate: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      InputLabelProps={{ shrink: true }}
                      value={leave.endDate}
                      onChange={(e) => setLeave({ ...leave, endDate: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Leave Type"
                      value={leave.type}
                      onChange={(e) => setLeave({ ...leave, type: e.target.value })}
                    />
                  </Grid>
                </Grid>
              ),
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            {renderSection({
              title: '📥 Source Application',
              actionLabel: 'Save Application',
              actionHandler: () => handleSave('Source Application'),
              children: (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Applicant"
                      value={source.applicant}
                      onChange={(e) => setSource({ ...source, applicant: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Application Date"
                      InputLabelProps={{ shrink: true }}
                      value={source.date}
                      onChange={(e) => setSource({ ...source, date: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Reference"
                      value={source.reference}
                      onChange={(e) => setSource({ ...source, reference: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={source.status}
                      onChange={(e) => setSource({ ...source, status: e.target.value })}
                    />
                  </Grid>
                </Grid>
              ),
            })}

            {renderSection({
              title: '🕒 Timesheet tracker',
              children: (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: theme => theme.palette.action.hover }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>From</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>To</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transferRows.map((row) => (
                        <TableRow key={row.name} sx={{ '&:hover': { backgroundColor: '#f1f5f9' } }}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.from}</TableCell>
                          <TableCell>{row.to}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>
                            <Chip label={row.status} size="small" color={row.status === 'Completed' ? 'success' : row.status === 'Pending' ? 'warning' : 'info'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ),
            })}
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
