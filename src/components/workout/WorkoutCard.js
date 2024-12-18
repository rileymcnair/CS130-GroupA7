import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, Divider, IconButton } from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkoutDetailsDialog from "./WorkoutDetailsDialog";
import { useAuth } from "../../context/AuthContext";

/**
 * WorkoutCard component displays details of a single workout. It includes options to toggle
 * the workout as a favorite, edit workout details, and delete the workout if it is a favorite.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.workout - The workout object containing details such as name, exercises, and focus.
 * @param {function} props.handleUpdate - Function to handle the update of the workout after editing.
 * @param {function} props.handleDelete - Function to handle the removal of the workout.
 * @param {function} props.onFavoriteToggle - Function to handle toggling the favorite status of the workout.
 */
const WorkoutCard = ({
  workout,
  handleUpdate,
  handleDelete,
  onFavoriteToggle,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState(workout);

  /**
   * Opens the workout edit dialog with the current workout data.
   */
  const handleDialogOpen = () => {
    setEditedWorkout(workout);
    setDialogOpen(true);
  };

  /**
   * Closes the workout edit dialog.
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  /**
   * Handles changes to workout fields.
   * 
   * @param {string} field - The field that was changed.
   * @param {any} value - The new value for the field.
   */
  const handleWorkoutChange = (field, value) => {
    setEditedWorkout((prev) => ({
      ...prev,
      [field]: value,
      exercises: prev.exercises || [],
    }));
  };

  /**
   * Handles changes to exercise fields within the workout.
   * 
   * @param {number} index - The index of the exercise being updated.
   * @param {string} field - The field that was changed.
   * @param {any} value - The new value for the field.
   */
  const handleExerciseChange = (index, field, value) => {
    setEditedWorkout((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };
      return { ...prev, exercises: updatedExercises };
    });
  };

  /**
   * Saves the edited workout by sending the updated data to the server.
   */
  const handleSave = async () => {
    try {
      const response = await fetch(`/edit_user_workout/${workout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedWorkout,
          exercises: editedWorkout.exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            reps: exercise.reps,
            sets: exercise.sets,
            weight: exercise.weight,
            avg_calories_burned: exercise.avg_calories_burned,
            body_parts: exercise.body_parts,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workout");
      }

      const updatedWorkout = await response.json();
      handleUpdate(updatedWorkout);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  /**
   * Checks if the workout is marked as a favorite by the current user.
   */
  useEffect(() => {
    checkIfFavorite();
  }, [workout.id]);

  /**
   * Fetches the favorite status of the workout for the current user.
   */
  const checkIfFavorite = async () => {
    if (!user?.email || !workout.id) return;

    try {
      const response = await fetch("/check_is_favorite_workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_id: workout.id,
          email: user.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.is_favorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  /**
   * Toggles the favorite status of the workout and updates the backend accordingly.
   */
  const handleFavoriteToggle = async () => {
    if (!user?.email || !workout.id) {
      console.error("Invalid email or workout ID:", user?.email, workout.id);
      return;
    }
    try {
      const endpoint = isFavorite
        ? "/unfavorite_workout"
        : "/add_workout_to_favorites";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_id: workout.id,
          email: user.email,
        }),
      });
      if (response.ok) {
        const updatedFavoriteStatus = !isFavorite;
        setIsFavorite(updatedFavoriteStatus);

        if (onFavoriteToggle) {
          onFavoriteToggle(workout, updatedFavoriteStatus);
        }
      } else {
        console.error(
          `Failed to ${isFavorite ? "remove" : "add"} workout from favorites`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isFavorite ? "removing" : "adding"} workout from favorites:`,
        error
      );
    }
  };

  /**
   * Removes the workout from the favorites list for the current user.
   */
  const handleRemoveWorkout = async () => {
    try {
      const response = await fetch("/remove_favorite_workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          id: workout.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing workout:", errorData.error);
        return;
      }

      const data = await response.json();
      console.log(data.message);
      handleDelete(workout.id);
    } catch (error) {
      console.error("Failed to remove the workout:", error);
    }
  };

  return (
    <Paper
      sx={{
        marginTop: 4,
        padding: 3,
        borderRadius: 2,
        flexDirection: "column",
        display: "flex",
        maxWidth: 600,
        width: 500,
        minWidth: 500,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 1,
        }}
      >
        <Typography variant="h6">{workout.name || "Workout Name"}</Typography>
        <IconButton
          onClick={handleFavoriteToggle}
          edge="end"
          color="primary"
          sx={{ mr: 1 }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          marginLeft: 3,
        }}
      >
        <Typography sx={{ flex: 1, textAlign: "center" }}>
          <strong>Calories:</strong>
          <br />
          {(workout.exercises || []).reduce(
            (total, exercise) =>
              total + parseInt(exercise.avg_calories_burned || 0),
            0
          )}{" "}
          cal
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Typography sx={{ flex: 1, textAlign: "center" }}>
          <strong>Time:</strong>
          <br />
          {workout.total_minutes} min
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Typography sx={{ flex: 1, textAlign: "center" }}>
          <strong>Target:</strong>
          <br />
          {workout.body_part_focus}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: "auto",
        }}
      >
        <Typography variant="h6" sx={{ marginTop: 1 }}>
          Exercises
        </Typography>
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            padding: 1,
          }}
        >
          {workout.exercises.map((exercise, index) => (
            <Box key={exercise.id} sx={{ padding: 1, marginBottom: 1 }}>
              <Typography>
                <b>{exercise.name}</b>
              </Typography>
              <strong>Reps:</strong> {exercise.reps}
              <br />
              <strong>Sets:</strong> {exercise.sets}
              <br />
              <strong>Weight:</strong> {exercise.weight}
              <br />
              <strong>Focus:</strong> {exercise.body_parts}
              <br />
              <strong>Description:</strong> {exercise.description}
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          marginTop: "auto",
        }}
      >
        {isFavorite && (
          <IconButton
            onClick={handleRemoveWorkout}
            color="error"
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <Typography
          variant="body2"
          sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
          onClick={handleDialogOpen}
        >
          Edit
        </Typography>
      </Box>
      <WorkoutDetailsDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        workout={editedWorkout}
        onSave={handleSave}
        onWorkoutChange={handleWorkoutChange}
        onExerciseChange={handleExerciseChange}
      />
    </Paper>
  );
};

export default WorkoutCard;
