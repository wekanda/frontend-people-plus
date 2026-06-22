/**
 * Excel Import Component
 * Bulk import employees from Excel files
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const STEPS = ['Download Template', 'Prepare Data', 'Upload File', 'Review Results'];

export default function ExcelImport() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResults, setImportResults] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/excel/employee-template');
      
      // Create a simple CSV template instead
      const template = `file_code,full_name,email,position,contact_number,project,location,employment_type,date_of_appointment,contract_start,contract_end
EMP001,John Doe,john@example.com,Senior Manager,+256-123-456789,Project Alpha,Kampala,Permanent,2023-01-15,2023-01-15,2026-01-14
EMP002,Jane Smith,jane@example.com,Accountant,+256-234-567890,Finance,Kampala,Contract,2023-03-20,2023-03-20,2025-03-19
EMP003,Robert Johnson,robert@example.com,HR Officer,+256-345-678901,HR,Kampala,Permanent,2022-06-10,2022-06-10,2099-12-31`;

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
      element.setAttribute('download', 'employee_import_template.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setSuccess('Template downloaded successfully');
      setActiveStep(1);
    } catch (err) {
      setError('Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel or CSV file');
        return;
      }

      setFile(selectedFile);
      setError('');
      setActiveStep(2);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/excel/import-employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportResults(response.data);
      setSuccess(`Successfully imported ${response.data.imported.length} employees`);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setImportResults(null);
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="📥 Excel Employee Import"
        subtitle="Bulk import employees from Excel or CSV files"
      />

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

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

      {/* Step 1: Download Template */}
      {activeStep === 0 && (
        <Card>
          <CardHeader title="Step 1: Download Template" />
          <CardContent>
            <Typography sx={{ mb: 3 }}>
              Download the Excel template to get started. The template includes all required and optional columns for importing employees.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Required Columns:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle size={20} color="#4caf50" />
                  </ListItemIcon>
                  <ListItemText primary="file_code" secondary="Unique employee ID" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle size={20} color="#4caf50" />
                  </ListItemIcon>
                  <ListItemText primary="full_name" secondary="Employee full name" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle size={20} color="#4caf50" />
                  </ListItemIcon>
                  <ListItemText primary="email" secondary="Employee email address" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle size={20} color="#4caf50" />
                  </ListItemIcon>
                  <ListItemText primary="position" secondary="Job position/title" />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Optional Columns:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AlertCircle size={20} color="#2196f3" />
                  </ListItemIcon>
                  <ListItemText primary="contact_number" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AlertCircle size={20} color="#2196f3" />
                  </ListItemIcon>
                  <ListItemText primary="project, location, employment_type" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AlertCircle size={20} color="#2196f3" />
                  </ListItemIcon>
                  <ListItemText primary="date_of_appointment, contract_start, contract_end (use YYYY-MM-DD format)" />
                </ListItem>
              </List>
            </Box>

            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadTemplate}
              disabled={loading}
              sx={{ mt: 3, backgroundColor: '#1E5A96' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Download Template'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Prepare Data */}
      {activeStep === 1 && (
        <Card>
          <CardHeader title="Step 2: Prepare Your Data" />
          <CardContent>
            <Typography sx={{ mb: 3 }}>
              Fill in the downloaded template with your employee data. Make sure to follow these guidelines:
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle size={20} color="#4caf50" />
                </ListItemIcon>
                <ListItemText
                  primary="Keep required columns"
                  secondary="Do not remove file_code, full_name, email, or position columns"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle size={20} color="#4caf50" />
                </ListItemIcon>
                <ListItemText
                  primary="Date format"
                  secondary="Use YYYY-MM-DD format for all dates (e.g., 2023-01-15)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle size={20} color="#4caf50" />
                </ListItemIcon>
                <ListItemText
                  primary="No special characters"
                  secondary="Avoid special characters in file codes and names"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle size={20} color="#4caf50" />
                </ListItemIcon>
                <ListItemText
                  primary="Save as Excel or CSV"
                  secondary="Save your file as .xlsx, .xls, or .csv"
                />
              </ListItem>
            </List>

            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              sx={{ mt: 3, backgroundColor: '#1E5A96' }}
            >
              Continue to Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upload File */}
      {activeStep === 2 && (
        <Card>
          <CardHeader title="Step 3: Upload File" />
          <CardContent>
            <Box
              sx={{
                border: '2px dashed #1E5A96',
                borderRadius: '8px',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              component="label"
            >
              <Upload size={48} color="#1E5A96" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Drop your file here or click to select
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Supported formats: Excel (.xlsx, .xls), CSV (.csv)
              </Typography>
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
              />
            </Box>

            {file && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="subtitle2">
                  Selected file: <strong>{file.name}</strong>
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={!file || loading}
                sx={{ backgroundColor: '#1E5A96' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Import Employees'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {activeStep === 3 && importResults && (
        <Card>
          <CardHeader title="Step 4: Import Results" />
          <CardContent>
            <Alert severity={importResults.errors.length === 0 ? 'success' : 'warning'} sx={{ mb: 3 }}>
              {importResults.message}
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Summary:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  label={`${importResults.imported.length} Imported`}
                  color="success"
                  variant="outlined"
                />
                {importResults.errors.length > 0 && (
                  <Chip
                    label={`${importResults.errors.length} Errors`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {importResults.imported.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Successfully Imported:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>File Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.imported.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.file_code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status === 'created' ? 'Created' : 'Updated'}
                              size="small"
                              variant="outlined"
                              color={item.status === 'created' ? 'success' : 'info'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {importResults.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Errors:
                </Typography>
                <List>
                  {importResults.errors.map((error, idx) => (
                    <ListItem key={idx} dense>
                      <ListItemIcon>
                        <AlertCircle size={20} color="#d32f2f" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleReset}
              sx={{ mt: 3, backgroundColor: '#1E5A96' }}
            >
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
