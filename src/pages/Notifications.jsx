import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { unreadCount, refreshUnreadCount, markAllRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setError('');
    } catch (err) {
      console.error('Notification load error:', err);
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((note) => note.id === id ? { ...note, read: true } : note));
    } catch (err) {
      console.error('Notification mark as read error:', err);
      setError('Unable to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      setLoading(true);
      await markAllRead();
      await fetchNotifications();
      setError('');
    } catch (err) {
      console.error('Mark all read error:', err);
      setError('Unable to mark all notifications as read.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="🔔 Notifications"
        subtitle="Review all alerts, approvals, and reminders in one place."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#1877f2' }} onClick={() => navigate('/') }>
            Back to Dashboard
          </Button>
        )}
        menuItems={[
          { label: 'Refresh', onClick: fetchNotifications },
          { label: 'Go to Staff Directory', onClick: () => navigate('/staff') },
          { label: 'Go to Leave', onClick: () => navigate('/leave') }
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || loading}
          sx={{ textTransform: 'none', color: '#1877f2', borderColor: '#1877f2' }}
        >
          Mark all read
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Recent Notifications
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {notifications.length > 0 ? (
            <List>
              {notifications.map((note) => (
                <Box key={note.id} sx={{ mb: 1, bgcolor: note.read ? 'background.paper' : '#eef5ff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <ListItem disableGutters sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 2 }}>
                    <ListItemText
                      primary={note.message}
                      secondary={new Date(note.created_at).toLocaleString()}
                      primaryTypographyProps={{ fontWeight: note.read ? 'normal' : 'bold' }}
                    />
                    {!note.read && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" variant="contained" onClick={() => markAsRead(note.id)}>
                          Mark as read
                        </Button>
                      </Stack>
                    )}
                  </ListItem>
                </Box>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">You have no notifications at the moment.</Typography>
          )}
        </Paper>
      )}
    </Container>
  );
}
