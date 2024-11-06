import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';

const ProfileHeader = ({ handleMenuOpen, handleMenuClose, handleBackToHome, handleLogout, anchorEl }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#4CAF50' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Healthify
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleMenuOpen}
          aria-controls="profile-menu"
          aria-haspopup="true"
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleBackToHome}>Back to Home</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default ProfileHeader;
