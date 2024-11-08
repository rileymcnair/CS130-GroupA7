import React from 'react';
import { Typography, Button, Box, List, ListItem, IconButton, Paper, Divider } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const FavoriteMeals = ({ mealDetails, profileData, handleMealDialogOpen, removeFavorite }) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Favorite Meals</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleMealDialogOpen}
        >
          Add Meal
        </Button>
      </Box>
      
      <Paper sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
        <List>
          {mealDetails.map((meal, index) => (
            meal && (
              <React.Fragment key={profileData.favorited_meals[index]}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={() => removeFavorite('meal', profileData.favorited_meals[index])} edge="end" color="error">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography><strong>Calories:</strong> {meal?.calories || 'N/A'}</Typography>
                    <Typography><strong>Carbs:</strong> {meal?.carbs || 'N/A'}g</Typography>
                    <Typography><strong>Fats:</strong> {meal?.fats || 'N/A'}g</Typography>
                    <Typography><strong>Proteins:</strong> {meal?.proteins || 'N/A'}g</Typography>
                    <Typography><strong>Ingredients:</strong> {meal?.ingredients?.join(', ') || 'None'}</Typography>
                  </Box>
                </ListItem>
                {index < mealDetails.length - 1 && <Divider />}
              </React.Fragment>
            )
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default FavoriteMeals;
