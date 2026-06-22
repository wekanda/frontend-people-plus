/**
 * Personnel File (e-PFile) Viewer Component
 * Displays employee document completeness and missing documents
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

export default function PersonnelFile() {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [personnelFile, setPersonnelFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completenessDialogOpen, setCompletenessDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data);
      if (response.data.length > 0) {
        setSelectedEmployee(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  const fetchPersonnelFile = async (employeeId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/documents/personnel-file/${employeeId}`);
      setPersonnelFile(response.data.personnel_file);
      setDocuments(response.data.documents);
      setRequiredDocuments(response.data.required_documents);
    } catch (err) {
      setError('Failed to load personnel file');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);
    fetchPersonnelFile(employeeId);
  };

  const getMissingDocuments = () => {
    const approvedDocs = documents.filter((d) => d.approval_status === 'approved');
    const missingDocs = requiredDocuments.filter(
      (rd) => !approvedDocs.some((ad) => ad.document_type_id === rd.id)
    );
    return missingDocs;
  };

  const getExpiredDocuments = () => {
    return documents.filter((d) => d.is_expired);
  };

  const completenessPercentage = personnelFile?.completeness_percentage || 0;
  const missingCount = getMissingDocuments().length;
  const expiredCount = getExpiredDocuments().length;

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="📋 Electronic Personnel File (e-PFile)"
        subtitle="View employee document completeness and track missing or expired documents"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Employee Selection */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Select Employee" />
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Select Employee"
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.file_code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Completeness Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    File Completeness
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={completenessPercentage}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="h6">{completenessPercentage.toFixed(0)}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: missingCount > 0 ? '#fff3e0' : '#f1f8e9' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Missing Documents
                  </Typography>
                  <Typography variant="h4" color={missingCount > 0 ? '#f57f17' : '#689f38'}>
                    {missingCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: expiredCount > 0 ? '#ffebee' : '#e8f5e9' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Expired Documents
                  </Typography>
                  <Typography variant="h4" color={expiredCount > 0 ? '#d32f2f' : '#388e3c'}>
                    {expiredCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Missing Documents Alert */}
          {missingCount > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<AlertCircle />}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {missingCount} required document(s) missing from this employee's file
              </Typography>
              <Typography variant="body2">
                {getMissingDocuments().map((d) => d.name).join(', ')}
              </Typography>
            </Alert>
          )}

          {/* Document List */}
          <Card>
            <CardHeader title="Documents in File" />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#1E5A96', '& th': { color: 'white' } }}>
                    <TableRow>
                      <TableCell>Document</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Uploaded</TableCell>
                      <TableCell>Expiry</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No documents uploaded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FileText size={18} />
                              {doc.file_name}
                            </Box>
                          </TableCell>
                          <TableCell>{doc.document_type?.category}</TableCell>
                          <TableCell>
                            {doc.approval_status === 'approved' ? (
                              <Chip
                                icon={<CheckCircle size={16} />}
                                label="Approved"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<Clock size={16} />}
                                label="Pending"
                                color="warning"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {doc.expiry_date
                              ? new Date(doc.expiry_date).toLocaleDateString()
                              : 'No expiry'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Required Documents Checklist */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Required Documents Checklist" />
            <CardContent>
              <List>
                {requiredDocuments.map((doc) => {
                  const isUploaded = documents.some(
                    (d) => d.document_type_id === doc.id && d.approval_status === 'approved'
                  );
                  return (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        {isUploaded ? (
                          <CheckCircle size={24} color="#4caf50" />
                        ) : (
                          <AlertCircle size={24} color="#ff9800" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={doc.category}
                        sx={{
                          textDecoration: isUploaded ? 'line-through' : 'none',
                          color: isUploaded ? '#999' : 'inherit',
                        }}
                      />
                      <Chip
                        label={isUploaded ? 'Uploaded' : 'Missing'}
                        color={isUploaded ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}
