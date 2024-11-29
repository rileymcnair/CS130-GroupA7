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
  // See Details Dialog Details
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [userMeals, setUserMeals] = useState([]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  const handleUpdateCardDetails = (updatedMeal) => {
    setUserMeals((prevMeals) =>
      // prevMeals.map((meal) =>
      //   meal.id === updatedMeal.id ? updatedMeal : meal // Replace the updated meal
      // )
      {
        meal.name = updatedMeal.name;
        meal.calories = updatedMeal.calories;
        meal.proteins = updatedMeal.proteins;
      },
    );
    console.log("Updated meal saved to state:", updatedMeal);
  };
  const handleSaveMealToServer = async (updatedMeal) => {
    try {
      const response = await fetch("/edit_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    try {
      const endpoint = isFavorite
        ? "/unfavorite_meal"
        : "/add_meal_to_favorites";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: meal.id,
          email: user.email,
        }),
      });

      if (response.ok) {
        const updatedFavoriteStatus = !isFavorite;
        setIsFavorite(updatedFavoriteStatus);

        // Notify the parent component
        if (handleFavoriteToggleCallback) {
          handleFavoriteToggleCallback(meal, updatedFavoriteStatus);
        }
      } else {
        console.error(
          `Failed to ${isFavorite ? "remove" : "add"} meal from favorites`,
        );
      }
    } catch (error) {
      console.error(
        `Error ${isFavorite ? "removing" : "adding"} meal from favorites:`,
        error,
      );
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
        flexDirection: "column",
        display: "flex",
        maxWidth: 330,
        height: 450,
        maxHeight: 500,
        // overflow: "hidden",
        // overflowY: "auto",
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
          sx={{ mr: 1 }}
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
<Box
  sx={{
    marginBottom: 2,
    flex: 1,
    overflowY: "auto", // Enable vertical scrolling
    maxHeight: 200, // Set a fixed height to constrain the content
  }}
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

      {/* See Details Section */}
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
          handleUpdateCardDetails(updatedMeal); // Call parent's update function
          handleSaveMealToServer(updatedMeal);
          handleDialogClose(); // Close dialog after saving
        }}
      />
      </Box>

    </Paper>
    </Box>
  );
};

export default MealCard;
