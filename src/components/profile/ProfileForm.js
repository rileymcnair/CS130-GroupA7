import React from "react";
import { TextField, Button, Box } from "@mui/material";

/**
 * ProfileForm component allows the user to edit their profile details. 
 * It includes form fields for name, email, date of birth, calorie intake, fitness goal, height, and weight.
 * Upon submission, the form data is saved by invoking the handleSave function.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.profileData - The user's profile data, used to populate form fields.
 * @param {Function} props.handleChange - Function to handle input changes in the form.
 * @param {Function} props.handleSave - Function to save the form data when the form is submitted.
 */
const ProfileForm = ({ profileData, handleChange, handleSave }) => {
  return (
    <Box component="form" onSubmit={handleSave} noValidate>
      {/* Name Field */}
      <TextField
        label="Name"
        name="name"
        value={profileData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      
      {/* Email Field (readonly) */}
      <TextField
        label="Email"
        name="email"
        value={profileData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        InputProps={{ readOnly: true }}
      />
      
      {/* Date of Birth Field */}
      <TextField
        label="Date of Birth"
        name="date_of_birth"
        value={profileData.date_of_birth}
        onChange={handleChange}
        fullWidth
        margin="normal"
        type="date"
        InputLabelProps={{ shrink: true }}
      />
      
      {/* Avg Calorie Intake Field */}
      <TextField
        label="Avg Calorie Intake"
        name="avg_cal_intake"
        value={profileData.avg_cal_intake}
        onChange={handleChange}
        fullWidth
        margin="normal"
        type="number"
      />
      
      {/* Goal Field */}
      <TextField
        label="Goal"
        name="goal"
        value={profileData.goal}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      
      {/* Height Field */}
      <TextField
        label="Height"
        name="height"
        value={profileData.height}
        onChange={handleChange}
        fullWidth
        margin="normal"
        type="number"
      />
      
      {/* Weight Field */}
      <TextField
        label="Weight"
        name="weight"
        value={profileData.weight}
        onChange={handleChange}
        fullWidth
        margin="normal"
        type="number"
      />
      
      {/* Save Profile Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
      >
        Save Profile
      </Button>
    </Box>
  );
};

export default ProfileForm;
