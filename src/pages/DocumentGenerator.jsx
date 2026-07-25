/**
 * Document Generator Component
 * Allows users to fill out forms and generate documents (appointment letter, offer, contract, etc.)
 * Documents can be downloaded, printed, or shared with departments
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Download, Printer, Share2 } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const DOCUMENT_TEMPLATES = {
  appointment_letter: {
    name: 'Appointment Letter',
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'employee_email', label: 'Email Address', type: 'email', required: true },
      { name: 'employee_address', label: 'Address', type: 'text', required: false },
      { name: 'position', label: 'Job Position', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'employment_type', label: 'Employment Type', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract', 'Temporary'] },
      { name: 'manager_name', label: 'Manager Name', type: 'text', required: false },
      { name: 'salary', label: 'Annual Salary', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: 'KES' },
      { name: 'benefits', label: 'Benefits', type: 'textarea', required: false },
    ]
  },
  offer_letter: {
    name: 'Offer Letter',
    fields: [
      { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
      { name: 'position', label: 'Position', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'start_date', label: 'Proposed Start Date', type: 'date', required: true },
      { name: 'employment_type', label: 'Employment Type', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract'] },
      { name: 'base_salary', label: 'Base Salary', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: 'KES' },
      { name: 'benefits', label: 'Additional Benefits', type: 'textarea', required: false },
      { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: false },
      { name: 'acceptance_deadline', label: 'Acceptance Deadline', type: 'date', required: true },
    ]
  },
  contract: {
    name: 'Employment Contract',
    fields: [
      { name: 'date', label: 'Contract Date', type: 'date', required: true },
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'employer_name', label: 'Employer Name', type: 'text', required: true, defaultValue: 'People Plus HR Systems' },
      { name: 'position', label: 'Position', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'start_date', label: 'Employment Start Date', type: 'date', required: true },
      { name: 'salary', label: 'Annual Salary', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: 'KES' },
    ]
  },
};

export default function DocumentGenerator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('appointment_letter');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDepartments, setShareDepartments] = useState({
    hr: false,
    finance: false,
    recruitment: false,
    management: false,
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Initialize form data with default values
    const template = DOCUMENT_TEMPLATES[selectedTemplate];
    const defaults = {};
    template.fields.forEach(field => {
      if (field.defaultValue) {
        defaults[field.name] = field.defaultValue;
      }
    });
    setFormData(defaults);
    setPreview('');
  }, [selectedTemplate]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleGeneratePreview = () => {
    // Validate required fields
    const template = DOCUMENT_TEMPLATES[selectedTemplate];
    const missingFields = template.fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Generate simple preview (in real scenario, would call backend)
    const previewText = `
═══════════════════════════════════════════
${template.name.toUpperCase()}
═══════════════════════════════════════════

Generated on: ${new Date().toLocaleDateString()}

Document Details:
${template.fields.map(field => {
  const value = formData[field.name] || '[Not provided]';
  return `${field.label}: ${value}`;
}).join('\n')}

═══════════════════════════════════════════
    `;
    setPreview(previewText);
    setShowPreview(true);
    setError('');
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');

      // Call backend to generate document
      const response = await api.post('/documents/generate', {
        template_type: selectedTemplate,
        ...formData
      }, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTemplate}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Document downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(preview.replace(/\n/g, '<br>'));
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const selectedDepts = Object.keys(shareDepartments).filter(dept => shareDepartments[dept]);

      if (selectedDepts.length === 0) {
        setError('Please select at least one department to share with');
        return;
      }

      // Call backend to share document
      await api.post('/documents/share', {
        template_type: selectedTemplate,
        departments: selectedDepts,
        shared_by: user.email,
        ...formData
      });

      setSuccess(`Document shared with: ${selectedDepts.join(', ')}`);
      setShareDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const template = DOCUMENT_TEMPLATES[selectedTemplate];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="📝 Document Generator"
        subtitle="Create professional HR documents by filling out a simple form. Download, print, or share with other departments."
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

      <Grid container spacing={3}>
        {/* Document Type Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Select Document Type" />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Document Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  label="Document Template"
                >
                  {Object.entries(DOCUMENT_TEMPLATES).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGeneratePreview}
                    disabled={loading}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Download size={18} />}
                    onClick={handleDownload}
                    disabled={loading || !preview}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Printer size={18} />}
                    onClick={handlePrint}
                    disabled={!preview}
                  >
                    Print
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Share2 size={18} />}
                    onClick={() => setShareDialogOpen(true)}
                    disabled={!preview}
                  >
                    Share
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Form Fields */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title={`Fill in ${template.name} Details`} />
            <CardContent>
              <Grid container spacing={2}>
                {template.fields.map(field => (
                  <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.name}>
                    {field.type === 'select' ? (
                      <FormControl fullWidth>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          label={field.label}
                          required={field.required}
                        >
                          {field.options.map(opt => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : field.type === 'textarea' ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={field.label}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        type={field.type}
                        label={field.label}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent dividers sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {preview}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Download size={18} />}
            onClick={handleDownload}
            disabled={loading}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Document with Departments</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select which departments can access this document:
          </Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareDepartments.hr}
                  onChange={(e) => setShareDepartments(prev => ({ ...prev, hr: e.target.checked }))}
                />
              }
              label="HR Department"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareDepartments.finance}
                  onChange={(e) => setShareDepartments(prev => ({ ...prev, finance: e.target.checked }))}
                />
              }
              label="Finance Department"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareDepartments.recruitment}
                  onChange={(e) => setShareDepartments(prev => ({ ...prev, recruitment: e.target.checked }))}
                />
              }
              label="Recruitment Department"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareDepartments.management}
                  onChange={(e) => setShareDepartments(prev => ({ ...prev, management: e.target.checked }))}
                />
              }
              label="Management"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
