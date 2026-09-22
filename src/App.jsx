import React, { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import StaffDirectory from './pages/StaffDirectory';
import LeaveManagement from './pages/LeaveManagement';
import Timesheet from './pages/Timesheet';
import PerformanceAppraisal from './pages/PerformanceAppraisal';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Recruitment from './pages/Recruitment';
import Internship from './pages/Internship';
import Payslip from './pages/Payslip';
import Finance from './pages/Finance';
import JobAdmin from './pages/JobAdmin';
import Applicants from './pages/Applicants';
import ApplicantDetail from './pages/ApplicantDetail';
import Pipeline from './pages/Pipeline';
import HRTools from './pages/HRTools';
import TalentPool from './pages/TalentPool';
import Referrals from './pages/Referrals';
import Assessments from './pages/Assessments';
import OfferManagement from './pages/OfferManagement';
import BackgroundChecks from './pages/BackgroundChecks';
import Compliance from './pages/Compliance';
import Reporting from './pages/Reporting';
import Onboarding from './pages/Onboarding';
import ContractGeneration from './pages/ContractGeneration';
import Documents from './pages/Documents';
import InterviewScheduling from './pages/InterviewScheduling';
import DocumentManagement from './pages/DocumentManagement';
import DocumentForms from './pages/DocumentForms';
import PersonnelFile from './pages/PersonnelFile';
import PayrollManagement from './pages/PayrollManagement';
import ExcelImport from './pages/ExcelImport';
import Reports from './pages/Reports';
import MedicalInsurance from './pages/MedicalInsurance';
import Subscriptions from './pages/Subscriptions';
import MyProfile from './pages/MyProfile';
import DocumentWorkflow from './pages/DocumentWorkflow';
import Integrations from './pages/Integrations';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function AppContent() {
  const [mode, setMode] = useState('light');
  const colorMode = { toggleColorMode: () => setMode(prev => prev === 'light' ? 'dark' : 'light') };
  const theme = mode === 'light' ? lightTheme : darkTheme;

  let user = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) user = JSON.parse(stored);
  } catch (e) {
    user = null;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'pay', 'it_officer', 'ceo', 'ceo_assistant']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              {/* Removed duplicate 'My Dashboard' route; single Dashboard at '/' */}
              <Route path="staff" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><StaffDirectory /></ProtectedRoute>} />
              <Route path="recruitment" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Recruitment /></ProtectedRoute>} />
              <Route path="recruitment-admin" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><JobAdmin /></ProtectedRoute>} />
              <Route path="applicants" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Applicants /></ProtectedRoute>} />
              <Route path="applicant/:id" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><ApplicantDetail /></ProtectedRoute>} />
              <Route path="pipeline" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Pipeline /></ProtectedRoute>} />
              <Route path="hr-tools" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'pay', 'it_officer', 'ceo', 'ceo_assistant']}><HRTools /></ProtectedRoute>} />
              <Route path="talent-pool" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><TalentPool /></ProtectedRoute>} />
              <Route path="referrals" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Referrals /></ProtectedRoute>} />
              <Route path="assessments" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Assessments /></ProtectedRoute>} />
              <Route path="offers" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><OfferManagement /></ProtectedRoute>} />
              <Route path="background-checks" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><BackgroundChecks /></ProtectedRoute>} />
              <Route path="compliance" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Compliance /></ProtectedRoute>} />
              <Route path="reporting" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Reporting /></ProtectedRoute>} />
              <Route path="onboarding" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Onboarding /></ProtectedRoute>} />
              <Route path="contracts" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><ContractGeneration /></ProtectedRoute>} />
              <Route path="documents" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'it_officer', 'ceo', 'ceo_assistant']}><DocumentManagement /></ProtectedRoute>} />
              <Route path="forms" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><DocumentForms /></ProtectedRoute>} />
              <Route path="interviews" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><InterviewScheduling /></ProtectedRoute>} />
              <Route path="internships" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><Internship /></ProtectedRoute>} />
              <Route path="finance" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'finance', 'pay', 'it_officer']}><Finance /></ProtectedRoute>} />
              <Route path="payslips" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'pay', 'it_officer', 'ceo', 'ceo_assistant']}><Payslip /></ProtectedRoute>} />
              <Route path="leave" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'it_officer', 'ceo', 'ceo_assistant']}><LeaveManagement /></ProtectedRoute>} />
              <Route path="timesheet" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'it_officer', 'ceo', 'ceo_assistant']}><Timesheet /></ProtectedRoute>} />
              <Route path="appraisals" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'it_officer', 'ceo', 'ceo_assistant']}><PerformanceAppraisal /></ProtectedRoute>} />
              <Route path="alerts" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><Alerts /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><Notifications /></ProtectedRoute>} />
              <Route path="personnel-file" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><PersonnelFile /></ProtectedRoute>} />
              <Route path="payroll" element={<ProtectedRoute allowedRoles={['hr_admin', 'finance', 'it_officer']}><PayrollManagement /></ProtectedRoute>} />
              <Route path="excel-import" element={<ProtectedRoute allowedRoles={['hr_admin', 'it_officer']}><ExcelImport /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'finance', 'staff', 'it_officer', 'ceo', 'ceo_assistant']}><Reports /></ProtectedRoute>} />
              <Route path="subscription" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><Subscriptions /></ProtectedRoute>} />
              <Route path="medical-insurance" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'finance', 'pay', 'it_officer']}><MedicalInsurance /></ProtectedRoute>} />
              <Route path="my-profile" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><MyProfile /></ProtectedRoute>} />
              <Route path="document-workflow" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'it_officer', 'ceo', 'ceo_assistant']}><DocumentWorkflow /></ProtectedRoute>} />
              <Route path="integrations" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance', 'it_officer', 'ceo', 'ceo_assistant']}><Integrations /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
