import React from "react";
import { Typography, Button, Box } from "@mui/material";

/**
 * ProfileInfo component displays the user's profile details, including personal information
 * like name, email, date of birth, and fitness goals. It also provides an "Edit Profile" button.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.profileData - The user's profile data object.
 * @param {Function} props.handleEdit - Function to handle the profile edit action when the button is clicked.
 */
const ProfileInfo = ({ profileData, handleEdit }) => {
  return (
    <Box>
      {/* Section header with "Edit Profile" button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Bio</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleEdit}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Display profile details */}
      <Typography>
        <strong>Name:</strong> {profileData.name}
      </Typography>
      <Typography>
        <strong>Email:</strong> {profileData.email}
      </Typography>
      <Typography>
        <strong>Date of Birth:</strong> {profileData.date_of_birth}
      </Typography>
      <Typography>
        <strong>Avg Calorie Intake:</strong> {profileData.avg_cal_intake}
      </Typography>
      <Typography>
        <strong>Goal:</strong> {profileData.goal}
      </Typography>
      <Typography>
        <strong>Height:</strong> {profileData.height}
      </Typography>
      <Typography>
        <strong>Weight:</strong> {profileData.weight}
      </Typography>
    </Box>
  );
};

export default ProfileInfo;
