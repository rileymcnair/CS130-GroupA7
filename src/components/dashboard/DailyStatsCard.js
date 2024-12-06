import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Divider,
  LinearProgress,
  TextField,
  IconButton,
  styled,
  Paper,
} from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import EditIcon from "@mui/icons-material/Edit";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Custom LinearProgress with dual progress styling
const StyledLinearProgress = styled(LinearProgress)(({ workoutValue }) => ({
  height: 8,
  borderRadius: 4,
  position: "relative",
  backgroundColor: "#e0e0e0",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#3f51b5", // Default progress (calories consumed)
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: `${workoutValue}%`,
    backgroundColor: "#ff9800", // Workout calories progress
    borderRadius: "4px",
  },
}));

const DailyStatsCard = ({
  meals,
  workouts,
  userWeight,
  expectedDailyCalories,
  date,
}) => {
  const [weight, setWeight] = useState(null); // Initialize as null (no data)
  const [isEditingWeight, setIsEditingWeight] = useState(false); // Edit mode toggle
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Set weight based on userWeight prop when component loads
  useEffect(() => {
    if (userWeight !== undefined) {
      setWeight(userWeight);
    }
  }, [userWeight]);

  // Helper function to calculate total values
  const calculateTotal = (arr, key) => {
    return (Array.isArray(arr) ? arr : []).reduce(
      (acc, item) => acc + (item[key] || 0),
      0
    );
  };

  // Calculate Daily Stats
  const totalCalories = calculateTotal(meals, "calories");
  const totalProtein = calculateTotal(meals, "proteins");
  const totalCarbs = calculateTotal(meals, "carbs");
  const totalFats = calculateTotal(meals, "fats");

  const totalWorkoutCalories = (Array.isArray(workouts) ? workouts : []).reduce(
    (sum, workout) =>
      sum +
      (Array.isArray(workout.exercises)
        ? workout.exercises.reduce(
            (exerciseSum, exercise) =>
              exerciseSum + (exercise.avg_calories_burned || 0),
            0
          )
        : 0),
    0
  );

  const totalWorkoutTime = calculateTotal(workouts, "total_minutes");

  const parsedDate = new Date(date).toISOString().split("T")[0];

  const handleSaveWeight = async (weight, parsedDate) => {
    try {
      const parsedWeight = parseInt(weight, 10);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        setError("Please enter a valid weight.");
        return;
      }
      setLoading(true);
      setError(null);

      const response = await fetch("/update_weight_on_day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weight: weight, date: parsedDate }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsEditingWeight(false); // Exit edit mode
      } else {
        setError("Failed to save weight.");
      }
    } catch (error) {
      setError("Error saving weight: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage of total calories consumed vs. expected
  const caloriePercentage = Math.min(
    (totalCalories / expectedDailyCalories) * 100,
    100
  );
  const workoutPercentage = Math.min(
    (totalWorkoutCalories / expectedDailyCalories) * 100,
    100
  );

  // Bar graph data
  const macroData = {
    labels: ["Protein", "Carbs", "Fats"],
    datasets: [
      {
        label: "Grams",
        data: [totalProtein, totalCarbs, totalFats],
        backgroundColor: ["#3f51b5", "#ff9800", "#4caf50"], // Colors for each bar
      },
    ],
  };

  const macroOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "category",
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        ticks: {
          stepSize: 20,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, padding: 2 }}>
      {/* Card Title */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <QueryStatsIcon />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Daily Stats
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      {/* Card Body */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {/* Bar Graph */}
        <Paper sx={{ padding: 2, flex: "1", minWidth: 300 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Nutrition
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Box sx={{ height: 150, mt: 3 }}>
            <Bar data={macroData} options={macroOptions} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body1">
              <strong>Calories:</strong> {totalCalories}
            </Typography>
            <Typography variant="body1">
              <strong>Protein:</strong> {totalProtein}g
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body1">
              <strong>Carbs:</strong> {totalCarbs}g
            </Typography>
            <Typography variant="body1">
              <strong>Fats:</strong> {totalFats}g
            </Typography>
          </Box>
        </Paper>

        {/* Workout Calories and Time */}
        <Paper sx={{ padding: 2, flex: "1", minWidth: 200 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Workouts
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography variant="body1">
            <strong>Total Calories Burned:</strong> {totalWorkoutCalories}
          </Typography>
          <Typography variant="body1">
            <strong>Total Workout Time:</strong> {totalWorkoutTime} min
          </Typography>

          {/* Weight Section */}
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Weight
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            {isEditingWeight ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Enter your weight (lb)"
                  type="number"
                  value={weight || ""}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <IconButton
                  color="primary"
                  onClick={() => handleSaveWeight(weight, parsedDate)}
                  disabled={loading}
                >
                  <SaveAsIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <Typography variant="body1">Weight: {weight} lb</Typography>
                <IconButton
                  color="primary"
                  onClick={() => setIsEditingWeight(true)}
                >
                  <EditIcon />
                </IconButton>
              </>
            )}
            {loading && <Typography variant="body2">Saving...</Typography>}
            {error && <Typography variant="body2" color="error">{error}</Typography>}
          </Box>
        </Paper>
      </Box>

      {/* Progress Bar for Calories */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Daily Progress
        </Typography>
        <StyledLinearProgress
          variant="determinate"
          value={caloriePercentage}
          workoutValue={workoutPercentage}
        />
      </Box>
    </Card>
  );
};

export default DailyStatsCard;
