import React from "react";
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

/**
 * FavoriteWorkouts component displays a list of the user's favorite workouts.
 * Each workout in the list shows its details such as name, focus area, total minutes,
 * and a list of exercises with calories burned. Users can also remove workouts from
 * their favorites using the delete button.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.workoutDetails - An array of workout objects, each containing details like name, focus area, total minutes, and exercises.
 * @param {Object} props.profileData - The user's profile data, which includes a list of favorited workouts.
 * @param {Function} props.handleWorkoutDialogOpen - Function to open the dialog to add a new workout.
 * @param {Function} props.removeFavorite - Function to remove a workout from the user's favorites.
 */
const FavoriteWorkouts = ({
  workoutDetails,
  profileData,
  handleWorkoutDialogOpen,
  removeFavorite,
}) => {
  return (
    <Box>
      {/* Header with title and button to add workout */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Favorite Workouts</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleWorkoutDialogOpen}
        >
          Add Workout
        </Button>
      </Box>

      {/* Paper container for the list of workouts */}
      <Paper
        sx={{ maxHeight: 900, overflow: "auto", bgcolor: "background.paper" }}
      >
        <List>
          {/* Map over workoutDetails to render each workout */}
          {workoutDetails.map(
            (workout, index) =>
              workout && (
                <React.Fragment key={profileData.favorited_workouts[index]}>
                  <ListItem
                    secondaryAction={
                      // Delete button to remove the workout from favorites
                      <IconButton
                        onClick={() =>
                          removeFavorite(
                            "workout",
                            profileData.favorited_workouts[index],
                          )
                        }
                        edge="end"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ width: "100%" }}>
                      {/* Workout details */}
                      <Typography>
                        <strong>Name:</strong> {workout?.name || ""}
                      </Typography>
                      <Typography>
                        <strong>Focus:</strong>{" "}
                        {workout?.body_part_focus || "N/A"}
                      </Typography>
                      <Typography>
                        <strong>Total Minutes:</strong>{" "}
                        {workout?.total_minutes || "N/A"}
                      </Typography>
                      <Typography>
                        <strong>Exercises:</strong>
                      </Typography>
                      {/* Map over exercises to display each one */}
                      {workout?.exercises?.map(
                        (exercise, i) =>
                          exercise && (
                            <Box key={i} sx={{ pl: 2 }}>
                              <Typography>
                                - {exercise?.description || "N/A"} (
                                {exercise?.body_parts || "N/A"}) -{" "}
                                {exercise?.avg_calories_burned || 0} cal
                              </Typography>
                            </Box>
                          ),
                      )}
                    </Box>
                  </ListItem>
                  {/* Divider between workouts */}
                  {index < workoutDetails.length - 1 && <Divider />}
                </React.Fragment>
              ),
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default FavoriteWorkouts;
