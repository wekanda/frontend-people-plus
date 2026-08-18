import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Divider, Stack, List, ListItemButton, ListItemText, Paper, Badge } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const navItems = [
  { label: '📊 Dashboard', path: '/', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '🧾 Payslips', path: '/payslips', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '💼 Recruitment', path: '/recruitment', roles: ['hr_admin', 'project_manager'] },
  { label: '🧾 Job Admin', path: '/recruitment-admin', roles: ['hr_admin', 'project_manager'] },
  { label: '👤 Applicants', path: '/applicants', roles: ['hr_admin', 'project_manager'] },
  { label: '📈 Pipeline', path: '/pipeline', roles: ['hr_admin', 'project_manager'] },
  { label: '🧰 HR Tools', path: '/hr-tools', roles: ['hr_admin', 'project_manager'] },
  { label: '🎯 Assessments', path: '/assessments', roles: ['hr_admin', 'project_manager'] },
  { label: '📄 Offer Management', path: '/offers', roles: ['hr_admin', 'project_manager'] },
  { label: '🔍 Background Checks', path: '/background-checks', roles: ['hr_admin', 'project_manager'] },
  { label: '🔐 Compliance', path: '/compliance', roles: ['hr_admin', 'project_manager'] },
  { label: '📊 Analytics', path: '/reporting', roles: ['hr_admin', 'project_manager'] },
  { label: '🚀 Onboarding', path: '/onboarding', roles: ['hr_admin', 'project_manager'] },
  { label: '📝 Contracts', path: '/contracts', roles: ['hr_admin', 'project_manager'] },
  { label: '📄 Documents', path: '/documents', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
  { label: '📄 Forms Library', path: '/forms', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
  { label: '🔐 Permissions Matrix', path: '/permissions', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
  { label: '� Interviews', path: '/interviews', roles: ['hr_admin', 'project_manager'] },
  { label: '�🎓 Internships', path: '/internships', roles: ['hr_admin', 'project_manager'] },
  { label: '👥 Staff Directory', path: '/staff', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '💰 Finance', path: '/finance', roles: ['hr_admin', 'project_manager', 'finance', 'pay'] },
  { label: '🏖️ Leave Management', path: '/leave', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '⏱️ Timesheet', path: '/timesheet', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '⭐ Appraisals', path: '/appraisals', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '📋 Independent Sheet', path: '/sheet', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '🔔 Notifications', path: '/notifications', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
  { label: '📥 Excel Import', path: '/upload', roles: ['hr_admin'] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
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

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.1)' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '3px' } }}>
          <List disablePadding sx={{ gap: 0.25, display: 'flex', flexDirection: 'column' }}>
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/'}
                  sx={{
                    color: 'inherit',
                    borderRadius: 1,
                    mb: 0.25,
                    py: { xs: 1, md: 1.25 },
                    px: { xs: 1.5, md: 2 },
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
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
                  <ListItemText
                    primary={
                      item.path === '/notifications' ? (
                        <Badge
                          badgeContent={unreadCount}
                          color="secondary"
                          showZero={false}
                          max={99}
                          sx={{ '& .MuiBadge-badge': { right: -18, top: 6, fontSize: '0.65rem' } }}
                        >
                          <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                            {item.label}
                          </Typography>
                        </Badge>
                      ) : (
                        item.label
                      )
                    }
                    primaryTypographyProps={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
                  />
                </ListItemButton>
              ))}
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
