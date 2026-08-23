import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Divider, Stack, List, ListItemButton, ListItemText, Paper, Badge } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

/**
 * Navigation is grouped into logical sections so related documents, forms and
 * tools live under one heading (Payroll & Benefits, Procurement & Stores,
 * Documentation, HR Tools, Alerts, Pipeline, Internships & Volunteers...).
 */
const NAV_SECTIONS = [
  {
    heading: 'Overview',
    items: [
      { label: '📊 Dashboard', path: '/', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
      { label: '🔔 Smart Alerts', path: '/alerts', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
    ],
  },
  {
    heading: 'Payroll & Benefits',
    items: [
      { label: '💰 Payroll', path: '/payroll', roles: ['hr_admin', 'finance'] },
      { label: '🧾 Payslips', path: '/payslips', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
      { label: '🏦 Finance', path: '/finance', roles: ['hr_admin', 'project_manager', 'finance', 'pay'] },
      { label: '💳 Payslips, Medical & Benefits', path: '/forms?category=Payroll%20%26%20Benefits', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
    ],
  },
  {
    heading: 'Procurement & Stores',
    items: [
      { label: '🧾 Stores & Procurement Forms', path: '/forms?category=Procurement%20%26%20Stores', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
    ],
  },
  {
    heading: 'People & Performance',
    items: [
      { label: '👥 Staff Directory', path: '/staff', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
      { label: '🎓 Internships & Volunteers', path: '/internships', roles: ['hr_admin', 'project_manager'] },
      { label: '⭐ Performance Appraisals', path: '/appraisals', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: '⏱️ Leave & Timesheets', path: '/timesheet', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: '🏖️ Leave Management', path: '/leave', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: '🚀 Onboarding', path: '/onboarding', roles: ['hr_admin', 'project_manager'] },
      { label: '📁 Personnel File', path: '/personnel-file', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Documentation & Contracts',
    items: [
      { label: '📄 Forms Library', path: '/forms', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
      { label: '📑 Contract & Letters', path: '/forms?category=Contracts%20%26%20Letters', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
      { label: '📝 Contract Generation', path: '/contracts', roles: ['hr_admin', 'project_manager'] },
      { label: '📋 Document Management', path: '/documents', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
    ],
  },
  {
    heading: 'HR Resources & Tools',
    items: [
      { label: '🧰 HR Tools & Resources', path: '/hr-tools', roles: ['hr_admin', 'project_manager'] },
      { label: '📥 Excel Import', path: '/excel-import', roles: ['hr_admin'] },
      { label: '🚚 Upload Data', path: '/upload', roles: ['hr_admin'] },
    ],
  },
  {
    heading: 'Recruitment & Pipeline',
    items: [
      { label: '📈 Pipeline & Upcoming', path: '/pipeline', roles: ['hr_admin', 'project_manager'] },
      { label: '💼 Recruitment', path: '/recruitment', roles: ['hr_admin', 'project_manager'] },
      { label: '🧾 Job Admin', path: '/recruitment-admin', roles: ['hr_admin', 'project_manager'] },
      { label: '👤 Applicants', path: '/applicants', roles: ['hr_admin', 'project_manager'] },
      { label: '🎯 Assessments', path: '/assessments', roles: ['hr_admin', 'project_manager'] },
      { label: '💬 Interviews', path: '/interviews', roles: ['hr_admin', 'project_manager'] },
      { label: '📄 Offer Management', path: '/offers', roles: ['hr_admin', 'project_manager'] },
      { label: '🔍 Background Checks', path: '/background-checks', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Compliance & Analytics',
    items: [
      { label: '⚖️ Compliance', path: '/compliance', roles: ['hr_admin', 'project_manager'] },
      { label: '📊 Analytics', path: '/reporting', roles: ['hr_admin', 'project_manager'] },
    ],
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', md: 280 },
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, md: 2 },
          position: { md: 'sticky' },
          top: 0,
          maxHeight: { md: '100vh' },
          overflowY: { md: 'auto' },
          minHeight: { xs: 'auto', md: '100vh' },
          borderRight: { md: `1px solid ${theme => theme.palette.divider}` },
          borderBottom: { xs: `1px solid ${theme => theme.palette.divider}`, md: 'none' },
        }}
      >
        {/* Logo Section */}
        <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1rem', md: '1.1rem' }, color: 'inherit' }}>
            People Plus
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
            HR workflow & approvals
          </Typography>
        </Box>

        {/* User Info Section */}
        <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.08)', display: { xs: 'none', md: 'block' } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44, fontSize: '0.9rem', fontWeight: 700 }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'Guest User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role || 'Employee'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Navigation Menu (grouped by section) */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.1)' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '3px' } }}>
          <List disablePadding sx={{ gap: 0.25, display: 'flex', flexDirection: 'column' }}>
            {NAV_SECTIONS.map((section, si) => {
              const items = section.items.filter((item) => !item.roles || item.roles.includes(user?.role));
              if (!items.length) return null;
              return (
                <Box key={section.heading} sx={{ mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      px: { xs: 1.5, md: 2 },
                      mt: si > 0 ? 1 : 0,
                      mb: 0.5,
                      color: 'rgba(255,255,255,0.55)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                    }}
                  >
                    {section.heading}
                  </Typography>
                  {items.map((item) => (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      end={item.path === '/'}
                      sx={{
                        color: 'inherit',
                        borderRadius: 1,
                        mb: 0.25,
                        py: { xs: 0.85, md: 1 },
                        px: { xs: 1.5, md: 2 },
                        fontSize: { xs: '0.9rem', md: '0.92rem' },
                        transition: 'all 0.2s ease',
                        '&.active': {
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          borderLeft: '3px solid white',
                          fontWeight: 700,
                          paddingLeft: 'calc(2rem - 3px)',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }} />
                    </ListItemButton>
                  ))}
                </Box>
              );
            })}
          </List>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.7rem' }}>
            Quick links
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            <Button
              component={NavLink}
              to="/staff"
              size="small"
              variant="outlined"
              fullWidth
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', py: 0.75, textTransform: 'none' }}
            >
              👥 Staff
            </Button>
            <Button
              component={NavLink}
              to="/documents"
              size="small"
              variant="outlined"
              fullWidth
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', py: 0.75, textTransform: 'none' }}
            >
              📄 Documents
            </Button>
          </Stack>
        </Box>

        {/* Logout Button */}
        <Button
          onClick={logout}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textTransform: 'none', fontWeight: 600 }}
        >
          🚪 Logout
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: 'background.default', overflow: { xs: 'visible', md: 'hidden' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Team'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.9rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} display={{ xs: 'none', md: 'flex' }}>
            <NotificationBell />
            <Button variant="outlined" color="primary" size="small" onClick={logout} sx={{ textTransform: 'none', fontWeight: 600 }}>
              🚪 Logout
            </Button>
          </Stack>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
