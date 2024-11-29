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

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weight, setWeight] = useState(undefined);
  const [avgCalIntake, setCalIntake] = useState(2000);

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

  const fetchWeightForDate = async (date) => {
    try {
      const response = await fetch("/get_weight_on_day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString().split("T")[0] }),
      });
      const data = await response.json();
      setWeight(data.weight);
      console.log("fetchWeightForDate");
    } catch (error) {
      console.error(error);
    }
  }

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
  }

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
            minWidth: { xs: "100%", md: "30%" },
            width: "auto",
            maxWidth: 400,
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
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        maxHeight: "auto",
        gap: 2,
      }}>
        {/* Workouts Section */}
      <WorkoutListCard workouts={workouts}/>

      <MealListCard meals={meals}/>
      </Box>
    </Box>
  );
};

export default Dashboard;
