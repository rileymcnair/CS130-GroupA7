import React, { useState, useEffect } from "react";
import { Typography, Button, Box } from "@mui/material";
import MealDialog from "../components/meal/MealDialog";
import MealCard from "../components/meal/MealCard";
import { useAuth } from "../context/AuthContext";

function Meal() {
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [userMeals, setUserMeals] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [otherUserMeals, setOtherUserMeals] = useState([]);
  const { user } = useAuth();

  useEffect((email) => {
    if (user?.email) {
    //   fetchUserMeals(user.email)
      fetchFavoriteMeals(user.email)
      fetchNMeals()
    }
  }, [user]);

  const fetchUserMeals = async (email) => {
    try {
      const response = await fetch(`/get_user_meals?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        console.log("User meals", data);
        setUserMeals(data);
      } else {
        console.error("Failed to fetch user meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };
  const fetchFavoriteMeals = async (email) => {
    try {
      const response = await fetch(`/get_favorite_meals?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        console.log("User meals", data);
        setFavoriteMeals(data);
      } else {
        console.error("Failed to fetch user meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };

  const fetchNMeals = async () => {
    try {
      const response = await fetch(`/get_n_meals`);
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        console.log("Other User meals", data);
        setOtherUserMeals(data);
        console.log(otherUserMeals)
      } else {
        console.error("Failed to fetch n meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };

  const handleMealDialogOpen = () => setMealDialogOpen(true);
  const handleMealDialogClose = () => setMealDialogOpen(false);

  const handleDeleteGeneratedMeal = async () => {
    if (!generatedMeal || !generatedMeal.id) {
      console.error("Generated meal ID not found.");
      return;
    }

    try {
      const response = await fetch("/remove_meal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_id: generatedMeal.id }),
      });

      if (response.ok) {
        setGeneratedMeal(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to delete meal:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const handleGenerateMeal = async (mealData) => {
    try {
      const response = await fetch("/generate_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...mealData,
          email: user?.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedMeal({
          ...data.meal_data,
          id: data.meal_id,
          email: user?.email,
        });
        handleMealDialogClose();
      }
    } catch (error) {
      console.error("Error generating meal:", error);
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">AI-Generated Meal Suggestions</Typography>
        <Button variant="contained" onClick={handleMealDialogOpen}>
          Generate Meal
        </Button>
      </Box>

      <MealDialog
        open={mealDialogOpen}
        handleClose={handleMealDialogClose}
        handleGenerateMeal={handleGenerateMeal}
      />

      {generatedMeal && (
        <MealCard
          meal={generatedMeal}
          handleDelete={handleDeleteGeneratedMeal}
        />
      )}

      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          Your Saved Meals
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {favoriteMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              handleDelete={() =>
                console.log("Delete function for individual meals")
              }
            />
          ))}
        </Box>
      </Box>
      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          Meals From Other Users
        </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
          {otherUserMeals.length > 0 ? (
            otherUserMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                handleDelete={() =>
                  console.log("Delete function for individual meals, "+meal.id)
                }
              />
            ))
          ) : (
            <Typography variant="body1">No saved meals yet.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Meal;
