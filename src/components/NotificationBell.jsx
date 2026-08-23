import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Box, IconButton, Popover, Badge, List, ListItemButton, ListItemText, Typography, Divider, Button, Stack, CircularProgress } from '@mui/material';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * NotificationBell - a popup bell in the header showing recent notifications
 * with instant read/mark-all, replacing the need to open a separate page.
 */
export default function NotificationBell() {
  const [anchor, setAnchor] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { unreadCount, refreshUnreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const fetchingRef = useRef(false);

  const open = Boolean(anchor);

  const handleOpen = (e) => {
    setAnchor(e.currentTarget);
    if (!fetchingRef.current) {
      fetchingRef.current = true;
      setLoading(true);
      api.get('/api/notifications/', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setNotes(res.data || []))
        .catch(() => setNotes([]))
        .finally(() => { setLoading(false); fetchingRef.current = false; });
    }
  };

  const handleClose = () => { setAnchor(null); fetchNumber(); };
  const fetchNumber = () => refreshUnreadCount();

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, null, { headers: { Authorization: `Bearer ${token}` } });
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      refreshUnreadCount();
    } catch (e) { /* ignore */ }
  };

  const markAll = async () => {
    await markAllRead();
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: 'text.secondary' }} aria-label="Notifications">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Bell size={20} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, borderRadius: 3, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>🔔 Notifications</Typography>
          <Stack direction="row" spacing={1}>
            {unreadCount > 0 && (
              <Button size="small" sx={{ color: 'inherit', fontSize: '0.75rem', textTransform: 'none' }} onClick={markAll}>
                Mark all read
              </Button>
            )}
            <Button size="small" sx={{ color: 'inherit', fontSize: '0.75rem', textTransform: 'none' }} onClick={() => { navigate('/notifications'); handleClose(); }}>
              View all
            </Button>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : notes.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {notes.slice(0, 12).map((n) => (
                <ListItemButton
                  key={n.id}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                  sx={{
                    borderBottom: '1px solid', borderColor: 'divider',
                    bgcolor: n.read ? 'transparent' : 'rgba(25,118,210,0.08)',
                    flexDirection: 'column', alignItems: 'flex-start', py: 1.25,
                  }}
                >
                  <ListItemText
                    primary={n.message}
                    sx={{ m: 0 }}
                    primaryTypographyProps={{ fontWeight: n.read ? 400 : 700, fontSize: '0.82rem', lineHeight: 1.35 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date(n.created_at).toLocaleString()}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
        <Divider />
        <Button fullWidth size="small" onClick={() => { navigate('/notifications'); handleClose(); }} sx={{ textTransform: 'none', py: 1 }}>
          Open Notifications page
        </Button>
      </Popover>
    </>
  );
}