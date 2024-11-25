import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

import MacronutrientChart from "./MacronutrientChart";

const MealCard = ({ meal, handleDelete }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkIfFavorite();
  }, [meal.id]);

  const checkIfFavorite = async () => {
    if (!user?.email || !meal.id) return;

    try {
      const response = await fetch("/check_is_favorite_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: meal.id,
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

  const handleFavoriteToggle = async () => {
    if (!user?.email || !meal.id) {
      console.error("Invalid email or meal ID:", user?.email, meal.id);
      return;
    }
      if (!meal?.id) {
        console.error("Missing meal ID");
        return;
      }
      console.log("Meal ID:", meal.id);
    try {
      const endpoint = isFavorite
        ? "/unfavorite_meal" // Use the remove endpoint if it's already a favorite
        : "/add_meal_to_favorites"; // Use the add endpoint otherwise
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: meal.id,
          email: user.email,
        }),
      });
      console.log(response)
      if (response.ok) {
        setIsFavorite(!isFavorite); // Toggle the state based on success
      } else {
        console.error(
          `Failed to ${isFavorite ? "remove" : "add"} meal from favorites`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isFavorite ? "removing" : "adding"} meal from favorites:`,
        error
      );
    }
  };

  return (
    <Paper sx={{ marginTop: 4, padding: 2 }}>
      <Typography variant="h6">Meal Name</Typography>
      <List>
        <ListItem
          secondaryAction={
            <Box>
              <IconButton
                onClick={handleFavoriteToggle}
                edge="end"
                color="primary"
                sx={{ mr: 1 }}
                // disabled={isFavorite}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleDelete} edge="end" color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          }
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              marginBottom: 2,
              flexDirection: "row"
            }}
          >
            {/* Use MacronutrientChart component */}
            <Box sx={{ flex: 0, marginLeft: 2 }}>

            <MacronutrientChart
              proteins={meal.proteins}
              carbs={meal.carbs}
              fats={meal.fats}
              calories={meal.calories}
              />
            </Box>

            <Box sx={{ flex: 1, marginLeft: 2 }}>
              <Typography>
                <strong>Calories:</strong> {meal.calories}
              </Typography>
              <Typography>
                <strong>Carbs:</strong> {meal.carbs}g
              </Typography>
              <Typography>
                <strong>Fats:</strong> {meal.fats}g
              </Typography>
              <Typography>
                <strong>Proteins:</strong> {meal.proteins}g
              </Typography>
              <Typography>
                <strong>Ingredients:</strong> {meal.ingredients.join(", ")}
              </Typography>
            </Box>
          </Box>
        </ListItem>
        <Divider />
      </List>
    </Paper>
  );
};

export default MealCard;
