/**
 * Payroll Management Component
 * Handles salary calculations, payroll generation, and approval
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import { Download, Check, X as XIcon } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Form fields
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [basicSalary, setBasicSalary] = useState('');

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
    fetchStatistics();
  }, [filterStatus]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.get('/api/payroll/list', { params });
      setPayrolls(response.data);
    } catch (err) {
      setError('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/payroll/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleGeneratePayroll = async () => {
    if (!selectedEmployee || !payPeriodStart || !payPeriodEnd || !basicSalary) {
      setError('Please fill all fields');
      return;
    }

    try {
      await api.post('/api/payroll/generate', {
        employee_id: parseInt(selectedEmployee),
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        basic_salary: parseFloat(basicSalary),
      });

      setSuccess('Payroll generated successfully');
      setGenerateDialogOpen(false);
      resetForm();
      fetchPayrolls();
      fetchStatistics();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate payroll');
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    try {
      await api.post(`/api/payroll/${payrollId}/approve`);
      setSuccess('Payroll approved');
      fetchPayrolls();
      fetchStatistics();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve payroll');
    }
  };

  const handleMarkPaid = async (payrollId) => {
    try {
      await api.post(`/api/payroll/${payrollId}/mark-paid`);
      setSuccess('Payroll marked as paid');
      fetchPayrolls();
      fetchStatistics();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark payroll as paid');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setPayPeriodStart('');
    setPayPeriodEnd('');
    setBasicSalary('');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      draft: { color: 'default', label: 'Draft' },
      submitted: { color: 'info', label: 'Submitted' },
      approved: { color: 'success', label: 'Approved' },
      paid: { color: 'success', label: 'Paid' },
    };

    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="💰 Payroll Management"
        subtitle="Generate, approve, and manage employee payroll"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Employees (This Month)
                </Typography>
                <Typography variant="h5">{statistics.total_employees}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Gross Salary
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(statistics.total_gross_salary)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Deductions
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(statistics.total_deductions)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Net Salary
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(statistics.total_net_salary)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Payroll Controls" />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => setGenerateDialogOpen(true)}
              sx={{ backgroundColor: '#1E5A96' }}
            >
              Generate New Payroll
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1E5A96', '& th': { color: 'white' } }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="right">Basic Salary</TableCell>
                <TableCell align="right">Gross Salary</TableCell>
                <TableCell align="right">Deductions</TableCell>
                <TableCell align="right">Net Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((payroll) => (
                  <TableRow key={payroll.id} hover>
                    <TableCell>
                      {payroll.employee?.full_name} ({payroll.employee?.file_code})
                    </TableCell>
                    <TableCell>
                      {new Date(payroll.pay_period_start).toLocaleDateString()} -{' '}
                      {new Date(payroll.pay_period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(payroll.basic_salary)}</TableCell>
                    <TableCell align="right">{formatCurrency(payroll.gross_salary)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(payroll.income_tax + payroll.nssf_contribution)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(payroll.net_salary)}</TableCell>
                    <TableCell>{getStatusChip(payroll.status)}</TableCell>
                    <TableCell align="right">
                      {payroll.status === 'draft' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApprovePayroll(payroll.id)}
                        >
                          <Check size={16} /> Approve
                        </Button>
                      )}
                      {payroll.status === 'approved' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkPaid(payroll.id)}
                        >
                          <Check size={16} /> Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Generate Payroll Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="Select Employee"
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.file_code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Pay Period Start"
            type="date"
            value={payPeriodStart}
            onChange={(e) => setPayPeriodStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Pay Period End"
            type="date"
            value={payPeriodEnd}
            onChange={(e) => setPayPeriodEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Basic Salary (UGX)"
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value)}
            inputProps={{ step: 1000 }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGeneratePayroll} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
