import React, { useState } from "react";
import { Paper, Typography, Box, Dialog } from "@mui/material";
import WorkoutCard from "./WorkoutCard";

const CompactWorkoutCard = ({ workout }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => setDialogOpen(true);
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
      }}
    >
      <Typography variant="h6" gutterBottom>
        {workout.name}
      </Typography>
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
