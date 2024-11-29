import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CompactWorkoutCard from "./CompactWorkoutCard";

const WorkoutListCard = ({ workouts }) => {
  return (
    <Paper
      sx={{
        flex: 1,
        padding: 2,
        borderRadius: 2,
        minHeight: 150, // Minimum height for the card
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card Heading */}
      <Box
        sx={{
          display: "flex",
          height: "auto",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FitnessCenterIcon />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Workouts
        </Typography>
      </Box>
      <Divider sx={{ marginBottom: 1 }} />

      {/* Card Body */}
      <Box
        sx={{
          flex: 1, // Ensures the card body grows to fill available space
          maxHeight: 300,
          overflowY: "auto",
          display: "flex",
          justifyContent: workouts.length > 0 ? "flex-start" : "center",
          alignItems: workouts.length > 0 ? "flex-start" : "center",
          flexWrap: "wrap",
        }}
      >
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <CompactWorkoutCard key={workout.id} workout={workout} />
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            No workouts added for today
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default WorkoutListCard;
