import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Paper, Container } from "@mui/material";
import WorkoutDialog from "../components/workout/WorkoutDialog";
import WorkoutCard from "../components/workout/WorkoutCard";
import { useAuth } from "../context/AuthContext";

function Workout() {
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState([]);
  const [otherUserWorkouts, setOtherUserWorkouts] = useState([]);
  const { user } = useAuth();

  const handleWorkoutDialogOpen = () => setWorkoutDialogOpen(true);
  const handleWorkoutDialogClose = () => setWorkoutDialogOpen(false);

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

        const exercises = await Promise.all(
          data.workout_data.exercises.map(async (exerciseId) => {
            const exerciseResponse = await fetch(`/get_exercise/${exerciseId}`);
            if (exerciseResponse.ok) {
              return await exerciseResponse.json();
            } else {
              console.error(`Failed to fetch exercise with ID: ${exerciseId}`);
              return {
                id: exerciseId,
                name: "",
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
      }
    } catch (error) {
      console.error("Error generating workout:", error);
    }
  };

  const handleUpdateGeneratedWorkout = (updatedWorkout) => {
    setGeneratedWorkout(updatedWorkout);
  };

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
        console.log(`Workout ${workoutId} deleted successfully.`);
      } else {
        console.error("Failed to delete the workout:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  useEffect(
    (email) => {
      if (user?.email) {
        fetchFavoriteWorkouts(user.email);
        fetchNWorkouts(user.email, 20);
      }
    },
    [user]
  );

  const fetchFavoriteWorkouts = async (email) => {
    try {
      const response = await fetch(`/get_favorite_workouts?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        console.log("User workouts", data);
        setFavoriteWorkouts(data);
      } else {
        console.error("Failed to fetch user workouts");
      }
    } catch (error) {
      console.error("Error fetching user workouts:", error);
    }
  };

  const fetchNWorkouts = async (email, numWorkouts) => {
    try {
      const response = await fetch(
        `/get_n_not_favorited_workouts?email=${user.email}&numWorkouts=${numWorkouts}`
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log("Other User workouts", data);
        setOtherUserWorkouts(data);
        console.log(otherUserWorkouts);
      } else {
        console.error("Failed to fetch n workouts");
      }
    } catch (error) {
      console.error("Error fetching user workouts:", error);
    }
  };

  const handleFavoriteToggle = (workout, isNowFavorite) => {
    if (isNowFavorite) {
      setFavoriteWorkouts((prevFavorites) => [...prevFavorites, workout]);
      setOtherUserWorkouts((prevOthers) =>
        prevOthers.filter((w) => w.id !== workout.id)
      );
    } else {
      setOtherUserWorkouts((prevOthers) => [...prevOthers, workout]);
      setFavoriteWorkouts((prevFavorites) =>
        prevFavorites.filter((w) => w.id !== workout.id)
      );
    }
  };

  return (
    <Box>
      {/* AI-Generated Workouts Section Header */}
      <Paper sx={{ padding: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="h5">AI-Generated Workouts</Typography>
          <Button
            variant="contained"
            onClick={() => setWorkoutDialogOpen(true)}
          >
            Generate Workout
          </Button>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontStyle: "italic" }}
        >
          Provide your workout goals, time availability, or focus areas, and let
          AI create personalized workout plans for you.
        </Typography>
      </Paper>

      {workoutDialogOpen && (
        <WorkoutDialog
          open={workoutDialogOpen}
          handleClose={() => setWorkoutDialogOpen(false)}
          handleGenerateWorkout={handleGenerateWorkout}
        />
      )}
      <Container
        sx={{
          width: "auto",
          maxWidth: "100%",
          overflow: "hidden",
          overflowX: "auto",
          padding: 0,
          paddingTop: 1,
          paddingBottom: 1,
        }}
      >
        <Box
          sx={{
            display: "flex", // Flexbox for horizontal alignment of children
            gap: 2, // Spacing between MealCard components
            minWidth: "fit-content", // Prevent shrinking when there are fewer items
          }}
        >
          {generatedWorkout && (
            <WorkoutCard
              workout={generatedWorkout}
              handleUpdate={handleUpdateGeneratedWorkout}
            />
          )}
        </Box>
      </Container>

      {/* Your Saved Workouts Section Heading*/}
      <Box mt={4}>
        <Paper
          sx={{
            padding: 2,
          }}
        >
          <Typography variant="h5" mb={1}>
            Your Favorited Workouts
          </Typography>
          {favoriteWorkouts.length === 0 && (
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
            >
              Your workout list is looking a bit empty
            </Typography>
          )}
          {favoriteWorkouts.length > 0 && (
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
            >
              Here are your tracked workouts
            </Typography>
          )}
        </Paper>

        {/* Workouts Grid */}
        <Container
          sx={{
            width: "auto",
            maxWidth: "100%",
            overflow: "hidden",
            overflowX: "auto",
            padding: 0,
            paddingTop: 1,
            paddingBottom: 1,
          }}
        >
          <Box
            sx={{
              display: "flex", // Flexbox for horizontal alignment of children
              gap: 2, // Spacing between MealCard components
              minWidth: "fit-content", // Prevent shrinking when there are fewer items
            }}
          >
            {favoriteWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                handleUpdate={(updatedWorkout) => {
                  setFavoriteWorkouts((prevWorkouts) =>
                    prevWorkouts.map((w) =>
                      w.id === updatedWorkout.id ? updatedWorkout : w
                    )
                  );
                }}
                handleDelete={(workoutId) => {
                  setFavoriteWorkouts((prevWorkouts) =>
                    prevWorkouts.filter((w) => w.id !== workoutId)
                  );
                }}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Workouts From Others Section */}

      <Box mt={4}>
        <Paper
          sx={{
            padding: 2,
          }}
        >
          <Typography variant="h5" mb={1}>
            Workouts From Other Users
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
          >
            Explore workouts shared by others to discover new ideas and stay
            inspired.
          </Typography>
        </Paper>
        <Container
          sx={{
            width: "auto",
            maxWidth: "100%",
            overflow: "hidden",
            overflowX: "auto",
            padding: 0,
            paddingTop: 1,
            paddingBottom: 1,
          }}
        >
          <Box display="flex" gap={2}>
            {otherUserWorkouts.length > 0 ? (
              otherUserWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  handleDelete={() =>
                    console.log(
                      "No delete function for individual workouts, " +
                        workout.id
                    )
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
