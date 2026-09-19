import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Divider, Stack, List, ListItemButton, ListItemText, IconButton, Drawer, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const ALL = ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'];

/**
 * Navigation is organised into the standard HRIS modules (Dashboard, Staff,
 * Recruitment, Financial, Time & Leave, Performance, Reports, HR Tools,
 * Organization & Settings). Every section is a collapsible dropdown so the
 * menu never feels congested on phones, tablets or laptops.
 */
const NAV_SECTIONS = [
  {
    heading: 'Dashboard',
    icon: '📊',
    items: [
      { label: 'Dashboard', path: '/', roles: ALL },
      { label: 'Smart Alerts', path: '/alerts', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
      { label: 'Analytics', path: '/reporting', roles: ['hr_admin', 'project_manager'] },
      { label: 'Pipeline', path: '/pipeline', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Staff Management',
    icon: '👥',
    items: [
      { label: 'Staff Directory', path: '/staff', roles: ALL },
      { label: 'Personnel Files', path: '/personnel-file', roles: ['hr_admin', 'project_manager'] },
      { label: 'Internships & Volunteers', path: '/internships', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Recruitment Management',
    icon: '🎯',
    items: [
      { label: 'Recruitment', path: '/recruitment', roles: ['hr_admin', 'project_manager'] },
      { label: 'Job Postings', path: '/recruitment-admin', roles: ['hr_admin', 'project_manager'] },
      { label: 'Applicants', path: '/applicants', roles: ['hr_admin', 'project_manager'] },
      { label: 'Interviews', path: '/interviews', roles: ['hr_admin', 'project_manager'] },
      { label: 'Offers', path: '/offers', roles: ['hr_admin', 'project_manager'] },
      { label: 'Background Checks', path: '/background-checks', roles: ['hr_admin', 'project_manager'] },
      { label: 'Onboarding', path: '/onboarding', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Financial Management',
    icon: '💼',
    items: [
      { label: 'Financial Management', path: '/finance', roles: ['hr_admin', 'project_manager', 'finance', 'pay'] },
      { label: 'Payroll', path: '/payroll', roles: ['hr_admin', 'finance'] },
      { label: 'Payslips', path: '/payslips', roles: ALL },
      { label: '🧾 Payslip Tool (inbuilt Excel)', path: '/hr-tools?tab=excel', roles: ALL },
      { label: 'Medical Insurance', path: '/medical-insurance', roles: ['hr_admin', 'project_manager', 'finance', 'pay'] },
    ],
  },
  {
    heading: 'Time & Leave',
    icon: '⏱️',
    items: [
      { label: 'Leave Management', path: '/leave', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: 'Timesheets', path: '/timesheet', roles: ['hr_admin', 'project_manager', 'staff'] },
    ],
  },
  {
    heading: 'Performance',
    icon: '⭐',
    items: [
      { label: 'Performance Appraisals', path: '/appraisals', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: 'Performance Analysis', path: '/reporting?tab=performance', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'Reports',
    icon: '📋',
    items: [
      { label: 'Reports', path: '/reports', roles: ['hr_admin', 'project_manager', 'finance', 'staff'] },
      { label: 'Analytics & Trends', path: '/reporting', roles: ['hr_admin', 'project_manager'] },
    ],
  },
  {
    heading: 'HR Tools & Documents',
    icon: '🧰',
    items: [
      { label: 'HR Tools & Built-in Excel Tools', path: '/hr-tools', roles: ['hr_admin', 'project_manager'] },
      { label: 'Document Forms & Templates', path: '/forms', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
      { label: 'Contract Generation', path: '/contracts', roles: ['hr_admin', 'project_manager'] },
      { label: 'Document Management', path: '/documents', roles: ['hr_admin', 'project_manager', 'staff'] },
      { label: 'Document Workflow', path: '/document-workflow', roles: ['hr_admin', 'project_manager'] },
      { label: 'Excel / Employee Import', path: '/excel-import', roles: ['hr_admin'] },
    ],
  },
  {
    heading: 'Organization & Settings',
    icon: '🏢',
    items: [
      { label: 'Organization Branding (logo & letterhead)', path: '/hr-tools?tab=company', roles: ALL },
      { label: 'Compliance & Policies', path: '/compliance', roles: ['hr_admin', 'project_manager'] },
      { label: 'My Profile & Signature', path: '/my-profile', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
      { label: 'Integrations', path: '/integrations', roles: ALL },
    ],
  },
];

function NavAccordion({ section, open, onToggle, role, onNavigate }) {
  const items = section.items.filter((item) => !item.roles || item.roles.includes(role));
  if (!items.length) return null;
  const expanded = open === section.heading;
  return (
    <Accordion
      expanded={expanded}
      onChange={(e, nowExpanded) => onToggle(section.heading, nowExpanded)}
      square
      disableGutters
      sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
        sx={{
          m: 0,
          px: 1.5,
          py: 1,
          color: 'inherit',
          borderRadius: 1,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'inherit' }}>
          {section.icon} {section.heading}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <List disablePadding sx={{ gap: 0.15, display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => (
            <ListItemButton
              key={item.label + item.path}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              sx={{
                color: 'inherit',
                borderRadius: 1,
                mb: 0.15,
                py: 0.8,
                px: 1.5,
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
                '&.active': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderLeft: '3px solid white',
                  fontWeight: 700,
                  paddingLeft: 'calc(1.5rem - 3px)',
                },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }} />
            </ListItemButton>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Auto-open the section that contains the current page; default to Dashboard.
  let defaultOpen = 'Dashboard';
  for (const section of NAV_SECTIONS) {
    if (section.items.some((item) => item.path.split('?')[0] === currentPath || (currentPath + (location.search || '')).startsWith(item.path))) {
      defaultOpen = section.heading;
      break;
    }
  }
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: '100%' }}>
      {/* Logo Section */}
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25, fontSize: '1.05rem', color: 'inherit' }}>
          People Plus
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
          HR workflow & approvals
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.08)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>{initials}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'Guest User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.role || 'Employee'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Collapsible Navigation Menu */}
      <Box sx={{ flex: 'none', mb: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <NavAccordion key={section.heading} section={section} open={open}
            onToggle={(heading, nowExpanded) => setOpen(nowExpanded ? heading : '')}
            role={user?.role} onNavigate={onNavigate} />
        ))}
      </Box>

      {/* Logout */}
      <Button onClick={logout} fullWidth variant="outlined" size="small"
        sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textTransform: 'none', fontWeight: 600 }}>
        🚪 Logout
      </Button>
    </Box>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Mobile drawer (phones / tablets) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ width: 300, bgcolor: 'primary.main', color: 'primary.contrastText', display: { md: 'none' }, overflowY: 'auto' }}
      >
        <SidebarContent onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', md: 290 },
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: { xs: 2, md: 2 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 1.5,
          position: { md: 'sticky' },
          top: 0,
          maxHeight: { md: '100vh' },
          overflowY: { md: 'auto' },
          minHeight: { md: '100vh' },
          borderRight: { md: '1px solid rgba(255,255,255,0.12)' },
        }}
      >
        <SidebarContent onNavigate={() => {}} />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: 'background.default', minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' }, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.25rem', md: '1.45rem' } }}>
                Welcome back, {user?.full_name?.split(' ')[0] || 'Team'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.88rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <NotificationBell />
            <Button variant="outlined" color="primary" size="small" onClick={logout} sx={{ display: { xs: 'none', md: 'inline-flex' }, textTransform: 'none', fontWeight: 600 }}>
              🚪 Logout
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Page Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}