import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Paper } from "@mui/material";
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

  useEffect(
    (email) => {
      if (user?.email) {
        //   fetchUserMeals(user.email)
        fetchFavoriteMeals(user.email);
        fetchNMeals(user.email, 20);
      } 
    },
    [user]
  );

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

  const fetchNMeals = async (email, numMeals) => {
    try {
        // Include the numMeals parameter in the request URL
        const response = await fetch(`/get_n_not_favorited_meals?email=${user.email}&numMeals=${numMeals}`);
        console.log(response);
        if (response.ok) {
            const data = await response.json();
            console.log("Other User meals", data);
            setOtherUserMeals(data);
            console.log(otherUserMeals);
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
      {/* AI Generated Meals Section Header */}
      <Paper
        sx={{
          padding: 2,
        }}
      >
        <Box
          justifyContent="space-between"
          alignItems="center"
          flexDirection="column"
          mb={1}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
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

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              marginBottom: 0,
            }}
            >
            Provide your dietary preferences, calorie goals, or ingredients, and
            let AI create personalized meal ideas just for you.
          </Typography>
            </Box>
        </Box>
      </Paper>

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

      {/* Your Saved Meals Section Heading*/}
      <Box mt={4}>
        <Paper
          sx={{
            padding: 2,
          }}
        >
              <Typography variant="h5" mb={1}>
      Your Favorited Meals
    </Typography>
    {favoriteMeals.length === 0 && (
      <Typography
        variant="body1"
        sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
      >
        Your meal list is looking a bit empty
      </Typography>
    )}
    {favoriteMeals.length > 0 && (
      <Typography
        variant="body1"
        sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
      >
        Here are your tracked meals
      </Typography>
    )}
  </Paper>

  {/* Meals Grid */}
  {favoriteMeals.length > 0 && (
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
  )}
      </Box>

      {/* Meals From Others Section */}

      <Box mt={4}>
        <Paper
          sx={{
            padding: 2,
          }}
        >
          <Typography variant="h5" mb={1}>
            Meals From Other Users
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
          >
            Explore meals shared by others to discover new ideas and stay
            inspired.
          </Typography>
        </Paper>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {otherUserMeals.length > 0 ? (
            otherUserMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                handleDelete={() =>
                  console.log(
                    "Delete function for individual meals, " + meal.id
                  )
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
