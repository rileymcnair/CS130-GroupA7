import React from "react";
import { Box, Typography, Paper, Divider, IconButton } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CompactMealCard from "./CompactMealCard"; // Make sure this is correctly imported
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const MealListCard = ({ meals }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/meals"); // Replace with your target route
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
        <RestaurantIcon />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Meals
        </Typography>
        <Box
          sx={{
            marginLeft: "auto",
          }}
        >
          <IconButton
            onClick={handleNavigate}
            sx={{
              //   backgroundColor: "#f0f0f0", // Optional: Add background styling
              "&:hover": {
                backgroundColor: "#e0e0e0", // Hover effect
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
          justifyContent: meals.length > 0 ? "flex-start" : "center",
          alignItems: meals.length > 0 ? "flex-start" : "center",
          flexWrap: "wrap",
        }}
      >
        {meals.length > 0 ? (
          meals.map((meal) => <CompactMealCard key={meal.id} meal={meal} />)
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            No meals added for today
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MealListCard;
