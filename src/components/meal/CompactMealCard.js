import React, { useState } from "react";
import { Paper, Typography, Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import MealCard from "./MealCard";

const CompactMealCard = ({ meal }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <Paper
      sx={{
        padding: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        marginBottom: 2,
        maxHeight: 200,
        overflowY: "auto",
        width: "100%",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {meal.name || "Meal Name"}
      </Typography>
      <Typography variant="body2">
        <strong>Protein:</strong> {meal.proteins}g
      </Typography>
      <Typography variant="body2">
        <strong>Carbs:</strong> {meal.carbs}g
      </Typography>
      <Typography variant="body2">
        <strong>Fats:</strong> {meal.fats}g
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 2 }}>
        <strong>Ingredients:</strong>
      </Typography>
      <Box sx={{ paddingLeft: 1 }}>
        {meal.ingredients.length > 0 ? (
          meal.ingredients.map((ingredient, index) => (
            <Typography key={index} variant="body2">
              - {ingredient}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No ingredients listed
          </Typography>
        )}
      </Box>

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
          onClick={handleDialogOpen}
        >
          View
        </Typography>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md" // Add a maxWidth for more controlled dialog size
        fullWidth
      >
        <DialogTitle>Meal Details</DialogTitle>
        <DialogContent>
          <MealCard meal={meal} />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CompactMealCard;
