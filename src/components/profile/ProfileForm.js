import React from 'react';
import { TextField, Button, Box } from '@mui/material';

const ProfileForm = ({ profileData, handleChange, handleSave }) => {
  return (
    <Box component="form" onSubmit={handleSave} noValidate>
      <TextField label="Name" name="name" value={profileData.name} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Email" name="email" value={profileData.email} onChange={handleChange} fullWidth margin="normal" required InputProps={{ readOnly: true }} />
      <TextField label="Date of Birth" name="date_of_birth" value={profileData.date_of_birth} onChange={handleChange} fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} />
      <TextField label="Avg Calorie Intake" name="avg_cal_intake" value={profileData.avg_cal_intake} onChange={handleChange} fullWidth margin="normal" type="number" />
      <TextField label="Goal" name="goal" value={profileData.goal} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Height" name="height" value={profileData.height} onChange={handleChange} fullWidth margin="normal" type="number" />
      <TextField label="Weight" name="weight" value={profileData.weight} onChange={handleChange} fullWidth margin="normal" type="number" />
      <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>Save Profile</Button>
    </Box>
  );
};

export default ProfileForm;
