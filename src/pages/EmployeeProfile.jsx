import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Grid, Typography, Button, TextField, Card, CardContent, CardMedia,
  Alert, CircularProgress, Tab, Tabs, Avatar, Stack, Divider, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notificationContext = useNotifications();
  const notify = notificationContext?.notify || ((msg, type) => console.log(`[${type}] ${msg}`));
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    contact_number: '',
    location: '',
    personal_email: '',
    date_of_birth: '',
    marital_status: '',
    address: '',
    city: '',
    country: '',
    national_id_number: '',
    passport_number: '',
    bank_name: '',
    bank_account_number: '',
    education_level: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/employees/me');
        setProfile(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          position: res.data.position || '',
          contact_number: res.data.contact_number || '',
          location: res.data.location || '',
          personal_email: res.data.personal_email || '',
          date_of_birth: res.data.date_of_birth || '',
          marital_status: res.data.marital_status || '',
          address: res.data.address || '',
          city: res.data.city || '',
          country: res.data.country || '',
          national_id_number: res.data.national_id_number || '',
          passport_number: res.data.passport_number || '',
          bank_name: res.data.bank_name || '',
          bank_account_number: res.data.bank_account_number || '',
          education_level: res.data.education_level || '',
          emergency_contact_name: res.data.emergency_contact_name || '',
          emergency_contact_phone: res.data.emergency_contact_phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError(error.response?.data?.detail || error.message || 'Unknown error');
        // If not found, try fallback by searching employee by personal_email
        try {
          if (error.response?.status === 404 && user?.email) {
            const fallback = await api.get('/api/employees', { params: { personal_email: user.email } });
            if (Array.isArray(fallback.data) && fallback.data.length > 0) {
              const p = fallback.data[0];
              setProfile(p);
              setFormData({
                full_name: p.full_name || '',
                position: p.position || '',
                contact_number: p.contact_number || '',
                location: p.location || '',
                personal_email: p.personal_email || '',
                date_of_birth: p.date_of_birth || '',
                marital_status: p.marital_status || '',
                address: p.address || '',
                city: p.city || '',
                country: p.country || '',
                national_id_number: p.national_id_number || '',
                passport_number: p.passport_number || '',
                bank_name: p.bank_name || '',
                bank_account_number: p.bank_account_number || '',
                education_level: p.education_level || '',
                emergency_contact_name: p.emergency_contact_name || '',
                emergency_contact_phone: p.emergency_contact_phone || '',
              });
              return;
            }
          }
        } catch (e) {
          console.error('Fallback fetch by personal_email failed:', e);
        }
        notify('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, notify]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.put(`/api/employees/${profile.id}`, formData);
      setProfile(res.data);
      setEditing(false);
      notify('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      notify(error.response?.data?.detail || 'Failed to update profile', 'error');
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
      setPhotoDialogOpen(true);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoPreview) return;
    const fileInput = document.getElementById('photo-input');
    if (!fileInput?.files?.[0]) return;

    setUploadingPhoto(true);
    const formDataPhoto = new FormData();
    formDataPhoto.append('file', fileInput.files[0]);

    try {
      const res = await api.post(`/api/employees/${profile.id}/photo`, formDataPhoto, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, photo_url: res.data.photo_url }));
      setPhotoDialogOpen(false);
      setPhotoPreview(null);
      notify('Photo uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      notify('Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Unable to load your employee profile. {profileError ? `Details: ${profileError}` : 'Please contact HR.'}
        </Alert>
      </Container>
    );
  }

  const missingDocuments = [
    { label: 'National ID', field: 'national_id_number', missing: !profile.national_id_number },
    { label: 'Passport', field: 'passport_number', missing: !profile.passport_number },
    { label: 'Bank Account', field: 'bank_account_number', missing: !profile.bank_account_number },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db', textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={profile.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=1877f2&color=fff&rounded=true`}
                  alt={profile.full_name}
                  sx={{ width: 120, height: 120, fontSize: '3rem' }}
                />
                {((editing || !profile.photo_url) || (user?.employee_id && user.employee_id === profile.id) || user?.role === 'hr_admin') && (
                  <IconButton
                    onClick={() => document.getElementById('photo-input').click()}
                    sx={{
                      position: 'absolute', bottom: 0, right: 0, bgcolor: '#1877f2', color: 'white',
                      '&:hover': { bgcolor: '#0d66cc' }
                    }}
                    size="small"
                  >
                    <CameraAltIcon />
                  </IconButton>
                )}
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoSelect}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                {profile.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile.position || 'Employee'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    File Code
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                    {profile.file_code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Chip
                    label={profile.status || 'Active'}
                    color={profile.status === 'Active' ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    Employment Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                    {profile.employment_type || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    Project
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                    {profile.project || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 3, border: '1px solid #d1d5db' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Personal Information
                </Typography>
                <Button
                  startIcon={editing ? <SaveIcon /> : <EditIcon />}
                  onClick={() => (editing ? handleSave() : setEditing(true))}
                  variant={editing ? 'contained' : 'outlined'}
                  color={editing ? 'success' : 'primary'}
                  size="small"
                >
                  {editing ? 'Save' : 'Edit'}
                </Button>
              </Box>

              <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ px: 2, borderBottom: '1px solid #e5e7eb' }}>
                <Tab label="Personal" />
                <Tab label="Employment" />
                <Tab label="Banking & Identity" />
                <Tab label="Emergency Contact" />
              </Tabs>

              {/* Tab: Personal */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Personal Email"
                        name="personal_email"
                        type="email"
                        value={formData.personal_email}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Marital Status"
                        name="marital_status"
                        select
                        SelectProps={{ native: true }}
                        value={formData.marital_status}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Home Address"
                        name="address"
                        value={formData.address}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab: Employment */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        name="position"
                        value={formData.position}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Education Level"
                        name="education_level"
                        select
                        SelectProps={{ native: true }}
                        value={formData.education_level}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      >
                        <option value="">Select level</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor">Bachelor's Degree</option>
                        <option value="Master">Master's Degree</option>
                        <option value="PhD">PhD</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Number"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Contract Information (Read-only)
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            Contract End
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {profile.contract_end || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab: Banking & Identity */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="National ID Number"
                        name="national_id_number"
                        value={formData.national_id_number}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Passport Number"
                        name="passport_number"
                        value={formData.passport_number}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bank Name"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bank Account Number"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                        Document Status
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {missingDocuments.map((doc) => (
                            <TableRow key={doc.label}>
                              <TableCell>{doc.label}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={doc.missing ? 'Missing' : 'Provided'}
                                  color={doc.missing ? 'error' : 'success'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab: Emergency Contact */}
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Name"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Phone"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Profile Photo
          <IconButton onClick={() => setPhotoDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {photoPreview && (
            <Box sx={{ mb: 2 }}>
              <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePhotoUpload} variant="contained" disabled={uploadingPhoto}>
            {uploadingPhoto ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
