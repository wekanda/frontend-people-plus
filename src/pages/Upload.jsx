import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Stack,
  Input,
} from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function Upload() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setStatus('');
    setError('');
    setResults([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select one or more Excel files first.');
      return;
    }

    setUploading(true);
    setError('');
    setStatus('Uploading files...');
    const uploadResults = [];

    for (const fileItem of files) {
      try {
        const formData = new FormData();
        formData.append('file', fileItem);
        const res = await api.post('/upload/excel', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        uploadResults.push({ file: fileItem.name, success: true, message: res.data.message });
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
        uploadResults.push({ file: fileItem.name, success: false, message: errorMessage });
      }
    }

    setResults(uploadResults);
    setStatus('Upload process finished.');
    setUploading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="📤 Excel Import"
        subtitle="Upload a spreadsheet and use the page menu for import controls."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#1877f2' }} onClick={handleUpload} disabled={files.length === 0 || uploading}>
            Upload Excel
          </Button>
        )}
        menuItems={[
          { label: 'Choose File', onClick: () => document.getElementById('excel-upload').click() },
          { label: 'Go to Staff', onClick: () => navigate('/staff') },
          { label: 'Go to Dashboard', onClick: () => navigate('/') }
        ]}
      />
      <Typography sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
        Upload a Microsoft Excel file containing employees, projects, locations, contract data, contact details, and document flags.
        The app will import or update staff records automatically.
      </Typography>

      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Choose an Excel file
          </Typography>
          <Input
            id="excel-upload"
            type="file"
            inputProps={{ accept: '.xlsx,.xls', multiple: true }}
            onChange={handleFileChange}
            sx={{ bgcolor: '#f8fbff', p: 1, borderRadius: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Select one or more Excel files from the HR upload package. The system supports employee records, contracts, and document status fields.
          </Typography>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            sx={{ background: '#1877f2', width: 220, textTransform: 'none' }}
          >
            Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Excel'}
          </Button>
          {files.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected files: {files.map((file) => file.name).join(', ')}
            </Typography>
          )}
          {uploading && <LinearProgress />}
          {status && <Alert severity="success">{status}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {results.length > 0 && (
            <Paper sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Upload results
              </Typography>
              {results.map((result) => (
                <Typography key={result.file} sx={{ color: result.success ? 'success.main' : 'error.main', mb: 0.5 }}>
                  {result.file}: {result.message}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </Paper>

      <Alert severity="info">
        Only HR admins can upload employee Excel data. If you need to manage staff manually, use the Staff Directory page.
      </Alert>
    </Container>
  );
}
