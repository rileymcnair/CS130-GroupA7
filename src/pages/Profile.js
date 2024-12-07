import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Typography, Card, CardContent, Box } from "@mui/material";

import ProfileForm from "../components/profile/ProfileForm";
import ProfileInfo from "../components/profile/ProfileInfo";
import FavoriteMeals from "../components/profile/FavoriteMeals";
import FavoriteWorkouts from "../components/profile/FavoriteWorkouts";
import AddMealDialog from "../components/profile/AddMealDialog";
import AddWorkoutDialog from "../components/profile/AddWorkoutDialog";
import GenerateCalendarFile from "../components/profile/GenerateCalendarFile";

/**
 * Profile component allows the user to view and edit their profile,
 * manage favorite meals and workouts, and submit new meals/workouts.
 */
function Profile() {
  const { user } = useAuth();

  // State for profile data and editing status
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    avg_cal_intake: "",
    goal: "",
    height: "",
    weight: "",
    favorited_meals: [],
    favorited_workouts: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  // State for handling dialog visibility and meal/workout details
  const [mealDetails, setMealDetails] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);

  // State for new meal and workout inputs
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: "",
    carbs: "",
    fats: "",
    proteins: "",
    type: "",
    ingredients: "",
  });
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    total_minutes: "",
    body_part_focus: "",
    exercises: [
      {
        description: "",
        avg_calories_burned: "",
        body_parts: "",
        name: "",
        reps: "",
        sets: "",
        weight: "",
      },
    ],
  });

  /**
   * Handles profile data input changes.
   * @param {object} e - The event object from the form input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Profile save handler
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/save_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (response.ok) setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Meal and Workout dialog handlers
  const handleMealDialogOpen = () => setMealDialogOpen(true);
  const handleMealDialogClose = () => {
    setMealDialogOpen(false);
    setNewMeal({
      name: "",
      calories: "",
      carbs: "",
      fats: "",
      proteins: "",
      type: "",
      ingredients: "",
    });
  };

  const handleWorkoutDialogOpen = () => setWorkoutDialogOpen(true);
  const handleWorkoutDialogClose = () => {
    setWorkoutDialogOpen(false);
    setNewWorkout({
      name: "",
      total_minutes: "",
      body_part_focus: "",
      exercises: [
        {
          description: "",
          avg_calories_burned: "",
          body_parts: "",
          name: "",
          reps: "",
          sets: "",
          weight: "",
        },
      ],
    });
  };

  /**
   * Handles changes to workout exercises.
   * @param {number} index - The index of the exercise to update.
   * @param {string} field - The field to update within the exercise.
   * @param {string} value - The new value for the field.
   */
  const handleExerciseChange = (index, field, value) => {
    setNewWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      ),
    }));
  };

  /**
   * Adds a new exercise to the workout.
   */
  const handleAddExercise = () => {
    setNewWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          description: "",
          avg_calories_burned: "",
          body_parts: "",
          name: "",
          reps: "",
          sets: "",
          weight: "",
        },
      ],
    }));
  };

  // Submit handlers for meal and workout
  const handleMealSubmit = async () => {
    const mealData = {
      email: user.email,
      name: newMeal.name,
      calories: Number(newMeal.calories),
      carbs: Number(newMeal.carbs),
      fats: Number(newMeal.fats),
      proteins: Number(newMeal.proteins),
      type: newMeal.type,
      ingredients: newMeal.ingredients.split(",").map((item) => item.trim()),
    };

    try {
      const response = await fetch("/create_favorite_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData((prevData) => ({
          ...prevData,
          favorited_meals: [...prevData.favorited_meals, data.meal_id],
        }));
        handleMealDialogClose();
      }
    } catch (error) {
      console.error("Error creating favorite meal:", error);
    }
  };

  const handleWorkoutSubmit = async () => {
    const workoutData = {
      email: user.email,
      name: newWorkout.name,
      body_part_focus: newWorkout.body_part_focus,
      total_minutes: Number(newWorkout.total_minutes),
      exercises: newWorkout.exercises,
    };

    try {
      const response = await fetch("/create_favorite_workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData((prevData) => ({
          ...prevData,
          favorited_workouts: [...prevData.favorited_workouts, data.workout_id],
        }));
        handleWorkoutDialogClose();
      }
    } catch (error) {
      console.error("Error creating favorite workout:", error);
    }
  };

  /**
   * Fetches the user's profile data.
   */
  const fetchProfile = async () => {
    try {
      const response = await fetch(`/get_profile?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          ...data,
          favorited_meals: data.favorited_meals || [],
          favorited_workouts: data.favorited_workouts || [],
        });
        setIsEditing(false);
      } else if (response.status === 404) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  /**
   * Removes a meal or workout from the favorites.
   * @param {string} type - The type of item ('meal' or 'workout').
   * @param {string} id - The ID of the item to remove.
   */
  const removeFavorite = async (type, id) => {
    const endpoint =
      type === "meal" ? "/remove_favorite_meal" : "/remove_favorite_workout";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, id }),
      });

      if (response.ok) {
        setProfileData((prevData) => {
          const updatedList = prevData[
            type === "meal" ? "favorited_meals" : "favorited_workouts"
          ].filter((item) => item !== id);
          return {
            ...prevData,
            [type === "meal" ? "favorited_meals" : "favorited_workouts"]:
              updatedList,
          };
        });

        if (type === "meal") {
          setMealDetails((prevDetails) =>
            prevDetails.filter((meal) => meal && meal.id !== id)
          );
        } else {
          setWorkoutDetails((prevDetails) =>
            prevDetails.filter((workout) => workout && workout.id !== id)
          );
        }
      }
    } catch (error) {
      console.error(`Error removing favorite ${type}:`, error);
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Fetch meal details when favorited meals change
  useEffect(() => {
    const fetchMealDetails = async (mealId) => {
      const response = await fetch(`/get_meal_details?mealId=${mealId}`);
      return response.ok ? response.json() : null;
    };

    if (profileData.favorited_meals.length) {
      Promise.all(profileData.favorited_meals.map(fetchMealDetails))
        .then(setMealDetails)
        .catch(console.error);
    }
  }, [profileData.favorited_meals]);

  // Fetch workout details when favorited workouts change
  useEffect(() => {
    const fetchWorkoutDetails = async (workoutId) => {
      const response = await fetch(
        `/get_workout_details?workoutId=${workoutId}`
      );
      return response.ok ? response.json() : null;
    };

    if (profileData.favorited_workouts.length) {
      Promise.all(profileData.favorited_workouts.map(fetchWorkoutDetails))
        .then(setWorkoutDetails)
        .catch(console.error);
    }
  }, [profileData.favorited_workouts]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      <GenerateCalendarFile />
      <Card>
        <CardContent>
          {!isEditing ? (
            <ProfileInfo
              profileData={profileData}
              onEdit={() => setIsEditing(true)}
            />
          ) : (
            <ProfileForm
              profileData={profileData}
              onChange={handleChange}
              onSave={handleSave}
            />
          )}
        </CardContent>
      </Card>

      <Box>
        <FavoriteMeals meals={mealDetails} onRemove={removeFavorite} />
        <FavoriteWorkouts workouts={workoutDetails} onRemove={removeFavorite} />
      </Box>

      <AddMealDialog
        open={mealDialogOpen}
        onClose={handleMealDialogClose}
        onSubmit={handleMealSubmit}
        newMeal={newMeal}
        setNewMeal={setNewMeal}
      />

      <AddWorkoutDialog
        open={workoutDialogOpen}
        onClose={handleWorkoutDialogClose}
        onSubmit={handleWorkoutSubmit}
        newWorkout={newWorkout}
        setNewWorkout={setNewWorkout}
        handleExerciseChange={handleExerciseChange}
        handleAddExercise={handleAddExercise}
      />
    </Container>
  );
}

export default Profile;
