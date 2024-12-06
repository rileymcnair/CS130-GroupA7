import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Paper, Container } from "@mui/material";
import MealDialog from "../components/meal/MealDialog";
import MealCard from "../components/meal/MealCard";
import { useAuth } from "../context/AuthContext";

/**
 * Meal component where users can interact with meal generation, 
 * view their saved favorite meals, and explore meals from other users.
 * 
 * @component
 * @example
 * return (
 *   <Meal />
 * )
 */
function Meal() {
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [userMeals, setUserMeals] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [otherUserMeals, setOtherUserMeals] = useState([]);
  const { user } = useAuth();

  /**
   * Effect hook that fetches user's meals and favorite meals when the component is mounted.
   */
  useEffect(
    (email) => {
      if (user?.email) {
        fetchFavoriteMeals(user.email);
        fetchNMeals(user.email, 20);
      }
    },
    [user]
  );

  /**
   * Fetches the user's saved meals from the backend.
   * @param {string} email - The email of the logged-in user.
   */
  const fetchUserMeals = async (email) => {
    try {
      const response = await fetch(`/get_user_meals?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setUserMeals(data);
      } else {
        console.error("Failed to fetch user meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };

  /**
   * Fetches the user's favorite meals.
   * @param {string} email - The email of the logged-in user.
   */
  const fetchFavoriteMeals = async (email) => {
    try {
      const response = await fetch(`/get_favorite_meals?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setFavoriteMeals(data);
      } else {
        console.error("Failed to fetch user meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };

  /**
   * Fetches a set number of meals that the user has not favorited.
   * @param {string} email - The email of the logged-in user.
   * @param {number} numMeals - The number of meals to fetch.
   */
  const fetchNMeals = async (email, numMeals) => {
    try {
      const response = await fetch(
        `/get_n_not_favorited_meals?email=${user.email}&numMeals=${numMeals}`
      );
      if (response.ok) {
        const data = await response.json();
        setOtherUserMeals(data);
      } else {
        console.error("Failed to fetch n meals");
      }
    } catch (error) {
      console.error("Error fetching user meals:", error);
    }
  };

  /**
   * Opens the Meal Dialog for generating a new meal.
   */
  const handleMealDialogOpen = () => setMealDialogOpen(true);

  /**
   * Closes the Meal Dialog.
   */
  const handleMealDialogClose = () => setMealDialogOpen(false);

  /**
   * Deletes the generated meal by making a DELETE request to the backend.
   */
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

  /**
   * Handles generating a new meal by making a POST request with the provided meal data.
   * @param {Object} mealData - The data required for meal generation.
   */
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

  /**
   * Handles the deletion of a favorite meal.
   * @param {string} mealId - The ID of the meal to delete.
   */
  const handleDelete = async (mealId) => {
    try {
      const response = await fetch(`/remove_favorite_meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          id: mealId,
        }),
      });

      if (response.ok) {
        setFavoriteMeals((prevMeals) =>
          prevMeals.filter((meal) => meal.id !== mealId)
        );
      } else {
        console.error("Failed to delete the meal:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  return (
    <Box>
      {/* AI Generated Meals Section Header */}
      <Paper sx={{ padding: 2 }}>
        <Box justifyContent="space-between" alignItems="center" flexDirection="column" mb={1}>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            {/* Heading */}
            <Box>
              <Typography variant="h5">AI-Generated Meal Suggestions</Typography>
            </Box>
            <Box>
              <Button variant="contained" onClick={handleMealDialogOpen}>
                Generate Meal
              </Button>
            </Box>
          </Box>
          {/* Subtext */}
          <Box>
            <Typography variant="body1" sx={{ color: "text.secondary", fontStyle: "italic", marginBottom: 0 }}>
              Provide your dietary preferences, calorie goals, or ingredients, and let AI create personalized meal ideas just for you.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <MealDialog open={mealDialogOpen} handleClose={handleMealDialogClose} handleGenerateMeal={handleGenerateMeal} />
      
      <Container sx={{ width: "auto", maxWidth: "100%", overflow: "hidden", overflowX: "auto", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
        <Box sx={{ overflowX: "auto" }}>
          {generatedMeal && <MealCard meal={generatedMeal} handleDelete={handleDeleteGeneratedMeal} />}
        </Box>
      </Container>

      {/* Your Saved Meals Section Heading */}
      <Box mt={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h5" mb={1}>Your Favorited Meals</Typography>
          {favoriteMeals.length === 0 && (
            <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
              Your meal list is looking a bit empty
            </Typography>
          )}
          {favoriteMeals.length > 0 && (
            <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
              Here are your tracked meals
            </Typography>
          )}
        </Paper>

        <Container sx={{ width: "auto", maxWidth: "100%", overflow: "hidden", overflowX: "auto", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
          <Box sx={{ display: "flex", gap: 2, minWidth: "fit-content" }}>
            {favoriteMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                handleDelete={(mealId) => {
                  setFavoriteMeals((prevMeal) => prevMeal.filter((w) => w.id !== mealId));
                }}
                handleFavoriteToggleCallback={(meal, isFavorite) => {
                  if (!isFavorite) {
                    setFavoriteMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
                    setOtherUserMeals((prevMeals) => [...prevMeals, meal]);
                  }
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Meals From Others Section */}
      <Box mt={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h5" mb={1}>Meals From Other Users</Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}>
            Explore meals shared by others to discover new ideas and stay inspired.
          </Typography>
        </Paper>

        <Container sx={{ width: "auto", maxWidth: "100%", overflow: "hidden", overflowX: "auto", padding: 0, paddingTop: 1, paddingBottom: 1 }}>
          <Box display="flex" gap={2}>
            {otherUserMeals.length > 0 ? (
              otherUserMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  handleDelete={() => console.log("Delete function for individual meals, " + meal.id)}
                  handleFavoriteToggleCallback={(meal, isFavorite) => {
                    if (isFavorite) {
                      setOtherUserMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
                      setFavoriteMeals((prevMeals) => [...prevMeals, meal]);
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body1">No saved meals yet.</Typography>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Meal;
