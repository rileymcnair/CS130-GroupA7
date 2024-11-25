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
import EditIcon from "@mui/icons-material/Edit";
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
    <Paper
      sx={{
        marginTop: 4,
        padding: 3,
        borderRadius: 2,
        flexDirection: "column",
        display: "flex",
      }}
    >
      {/* Header Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {meal.name || "Meal Name"}
        </Typography>
        <IconButton
          onClick={handleFavoriteToggle}
          edge="end"
          color="primary"
          sx={{ mr: 1}}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        {/* <IconButton
          onClick={console.log("should open menu to edit the meal")}
          color="primary"
        >
          <EditIcon />
        </IconButton> */}
      </Box>

      {/* Calories */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          marginBlock: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <Typography variant="body1" sx={{}}>
            <strong>Calories</strong>
          </Typography>
          <Typography variant="body1" sx={{}}>
            {meal.calories}
          </Typography>
        </Box>
      </Box>
      {/* Macros Section */}
      <Box
        sx={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body1" sx={{}}>
            <strong>Macros</strong>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
            marginBottom: 3,
          }}
        >
          {/* Macronutrient Chart */}
          <Box
            sx={{
              flex: 0,
              width: "auto",
              height: "auto",
            }}
          >
            <MacronutrientChart
              proteins={meal.proteins}
              carbs={meal.carbs}
              fats={meal.fats}
              calories={meal.calories}
            />
          </Box>

          {/* Macro Details */}
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
              <strong>Protein</strong>
              <br />
              {meal.proteins}g
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Typography sx={{ flex: 1, textAlign: "center" }}>
              <strong>Fat</strong>
              <br />
              {meal.fats}g
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Typography sx={{ flex: 1, textAlign: "center" }}>
              <strong>Carbs</strong>
              <br />
              {meal.carbs}g
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Ingredients Section */}
      <Box sx={{ marginBottom: 2 ,flex: 1}}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", marginBottom: 1 }}
        >
          Ingredients
        </Typography>
        <Box sx={{paddingLeft: 2}}>
          {meal.ingredients.map((ingredient, index) => (
            <Typography key={index} variant="body2">
              {ingredient}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* See Details Section */}
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
          onClick={console.log(
            "See Details Not Implemented"
          )}
        >
          See Details
        </Typography>
      </Box>
    </Paper>
  );
};

export default MealCard;
