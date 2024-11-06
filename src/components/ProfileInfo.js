import React from 'react';
import { Typography, Button, Box } from '@mui/material';

const ProfileInfo = ({ profileData, handleEdit }) => {
  return (
    <Box>
      <Typography><strong>Name:</strong> {profileData.name}</Typography>
      <Typography><strong>Email:</strong> {profileData.email}</Typography>
      <Typography><strong>Date of Birth:</strong> {profileData.date_of_birth}</Typography>
      <Typography><strong>Avg Calorie Intake:</strong> {profileData.avg_cal_intake}</Typography>
      <Typography><strong>Goal:</strong> {profileData.goal}</Typography>
      <Typography><strong>Height:</strong> {profileData.height}</Typography>
      <Typography><strong>Weight:</strong> {profileData.weight}</Typography>
      <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleEdit}>
        Edit Profile
      </Button>
    </Box>
  );
};

export default ProfileInfo;
