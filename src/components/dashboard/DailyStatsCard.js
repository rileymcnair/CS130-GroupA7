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
  meals, // list of all the meals for that day
  workouts, // list of all the workouts for that day
  userWeight, // weight may be undefined
  expectedDailyCalories,
  date,
}) => {
  // State to manage weight
  const [weight, setWeight] = useState(null); // Initialize as null (no data)
  const [isEditingWeight, setIsEditingWeight] = useState(false); // Edit mode toggle

  // Set weight based on userWeight prop when component loads
  useEffect(() => {
    if (userWeight !== undefined) {
      setWeight(userWeight);
    }
  }, [userWeight]);

  // Calculate Daily Stats
  const totalCalories = (Array.isArray(meals) ? meals : []).reduce(
    (acc, meal) => acc + (meal.calories || 0),
    0,
  );
  const totalProtein = (Array.isArray(meals) ? meals : []).reduce(
    (sum, meal) => sum + (meal.proteins || 0),
    0,
  );
  const totalCarbs = (Array.isArray(meals) ? meals : []).reduce(
    (sum, meal) => sum + (meal.carbs || 0),
    0,
  );
  const totalFats = (Array.isArray(meals) ? meals : []).reduce(
    (sum, meal) => sum + (meal.fats || 0),
    0,
  );

  const totalWorkoutCalories = (Array.isArray(workouts) ? workouts : []).reduce(
    (sum, workout) =>
      sum +
      (Array.isArray(workout.exercises)
        ? workout.exercises.reduce(
            (exerciseSum, exercise) =>
              exerciseSum + (exercise.avg_calories_burned || 0),
            0,
          )
        : 0),
    0,
  );

  const totalWorkoutTime = (Array.isArray(workouts) ? workouts : []).reduce(
    (sum, workout) => sum + (workout.total_minutes || 0),
    0,
  );

  const parsedDate = new Date(date).toISOString().split("T")[0];
  const handleSaveWeight = async (weight, parsedDate) => {
    try {
      const parsedWeight = parseInt(weight, 10);
      if (isNaN(parsedWeight)) {
        console.error("Invalid weight value:", weight);
        return;
      }
      const response = await fetch("/update_weight_on_day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weight: weight, date: parsedDate }), // Send the weight to the server
      });

      if (response.ok) {
        const result = await response.json();
        // console.log('Weight saved successfully:', result);
      } else {
        console.error("Failed to save weight:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving weight:", error);
    } finally {
      setIsEditingWeight(false); // Exit edit mode regardless of success or failure
    }
  };

  // Calculate percentage of total calories consumed vs. expected
  const caloriePercentage = Math.min(
    (totalCalories / expectedDailyCalories) * 100,
    100,
  );
  const workoutPercentage = Math.min(
    (totalWorkoutCalories / expectedDailyCalories) * 100,
    100,
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
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        padding: 2,
        width: "auto",
        minHeight: 500,
      }}
    >
      {/* Card Title */}
      <Box
        sx={{
          display: "flex",
          height: "auto",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 1,
        }}
      >
        <QueryStatsIcon />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Daily Stats
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      {/* Card Body */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          maxHeight: "auto",
          gap: 2,
        }}
      >
        {/* Bar Graph */}
        <Paper
          sx={{
            padding: 2,
            flex: "1", // Fill half the width minus the gap
            minWidth: "300",
          }}
        >
          <Box
            sx={{
              maxWidth: 300,
            }}
          >
            {/* Total Nutrition */}
            <Box sx={{ marginBottom: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Nutrition
              </Typography>
              <Divider sx={{ marginBottom: 0 }} />

              <Box sx={{ height: 150, mt: 3 }}>
                <Bar data={macroData} options={macroOptions} />
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography variant="body1">
                  <strong>Calories:</strong> {totalCalories}
                </Typography>
                <Typography variant="body1">
                  <strong>Protein:</strong> {totalProtein}g
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography variant="body1">
                  <strong>Carbs:</strong> {totalCarbs}g
                </Typography>
                <Typography variant="body1">
                  <strong>Fats:</strong> {totalFats}g
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Workout Calories and Time */}
        <Paper
          sx={{
            padding: 2,
            flex: "1", // Fill half the width minus the gap
            minWidth: "200",
          }}
        >
          <Box>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Workouts
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />

              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Total Calories Burned:</strong> {totalWorkoutCalories}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Total Workout Time:</strong> {totalWorkoutTime} min
              </Typography>
            </Box>

            {/* Weight Section */}
            <Box sx={{ marginBottom: 3 }}>
              {/* Weight Heading */}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Weight
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />

              {/* Weight Card Body */}
              {isEditingWeight ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <TextField
                    label="Enter your weight (lb)"
                    type="number"
                    value={weight || ""}
                    onChange={(e) => setWeight(e.target.value)}
                    size="small"
                  />
                  <IconButton
                    color="#000000"
                    onClick={() => handleSaveWeight(weight, parsedDate)}
                    title="Save Weight"
                  >
                    <SaveAsIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">
                    {weight !== null &&
                    weight !== undefined &&
                    weight.length !== 0
                      ? `${weight} lb`
                      : "No weight data available"}
                  </Typography>
                  <IconButton
                    color="#000000"
                    onClick={() => setIsEditingWeight(true)}
                    title="Edit Weight"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Expected Daily Calories */}
        <Paper
          sx={{
            flex: "2",
            padding: 2,
            minWidth: 400,
            width: "100%", // Make it fill the container
            maxWidth: "100%", // Ensure it doesn’t exceed the container's width
            boxSizing: "border-box", // Include padding in width calculations
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Expected Daily Calories
            </Typography>
            <Divider sx={{ marginBottom: 0 }} />

            <Typography variant="body1" sx={{ mt: 1, marginBottom: 1 }}>
              {totalCalories} / {expectedDailyCalories} kcal
            </Typography>

            {/* Linear Progress Bar with Dual Progress */}
            <StyledLinearProgress
              variant="determinate"
              value={caloriePercentage}
              workoutValue={100 - workoutPercentage}
            />
            {/* Legend */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#3f51b5",
                    borderRadius: "50%",
                  }}
                ></Box>
                <Typography variant="body2">Calories Consumed</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#ff9800",
                    borderRadius: "50%",
                  }}
                ></Box>
                <Typography variant="body2">Workout Calories</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Card>
  );
};

export default DailyStatsCard;
