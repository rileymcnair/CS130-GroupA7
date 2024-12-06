import React from "react";
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

/**
 * FavoriteMeals component displays a list of the user's favorite meals.
 * Each meal in the list shows its details such as name, calories, carbs, fats,
 * proteins, and ingredients. Users can also remove meals from their favorites
 * using the delete button.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.mealDetails - An array of meal objects, each containing details like name, calories, carbs, fats, proteins, and ingredients.
 * @param {Object} props.profileData - The user's profile data, which includes a list of favorited meals.
 * @param {Function} props.handleMealDialogOpen - Function to open the dialog to add a new meal.
 * @param {Function} props.removeFavorite - Function to remove a meal from the user's favorites.
 */
const FavoriteMeals = ({
  mealDetails,
  profileData,
  handleMealDialogOpen,
  removeFavorite,
}) => {
  return (
    <Box>
      {/* Header with title and button to add meal */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Favorite Meals</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleMealDialogOpen}
        >
          Add Meal
        </Button>
      </Box>

      {/* Paper container for the list of meals */}
      <Paper
        sx={{ maxHeight: 900, overflow: "auto", bgcolor: "background.paper" }}
      >
        <List>
          {/* Map over mealDetails to render each meal */}
          {mealDetails.map(
            (meal, index) =>
              meal && (
                <React.Fragment key={profileData.favorited_meals[index]}>
                  <ListItem
                    secondaryAction={
                      // Delete button to remove the meal from favorites
                      <IconButton
                        onClick={() =>
                          removeFavorite(
                            "meal",
                            profileData.favorited_meals[index],
                          )
                        }
                        edge="end"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ width: "100%" }}>
                      {/* Meal details */}
                      <Typography>
                        <strong>Name:</strong> {meal?.name || ""}
                      </Typography>
                      <Typography>
                        <strong>Calories:</strong> {meal?.calories || "N/A"}
                      </Typography>
                      <Typography>
                        <strong>Carbs:</strong> {meal?.carbs || "N/A"}g
                      </Typography>
                      <Typography>
                        <strong>Fats:</strong> {meal?.fats || "N/A"}g
                      </Typography>
                      <Typography>
                        <strong>Proteins:</strong> {meal?.proteins || "N/A"}g
                      </Typography>
                      <Typography>
                        <strong>Ingredients:</strong>{" "}
                        {meal?.ingredients?.join(", ") || "None"}
                      </Typography>
                    </Box>
                  </ListItem>
                  {/* Divider between meals */}
                  {index < mealDetails.length - 1 && <Divider />}
                </React.Fragment>
              ),
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default FavoriteMeals;
