import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import api from '../api';

function SlideDown(props) {
  return <Slide {...props} direction="down" />;
}

/**
 * Sliding alert toasts - unread notifications slide in like adverts for a few
 * seconds, one after another, then slide away.
 */
export default function ToastAlerts() {
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get('/api/notifications/')
      .then((res) => {
        if (!alive) return;
        const list = (res.data || []).filter((n) => !n.read).slice(0, 8);
        setQueue(list);
        setOpen(list.length > 0);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Re-open the toast whenever we advance to the next notification.
  useEffect(() => {
    if (!queue.length) return;
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 4200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, queue.length]);

  if (!queue.length) return null;
  const message = queue[idx] ? queue[idx].message || 'New notification' : '';

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      TransitionComponent={SlideDown}
      onExited={() => setIdx((i) => (i + 1) % queue.length)}
      sx={{ zIndex: 9999 }}
    >
      <Alert severity="info" variant="filled" onClose={() => setOpen(false)}
        sx={{ boxShadow: 6, borderRadius: 2, minWidth: { xs: '80vw', sm: 380 }, maxWidth: 520 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}