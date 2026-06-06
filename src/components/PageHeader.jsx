import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, Paper } from '@mui/material';

export default function PageHeader({ title, subtitle, primaryAction, menuItems = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 0, border: '1px solid', borderColor: '#d1d5db', bgcolor: '#f8fafc' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', fontSize: '1.125rem', lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ mt: 0.5, maxWidth: 680, lineHeight: 1.4, fontSize: '0.9rem', color: '#475569' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {primaryAction}
          {menuItems.length > 0 && (
            <>
              <Button variant="outlined" onClick={handleOpen} sx={{ borderColor: '#1877f2', color: '#1877f2', textTransform: 'none', py: 0.5 }}>
                Actions
              </Button>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      item.onClick?.();
                      handleClose();
                    }}
                    sx={{ minWidth: 200, py: 0.75 }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
