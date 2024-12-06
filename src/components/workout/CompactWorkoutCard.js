import React, { useState } from "react";
import { Paper, Typography, Box, Dialog } from "@mui/material";
import WorkoutCard from "./WorkoutCard";

/**
 * CompactWorkoutCard component displays a brief overview of a workout, including its name
 * and a summary of exercises. It provides an option to view the full workout details in a dialog.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.workout - The workout object containing details such as name, exercises, and calories.
 */
const CompactWorkoutCard = ({ workout }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  /**
   * Opens the dialog displaying full workout details.
   */
  const handleDialogOpen = () => setDialogOpen(true);

  /**
   * Closes the dialog displaying full workout details.
   */
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <Paper
      sx={{
        padding: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        marginBottom: 2,
        maxHeight: 200,
        overflowY: "auto",
        width: "100%",
      }}
    >
      {/* Workout title */}
      <Typography variant="h6" gutterBottom>
        {workout.name}
      </Typography>

      {/* Displaying a summary of exercises */}
      <Box>
        {workout.exercises.map((exercise) => (
          <Typography
            key={exercise.id}
            variant="body2"
            sx={{ marginBottom: 1 }}
          >
            <strong>{exercise.name}</strong> Calories:{" "}
            {exercise.avg_calories_burned} | Reps: {exercise.reps} | Sets:{" "}
            {exercise.sets}
          </Typography>
        ))}
      </Box>

      {/* Link to open the full workout details */}
      <Box
        sx={{
          display: "flex",
          marginTop: "auto",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
          onClick={handleDialogOpen}
        >
          View
        </Typography>
      </Box>

      {/* Dialog for full workout details */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <WorkoutCard workout={workout} />
      </Dialog>
    </Paper>
  );
};

export default CompactWorkoutCard;
