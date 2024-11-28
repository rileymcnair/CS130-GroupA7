import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CompactWorkoutCard from "../components/workout/CompactWorkoutCard";
import CompactMealCard from "../components/meal/CompactMealCard";

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
    <Box sx={{ padding: 3 }}>
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
            padding: 3,
            borderRadius: 2,
            minWidth: { xs: "100%", md: "30%" },
          }}
        >
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </Paper>

        {/* Workouts Section */}
        <Paper
          sx={{
            flex: 2,
            padding: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5">
            Workouts for {selectedDate.toDateString()}
          </Typography>
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
          padding: 3,
          borderRadius: 2,
          marginBottom: 3,
        }}
      >
        <Typography variant="h5">Meals</Typography>
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
