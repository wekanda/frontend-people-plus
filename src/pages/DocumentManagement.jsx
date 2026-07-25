/**
 * Document Management Component
 * Handles employee document uploads, approvals, and e-PFile tracking
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Container,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download, CheckCircle, Clock, X as XIcon } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [file, setFile] = useState(null);
  const [uploadingDocId, setUploadingDocId] = useState(null);

  useEffect(() => {
    fetchDocumentTypes();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeDocuments(selectedEmployee);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeDocuments(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchDocumentTypes = async () => {
    try {
      const response = await api.get('/api/documents/types');
      setDocumentTypes(response.data);
    } catch (err) {
      console.error('Error fetching document types:', err);
      setError('Failed to load document types');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees/');
      setEmployees(response.data);
      if (response.data.length > 0) {
        setSelectedEmployee(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedEmployee || !selectedDocType) {
      setError('Please select employee, document type, and file');
      return;
    }

    setUploadingDocId(selectedEmployee);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(
        `/api/documents/upload?employee_id=${selectedEmployee}&document_type_id=${selectedDocType}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setSuccess('Document uploaded successfully');
      setUploadDialogOpen(false);
      setFile(null);
      setSelectedDocType('');
      // Refresh documents list
      if (selectedEmployee) {
        fetchEmployeeDocuments(selectedEmployee);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploadingDocId(null);
    }
  };

  const fetchEmployeeDocuments = async (employeeId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/documents/employee/${employeeId}`);
      // Ensure we have an array
      const docs = Array.isArray(response.data) ? response.data : [];
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
      setError(err.response?.data?.detail || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (docId) => {
    try {
      await api.post(`/api/documents/${docId}/approve`);
      setSuccess('Document approved');
      if (selectedEmployee) {
        fetchEmployeeDocuments(selectedEmployee);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval failed');
    }
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);
    fetchEmployeeDocuments(employeeId);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending', icon: Clock },
      approved: { color: 'success', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'error', label: 'Rejected', icon: XIcon },
    };

    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      <PageHeader
        title="📄 Document Management"
        subtitle="Upload, approve, and track employee documents for electronic personnel files (e-PFile)"
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

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardHeader title="📤 Upload Document" titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          <Grid container spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                  label="Select Employee"
                  size="small"
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.file_code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Button
                variant="contained"
                onClick={() => setUploadDialogOpen(true)}
                fullWidth={{ xs: true, sm: false }}
                sx={{ height: '56px' }}
              >
                📤 Upload New Document
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                <TableRow>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Document Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Uploaded</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Uploaded By</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Expiry</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        No documents found for this employee
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id} hover sx={{ transition: 'background-color 0.2s' }}>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.file_name}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={doc.document_type?.category || 'General'} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: '0.875rem' }}>
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusChip(doc.approval_status)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: '0.875rem' }}>
                        {doc.uploaded_by}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, fontSize: '0.875rem' }}>
                        {doc.expiry_date
                          ? new Date(doc.expiry_date).toLocaleDateString()
                          : 'No expiry'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton size="small" color="primary">
                            <Download size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              label="Document Type"
            >
              {documentTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            inputProps={{ accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploadingDocId !== null}
          >
            {uploadingDocId !== null ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
