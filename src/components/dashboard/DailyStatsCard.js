import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Divider,
  LinearProgress,
  TextField,
  IconButton,
  styled,
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
  totalCalories = 1800,
  totalProtein = 120,
  totalCarbs = 150,
  totalFats = 50,
  workoutCalories = 400,
  workoutTime = 60,
  expectedDailyCalories = 2000,
}) => {
  // State to manage weight
  const [weight, setWeight] = useState(null); // Initialize as null (no data)
  const [isEditingWeight, setIsEditingWeight] = useState(false); // Edit mode toggle

  // Calculate percentage of total calories consumed vs. expected
  const caloriePercentage = Math.min(
    (totalCalories / expectedDailyCalories) * 100,
    100
  );
  const workoutPercentage = Math.min(
    (workoutCalories / expectedDailyCalories) * 100,
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

  // Save handler
  const handleSaveWeight = () => {
    console.log("Weight saved:", weight);
    setIsEditingWeight(false); // Exit edit mode
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        padding: 2,
        marginBottom: 4,
        maxWidth: 400,
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

      {/* Bar Graph */}
      <Box sx={{ height: 150, mt: 3 }}>
        <Bar data={macroData} options={macroOptions} />
      </Box>

      {/* Total Nutrition */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Nutrition
        </Typography>
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
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      {/* Workout Calories and Time */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Workouts
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          <strong>Total Calories Burned:</strong> {workoutCalories}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          <strong>Total Workout Time:</strong> {workoutTime} min
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      {/* Weight Section */}
      <Box sx={{ marginBottom: 3 }}>
        {/* Weight Heading */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Weight
        </Typography>
        {/* Weight Card Body */}
        {isEditingWeight ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between", width: "100%"}}>
            <Box sx={{width: "20"}}>
            <TextField
              label="Enter your weight (lb)"
              type="number"
              value={weight || ""}
              onChange={(e) => setWeight(e.target.value)}
              size="small"
            />
            </Box>
            <IconButton
              color="#000000"
              onClick={handleSaveWeight}
              title="Save Weight"
            >
              <SaveAsIcon fontSize="small"/>
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",}}>
            <Typography variant="body1">
              {weight ? `${weight} lb` : "No weight data available"}
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

      <Divider sx={{ marginBottom: 2 }} />

      {/* Expected Daily Calories */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Expected Daily Calories
        </Typography>
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
    </Card>
  );
};

export default DailyStatsCard;
