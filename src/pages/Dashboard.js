import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CompactWorkoutCard from "../components/workout/CompactWorkoutCard";
import CompactMealCard from "../components/meal/CompactMealCard";
import DailyStatsCard from "../components/dashboard/DailyStatsCard";
import TodayIcon from "@mui/icons-material/Today";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);

  const fetchWorkoutsForDate = async (date) => {
    try {
      const response = await fetch("/get_workouts_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString().split("T")[0] }),
      });
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMealsForDate = async (date) => {
    try {
      const response = await fetch("/get_meals_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString().split("T")[0] }),
      });
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchWorkoutsForDate(date);
    fetchMealsForDate(date);
  };

  useEffect(() => {
    fetchWorkoutsForDate(selectedDate);
    fetchMealsForDate(selectedDate);
  }, [selectedDate]);

  return (
    <Box sx={{ padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          marginBottom: 3,
        }}
      >
        {/* Calendar Section */}
        <Paper
          sx={{
            flex: 1,
            padding: 2,
            borderRadius: 2,
            minWidth: { xs: "100%", md: "30%" },
          }}
        >
          {/* Calendar Heading */}
          <Box
            sx={{
              display: "flex",
              height: "auto",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TodayIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {selectedDate.toDateString()}
            </Typography>
          </Box>
          <Divider sx={{ marginBottom: 1 }} />
          {/* Calendar Element */}
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </Paper>
        <DailyStatsCard
          totalCalories={90}
          totalProtein={20}
          totalCarbs={30}
          totalFats={40}
          workoutCalories={200}
          expectedDailyCalories={2000}
        />

        {/* Workouts Section */}
        <Paper
          sx={{
            flex: 2,
            padding: 2,
            borderRadius: 2,
          }}
        >
          {/* Card Heading */}
          <Box
            sx={{
              display: "flex",
              height: "auto",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FitnessCenterIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Workouts
            </Typography>
          </Box>
          <Divider sx={{ marginBottom: 1 }} />
          {/* Card Body */}

          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {workouts.map((workout) => (
              <CompactWorkoutCard key={workout.id} workout={workout} />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Meals Section */}
      <Paper
        sx={{
          padding: 2,
          borderRadius: 2,
          marginBottom: 3,
        }}
      >
        {/* Card Heading */}
        <Box
          sx={{
            display: "flex",
            height: "auto",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1,
          }}
        >
          <RestaurantIcon />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Meals
          </Typography>
        </Box>
        <Divider sx={{ marginBottom: 1 }} />

        {/* Card Body */}
        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {meals.map((meal) => (
            <CompactMealCard key={meal.id} meal={meal} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
