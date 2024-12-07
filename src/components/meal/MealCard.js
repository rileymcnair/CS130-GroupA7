import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import MealDetailsDialog from "./MealDetailsDialog";
import MacronutrientChart from "./MacronutrientChart";

const MealCard = ({ meal, handleDelete, handleFavoriteToggleCallback }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const handleUpdateCardDetails = (updatedMeal) => {
    // Instead of mutating meal, create a new object to avoid side effects
    // Directly modify local state (not the prop)
    Object.assign(meal, updatedMeal); // Avoid doing this; it's better to use setState
  };

  const handleSaveMealToServer = async (updatedMeal) => {
    try {
      const response = await fetch("/edit_meal", {
        method: "POST",
        hexfaders: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          meal_id: updatedMeal.id,
          meal_data: {
            name: updatedMeal.name,
            calories: updatedMeal.calories,
            proteins: updatedMeal.proteins,
            fats: updatedMeal.fats,
            carbs: updatedMeal.carbs,
            ingredients: updatedMeal.ingredients,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Meal updated successfully:", data);
      } else {
        console.error("Failed to update meal:", await response.json());
      }
    } catch (error) {
      console.error("Error updating meal:", error);
    }
    handleDialogClose();
  };

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

    const endpoint = isFavorite ? "/unfavorite_meal" : "/add_meal_to_favorites";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: meal.id,
          email: user.email,
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        if (handleFavoriteToggleCallback) {
          handleFavoriteToggleCallback(meal, !isFavorite);
        }
      } else {
        console.error(
          `Failed to ${isFavorite ? "remove" : "add"} meal from favorites`
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleRemoveMeal = async () => {
    try {
      const response = await fetch("/remove_favorite_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          id: meal.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing meal:", errorData.error);
        return;
      }

      const data = await response.json();
      console.log(data.message);
      handleDelete(meal.id);
    } catch (error) {
      console.error("Failed to remove the meal:", error);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          marginTop: 4,
          padding: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          maxWidth: 330,
          height: 450,
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
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {meal.name || "Meal Name"}
          </Typography>
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
            <Typography variant="body1">
              <strong>Calories</strong>
            </Typography>
            <Typography variant="body1">{meal.calories}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body1">
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
            <MacronutrientChart
              proteins={meal.proteins}
              carbs={meal.carbs}
              fats={meal.fats}
              calories={meal.calories}
            />
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

        <Box
          sx={{ marginBottom: 2, flex: 1, overflowY: "auto", maxHeight: 200 }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", marginBottom: 1 }}
          >
            Ingredients
          </Typography>
          <Box sx={{ paddingLeft: 2 }}>
            {meal.ingredients.map((ingredient, index) => (
              <Typography key={index} variant="body2">
                {ingredient}
              </Typography>
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
              onClick={handleRemoveMeal}
              color="error"
              sx={{ cursor: "pointer", fontWeight: "bold" }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              cursor: "pointer",
              fontWeight: "bold",
              position: "absolute",
              bottom: 5,
              right: 16,
            }}
            onClick={handleDialogOpen}
          >
            Edit
          </Typography>
          <MealDetailsDialog
            open={isDialogOpen}
            onClose={handleDialogClose}
            meal={meal}
            onSave={(updatedMeal) => {
              handleUpdateCardDetails(updatedMeal);
              handleSaveMealToServer(updatedMeal);
              handleDialogClose();
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default MealCard;
