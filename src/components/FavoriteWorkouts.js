import React from 'react';
import { Typography, Button, Box, List, ListItem, IconButton, Paper, Divider } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const FavoriteWorkouts = ({ workoutDetails, profileData, handleWorkoutDialogOpen, removeFavorite }) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Favorited Workouts</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleWorkoutDialogOpen}
        >
          Add Workout
        </Button>
      </Box>
      
      <Paper sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
        <List>
          {workoutDetails.map((workout, index) => (
            workout && (
              <React.Fragment key={profileData.favorited_workouts[index]}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={() => removeFavorite('workout', profileData.favorited_workouts[index])} edge="end" color="error">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography><strong>Total Minutes:</strong> {workout?.total_minutes || 'N/A'}</Typography>
                    <Typography><strong>Recurring:</strong> {workout?.is_recurring ? "Yes" : "No"}</Typography>
                    <Typography><strong>Exercises:</strong></Typography>
                    {workout?.exercises?.map((exercise, i) => (
                      exercise && (
                        <Box key={i} sx={{ pl: 2 }}>
                          <Typography>
                            - {exercise?.description || 'N/A'} ({exercise?.body_parts || 'N/A'}) - {exercise?.avg_calories_burned || 0} cal
                          </Typography>
                        </Box>
                      )
                    ))}
                  </Box>
                </ListItem>
                {index < workoutDetails.length - 1 && <Divider />}
              </React.Fragment>
            )
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default FavoriteWorkouts;
