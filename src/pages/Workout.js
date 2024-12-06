import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Paper, Container } from "@mui/material";
import WorkoutDialog from "../components/workout/WorkoutDialog";
import WorkoutCard from "../components/workout/WorkoutCard";
import { useAuth } from "../context/AuthContext";

/**
 * Workout component that handles the display and management of user workouts,
 * including generating AI-based workouts, managing favorited workouts, and displaying shared workouts from other users.
 */
function Workout() {
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState([]);
  const [otherUserWorkouts, setOtherUserWorkouts] = useState([]);
  const { user } = useAuth();

  /**
   * Opens the workout dialog to generate a new workout.
   */
  const handleWorkoutDialogOpen = () => setWorkoutDialogOpen(true);

  /**
   * Closes the workout dialog.
   */
  const handleWorkoutDialogClose = () => setWorkoutDialogOpen(false);

  /**
   * Handles the generation of a workout, calling the backend API to fetch workout data,
   * and fetching exercises in parallel for the generated workout.
   * @param {Object} workoutData - The data containing user's input for generating workout.
   */
  const handleGenerateWorkout = async (workoutData) => {
    try {
      const response = await fetch("/generate_workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...workoutData,
          email: user?.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Refactor: Fetch exercises in parallel with workout data
        const exercises = await Promise.all(
          data.workout_data.exercises.map(async (exerciseId) => {
            const exerciseResponse = await fetch(`/get_exercise/${exerciseId}`);
            if (exerciseResponse.ok) {
              return await exerciseResponse.json();
            } else {
              return {
                id: exerciseId,
                name: "Unknown Exercise",
                reps: 0,
                sets: 0,
                weight: "",
                avg_calories_burned: 0,
                body_parts: "",
              };
            }
          })
        );

        setGeneratedWorkout({
          ...data.workout_data,
          id: data.workout_id,
          email: user?.email,
          exercises: exercises || [],
        });

        handleWorkoutDialogClose();
      } else {
        console.error("Failed to generate workout");
      }
    } catch (error) {
      console.error("Error generating workout:", error);
    }
  };

  /**
   * Updates the generated workout with the updated workout data.
   * @param {Object} updatedWorkout - The updated workout object.
   */
  const handleUpdateGeneratedWorkout = (updatedWorkout) => {
    setGeneratedWorkout(updatedWorkout);
  };

  /**
   * Deletes a workout from the list of favorite workouts.
   * @param {string} workoutId - The ID of the workout to delete.
   */
  const handleDelete = async (workoutId) => {
    try {
      const response = await fetch(`/remove_favorite_workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          id: workoutId,
        }),
      });

      if (response.ok) {
        setFavoriteWorkouts((prevWorkouts) =>
          prevWorkouts.filter((workout) => workout.id !== workoutId)
        );
      } else {
        console.error("Failed to delete workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  /**
   * Fetches the list of favorite workouts for the current user.
   * @param {string} email - The user's email to fetch their favorite workouts.
   */
  const fetchFavoriteWorkouts = async (email) => {
    try {
      const response = await fetch(`/get_favorite_workouts?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setFavoriteWorkouts(data);
      } else {
        console.error("Failed to fetch user workouts");
      }
    } catch (error) {
      console.error("Error fetching user workouts:", error);
    }
  };

  /**
   * Fetches a specified number of non-favorited workouts from other users.
   * @param {string} email - The user's email to ensure non-favorited workouts are fetched.
   * @param {number} numWorkouts - The number of workouts to fetch.
   */
  const fetchNWorkouts = async (email, numWorkouts) => {
    try {
      const response = await fetch(
        `/get_n_not_favorited_workouts?email=${user.email}&numWorkouts=${numWorkouts}`
      );
      if (response.ok) {
        const data = await response.json();
        setOtherUserWorkouts(data);
      } else {
        console.error("Failed to fetch workouts");
      }
    } catch (error) {
      console.error("Error fetching user workouts:", error);
    }
  };

  /**
   * Toggles the favorite status of a workout and updates the lists accordingly.
   * @param {Object} workout - The workout object to toggle as favorite.
   * @param {boolean} isNowFavorite - Boolean value indicating whether the workout is now a favorite.
   */
  const handleFavoriteToggle = (workout, isNowFavorite) => {
    setFavoriteWorkouts((prevFavorites) =>
      isNowFavorite
        ? [...prevFavorites, workout]
        : prevFavorites.filter((w) => w.id !== workout.id)
    );
    setOtherUserWorkouts((prevOthers) =>
      isNowFavorite
        ? prevOthers.filter((w) => w.id !== workout.id)
        : [...prevOthers, workout]
    );
  };

  // Fetch user-specific data on component mount or user change
  useEffect(() => {
    if (user?.email) {
      fetchFavoriteWorkouts(user.email);
      fetchNWorkouts(user.email, 20);
    }
  }, [user]); // Only depend on user here

  return (
    <Box>
      {/* AI-Generated Workouts Section Header */}
      <Paper sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography variant="h5">AI-Generated Workouts</Typography>
          <Button variant="contained" onClick={handleWorkoutDialogOpen}>
            Generate Workout
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
          Provide your workout goals, time availability, or focus areas, and let AI create personalized workout plans for you.
        </Typography>
      </Paper>

      {workoutDialogOpen && (
        <WorkoutDialog
          open={workoutDialogOpen}
          handleClose={handleWorkoutDialogClose}
          handleGenerateWorkout={handleGenerateWorkout}
        />
      )}

      <Container sx={{ width: "auto", maxWidth: "100%", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
        <Box sx={{ display: "flex", gap: 2, minWidth: "fit-content" }}>
          {generatedWorkout && (
            <WorkoutCard workout={generatedWorkout} handleUpdate={handleUpdateGeneratedWorkout} />
          )}
        </Box>
      </Container>

      {/* Your Saved Workouts Section Heading*/}
      <Box mt={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h5" mb={1}>
            Your Favorited Workouts
          </Typography>
          {favoriteWorkouts.length === 0 && (
            <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
              Your workout list is looking a bit empty
            </Typography>
          )}
          {favoriteWorkouts.length > 0 && (
            <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
              Here are your tracked workouts
            </Typography>
          )}
        </Paper>

        <Container sx={{ width: "auto", maxWidth: "100%", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
          <Box sx={{ display: "flex", gap: 2, minWidth: "fit-content" }}>
            {favoriteWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                handleUpdate={(updatedWorkout) => {
                  setFavoriteWorkouts((prevWorkouts) =>
                    prevWorkouts.map((w) => (w.id === updatedWorkout.id ? updatedWorkout : w))
                  );
                }}
                handleDelete={handleDelete}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Workouts From Others Section */}
      <Box mt={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h5" mb={1}>
            Workouts From Other Users
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
            Explore workouts shared by others to discover new ideas and stay inspired.
          </Typography>
        </Paper>

        <Container sx={{ width: "auto", maxWidth: "100%", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
          <Box display="flex" gap={2}>
            {otherUserWorkouts.length > 0 ? (
              otherUserWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  handleDelete={() =>
                    console.log("No delete function for individual workouts, " + workout.id)
                  }
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))
            ) : (
              <Typography variant="body1">No saved workouts yet.</Typography>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Workout;
