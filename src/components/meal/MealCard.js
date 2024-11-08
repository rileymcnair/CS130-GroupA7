import React, { useState, useEffect } from 'react';
import { Typography, Box, List, ListItem, IconButton, Paper, Divider } from '@mui/material';
import { Delete as DeleteIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MealCard = ({ meal, handleDelete }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkIfFavorite();
  }, [meal.id]);

  const checkIfFavorite = async () => {
    if (!user?.email || !meal.id) return;

    try {
      const response = await fetch('/check_is_favorite_meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_id: meal.id,
          email: user.email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.is_favorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user?.email || !meal.id) {
        console.error("Invalid email or meal ID:", user?.email, meal.id);
        return;
    }

    try {
      const response = await fetch('/add_meal_to_favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_id: meal.id,
          email: user.email
        }),
      });

      if (response.ok) {
        setIsFavorite(true);
      } else {
        console.error('Failed to add meal to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
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
                disabled={isFavorite}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleDelete} edge="end" color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ width: '100%' }}>
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
              <strong>Ingredients:</strong> {meal.ingredients.join(', ')}
            </Typography>
          </Box>
        </ListItem>
        <Divider />
      </List>
    </Paper>
  );
};

export default MealCard;
