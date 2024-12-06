import React from "react";
import { Box, Typography, Paper, Divider, IconButton } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CompactWorkoutCard from "./CompactWorkoutCard";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

/**
 * WorkoutListCard component displays a list of workouts with a heading and an "Add" button.
 * It shows workout details in compact cards and provides navigation to the full workouts list.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.workouts - List of workout objects to display.
 */
const WorkoutListCard = ({ workouts }) => {
  const navigate = useNavigate();

  /**
   * Navigates to the full list of workouts page.
   */
  const handleNavigate = () => {
    navigate("/workouts"); // Navigates to the workout list page
  };

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
        <Box
          sx={{
            marginLeft: "auto",
          }}
        >
          {/* "Add" button to navigate to the workouts page */}
          <IconButton
            onClick={handleNavigate}
            sx={{
              "&:hover": {
                backgroundColor: "#e0e0e0", // Hover effect styling
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ marginBottom: 1 }} />

      {/* Card Body */}
      <Box
        sx={{
          flex: 1, // Ensures the card body grows to fill available space
          padding: 1,
          maxHeight: 300,
          overflowY: "auto",
          display: "flex",
          justifyContent: workouts.length > 0 ? "flex-start" : "center",
          alignItems: workouts.length > 0 ? "flex-start" : "center",
          flexWrap: "wrap",
        }}
      >
        {workouts.length > 0 ? (
          // Display workouts in CompactWorkoutCard components
          workouts.map((workout) => (
            <CompactWorkoutCard key={workout.id} workout={workout} />
          ))
        ) : (
          // Message shown when no workouts are available
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
