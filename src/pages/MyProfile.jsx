import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Paper, Typography, Box, Grid, Button, Stack, CircularProgress, Alert, Divider,
} from '@mui/material';
import { Upload, BadgeCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

async function uploadTo(apiPath, file) {
  const form = new FormData();
  form.append('file', file);
  return api.post(apiPath, form);
}

export default function MyProfile() {
  const { user } = useAuth();
  const [sigStatus, setSigStatus] = useState('idle');
  const [stampStatus, setStampStatus] = useState('idle');
  const [passportStatus, setPassportStatus] = useState('idle');
  const [fullStatus, setFullStatus] = useState('idle');
  const [mySig, setMySig] = useState(null);
  const [hrStamp, setHrStamp] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'hr_admin';

  useEffect(() => {
    const load = async () => {
      try {
        const [sigRes, stampRes, empRes] = await Promise.all([
          api.get('/api/signatures/me'),
          api.get('/api/hr-stamp'),
          user?.employee_id ? api.get(`/api/employees/${user.employee_id}`) : Promise.resolve({ data: null }),
        ]);
        setMySig(sigRes.data);
        setHrStamp(stampRes.data);
        setEmployee(empRes.data);
      } catch (e) {
        console.error('Profile load error', e);
      }
    };
    load();
  }, [user]);

  const handleSig = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setSigStatus('Uploading…');
      const res = await uploadTo('/api/signatures', f);
      setMySig({ has_signature: true, signature_url: res.data.signature_url });
      setNotice('Digital signature uploaded. You can now sign forms, contracts and approvals online.');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Signature upload failed.');
    } finally {
      setSigStatus('idle');
    }
  };

  const handleStamp = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setStampStatus('Uploading…');
      const res = await uploadTo('/api/hr-stamp', f);
      setHrStamp({ has_stamp: true, stamp_url: res.data.stamp_url });
      setNotice('Official HR electronic stamp uploaded.');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Stamp upload failed.');
    } finally {
      setStampStatus('idle');
    }
  };

  const handlePhoto = (kind) => async (e) => {
    const f = e.target.files?.[0];
    if (!f || !user?.employee_id) return;
    try {
      if (kind === 'passport') setPassportStatus('Uploading…');
      else setFullStatus('Uploading…');
      const res = await uploadTo(`/api/employees/${user.employee_id}/photos/${kind}`, f);
      if (kind === 'passport') setEmployee({ ...employee, passport_photo_url: res.data.passport_photo_url });
      else setEmployee({ ...employee, full_photo_url: res.data.full_photo_url });
      setNotice(kind === 'passport' ? 'Passport photo uploaded — used for ID & insurance beneficiaries.' : 'Full-length photo uploaded — used for birthdays & Employee of the Month.');
    } catch (err) {
      setError(err?.response?.data?.detail || `${kind} photo upload failed.`);
    } finally {
      if (kind === 'passport') setPassportStatus('idle');
      else setFullStatus('idle');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="✍️ My Digital Identity" subtitle="Upload your personal digital signature, passport photo and full-length photo for digital signing, ID generation and recognition." />
      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {employee && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>👤 My Staff Record</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Box>Name: <strong>{employee.full_name}</strong></Box>
            <Box>File code: <strong>{employee.file_code}</strong></Box>
            <Box>Position: <strong>{employee.position}</strong></Box>
            <Box>Status: <strong>{employee.status}</strong></Box>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={3}>
{/* Digital signature */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>✍️ Digital Signature</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sign on plain white paper, scan or photograph it, then upload. Use it to sign forms, contracts and approvals online.
            </Typography>
            {mySig?.has_signature ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box component="img" src={mySig.signature_url} alt="my signature" sx={{ height: 70, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2, p: 1 }} />
                <BadgeCheck color="#16a34a" />
                <Typography variant="body2" color="text.secondary">Signature on file</Typography>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>No digital signature uploaded yet.</Alert>
            )}
            <Button variant="contained" component="label" startIcon={<Upload size={15} />} disabled={sigStatus !== 'idle'} sx={{ textTransform: 'none' }}>
              {sigStatus === 'Uploading…' ? 'Uploading…' : 'Upload my signature'}
              <input type="file" accept="image/*" hidden onChange={handleSig} />
            </Button>
          </Paper>
        </Grid>

        {isAdmin && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🏛️ Official HR Electronic Stamp</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The People & Culture department uploads the official electronic stamp used to authenticate HR documents digitally.
              </Typography>
              {hrStamp?.has_stamp ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box component="img" src={hrStamp.stamp_url} alt="HR stamp" sx={{ height: 90, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2, p: 1 }} />
                  <Typography variant="body2" color="text.secondary">{hrStamp.label}</Typography>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>No official HR stamp uploaded yet.</Alert>
              )}
              <Button variant="contained" component="label" startIcon={<Upload size={15} />} disabled={stampStatus !== 'idle'} sx={{ textTransform: 'none' }}>
                {stampStatus === 'Uploading…' ? 'Uploading…' : 'Upload HR stamp'}
                <input type="file" accept="image/*" hidden onChange={handleStamp} />
              </Button>
            </Paper>
          </Grid>
        )}
{/* Passport photo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>📸 Passport Photo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a passport-size photo — supports ID generation and medical-insurance beneficiary records.
            </Typography>
            {employee?.passport_photo_url ? (
              <Box sx={{ mb: 2 }}>
                <Box component="img" src={employee.passport_photo_url} alt="passport" sx={{ width: 64, borderRadius: '14px', border: '1px solid #e2e8f0' }} />
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>No passport photo uploaded.</Alert>
            )}
            <Button variant="outlined" component="label" startIcon={<Upload size={15} />} disabled={passportStatus !== 'idle'} sx={{ textTransform: 'none' }}>
              {passportStatus === 'Uploading…' ? 'Uploading…' : 'Upload passport photo'}
              <input type="file" accept="image/*" hidden onChange={handlePhoto('passport')} />
            </Button>
          </Paper>
        </Grid>

        {/* Full photo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🧍 Full-Length Photo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a full-length photo — used for birthday celebrations and recognition (Employee of the Month).
            </Typography>
            {employee?.full_photo_url ? (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Box component="img" src={employee.full_photo_url} alt="full length" sx={{ maxHeight: 150, borderRadius: '14px', border: '1px solid #e2e8f0' }} />
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>No full-length photo uploaded.</Alert>
            )}
            <Button variant="outlined" component="label" startIcon={<Upload size={15} />} disabled={fullStatus !== 'idle'} sx={{ textTransform: 'none' }}>
              {fullStatus === 'Uploading…' ? 'Uploading…' : 'Upload full photo'}
              <input type="file" accept="image/*" hidden onChange={handlePhoto('full')} />
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 3, mb: 1 }} />
      <Typography variant="caption" color="text.secondary">
        Your photos and signature are stored securely and applied to staff ID, medical insurance beneficiaries, birthday wall and recognition programs.
      </Typography>
    </Container>
  );
}