import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import { Box, Paper, Typography, Divider } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CompactWorkoutCard from "../components/workout/CompactWorkoutCard";
import CompactMealCard from "../components/meal/CompactMealCard";
import DailyStatsCard from "../components/dashboard/DailyStatsCard";
import WorkoutListCard from "../components/workout/WorkoutListCard";
import MealListCard from "../components/meal/MealListCard";
import TodayIcon from "@mui/icons-material/Today";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";

/**
 * Dashboard component that displays a user's daily stats, workouts, meals, and calendar.
 * It fetches data from an API based on the selected date.
 * 
 * @component
 * @example
 * return (
 *   <Dashboard />
 * )
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weight, setWeight] = useState(undefined);
  const [avgCalIntake, setCalIntake] = useState(2000);

  /**
   * Fetches the user's workouts for a specific date.
   * 
   * @param {Date} date - The selected date to fetch workouts for.
   */
  const fetchWorkoutsForDate = async (date) => {
    try {
      const response = await fetch("/get_workouts_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString().split("T")[0],
          email: user.email,
        }),
      });
      const data = await response.json();
      console.log("API response for workouts:", data);
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setWorkouts([]);
    }
  };

  /**
   * Fetches the user's meals for a specific date.
   * 
   * @param {Date} date - The selected date to fetch meals for.
   */
  const fetchMealsForDate = async (date) => {
    try {
      const response = await fetch("/get_meals_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString().split("T")[0],
          email: user.email,
        }),
      });
      const data = await response.json();
      console.log("API response for meals:", data);
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Fetches the user's weight for a specific date.
   * 
   * @param {Date} date - The selected date to fetch the user's weight for.
   */
  const fetchWeightForDate = async (date) => {
    try {
      const response = await fetch("/get_weight_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString().split("T")[0],
          user_id: user.uid,
        }),
      });
      const data = await response.json();
      setWeight(data.weight);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Fetches the user's average calorie intake from their profile.
   */
  const fetchUserAvgCalIntake = async () => {
    try {
      const response = await fetch(`/get_profile?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setCalIntake(data.avg_cal_intake);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  /**
   * Handles the change of the selected date in the calendar.
   * It updates the selected date and fetches data related to that date.
   * 
   * @param {Date} date - The newly selected date.
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchWorkoutsForDate(date);
    fetchMealsForDate(date);
  };

  useEffect(() => {
    fetchWorkoutsForDate(selectedDate);
    fetchMealsForDate(selectedDate);
    fetchUserAvgCalIntake();
    fetchWeightForDate(selectedDate);
  }, [selectedDate]);

  return (
    <Box sx={{ padding: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          marginBottom: 3,
          width: "100%",
        }}
      >
        {/* Calendar Section */}
        <Paper
          sx={{
            flex: 1,
            padding: 2,
            borderRadius: 2,
            width: "auto",
            maxWidth: 350,
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
        {/* Daily Stats Card */}
        <DailyStatsCard
          meals={meals}
          workouts={workouts}
          userWeight={weight}
          expectedDailyCalories={avgCalIntake}
          date={selectedDate}
        />
      </Box>
      {/* Group Workout and Meals together */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          maxHeight: "auto",
          gap: 2,
        }}
      >
        {/* Workouts Section */}
        <WorkoutListCard workouts={workouts} />

        <MealListCard meals={meals} />
      </Box>
    </Box>
  );
};

export default Dashboard;
