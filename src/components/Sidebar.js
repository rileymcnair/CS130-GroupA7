import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Drawer } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 200;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/home' },
    { text: 'Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
    { text: 'Meals', icon: <RestaurantIcon />, path: '/meals' },
    { text: 'User', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleNavigate = (path) => {
    if (path === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
          Healthify
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path ? '#a5f0bc' : 'transparent',
              '&:hover': {
                backgroundColor: '#a5f0bc',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#4caf50' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text} 

            />
          </ListItem>
        ))}
        <ListItem 
          button 
          onClick={() => handleNavigate('logout')}
          sx={{
            mt: 2,
            '&:hover': {
              backgroundColor: '#a5f0bc',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#4caf50' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;