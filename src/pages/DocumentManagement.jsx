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
import { DownloadIcon, CheckCircle, Clock, X as XIcon } from 'lucide-react';
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
      const response = await api.get('/api/employees');
      setEmployees(response.data);
      if (response.data.length > 0) {
        setSelectedEmployee(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
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
      const response = await api.get(`/api/documents/employee/${employeeId}`);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents');
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
    <Container maxWidth="xl">
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

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Document Upload" />
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
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
            </Grid>
            <Grid item xs={12} sm={8}>
              <Button
                variant="contained"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload New Document
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1E5A96', '& th': { color: 'white' } }}>
              <TableRow>
                <TableCell>Document Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Approval Status</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.file_name}</TableCell>
                    <TableCell>
                      <Chip label={doc.document_type?.category || 'General'} size="small" />
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusChip(doc.approval_status)}</TableCell>
                    <TableCell>{doc.uploaded_by}</TableCell>
                    <TableCell>
                      {doc.expiry_date
                        ? new Date(doc.expiry_date).toLocaleDateString()
                        : 'No expiry'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <DownloadIcon size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
