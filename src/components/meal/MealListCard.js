import React from "react";
import { Box, Typography, Paper, Divider, IconButton } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CompactMealCard from "./CompactMealCard"; // Make sure this is correctly imported
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

/**
 * MealListCard is a card component that displays a list of meals. It includes a header with an icon and
 * a button to navigate to the meals page. If meals are provided, they are displayed as CompactMealCard components.
 * If no meals are available, a message is displayed indicating that no meals have been added for the day.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.meals - An array of meal objects to display in the card.
 */
const MealListCard = ({ meals }) => {
  const navigate = useNavigate();

  /**
   * Handles navigation to the meals page.
   */
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
