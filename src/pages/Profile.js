import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Typography, Card, CardContent, Box } from "@mui/material";

import ProfileForm from "../components/profile/ProfileForm";
import ProfileInfo from "../components/profile/ProfileInfo";
import FavoriteMeals from "../components/profile/FavoriteMeals";
import FavoriteWorkouts from "../components/profile/FavoriteWorkouts";
import AddMealDialog from "../components/profile/AddMealDialog";
import AddWorkoutDialog from "../components/profile/AddWorkoutDialog";

function Profile() {
  const { user } = useAuth();

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
  const [mealDetails, setMealDetails] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);

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

  // profile handlers
  const handleEdit = () => setIsEditing(true);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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

  // dialog handlers
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

  const handleExerciseChange = (index, field, value) => {
    setNewWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  };

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

  // submit handlers
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

  // fetch functions
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
            prevDetails.filter((meal) => meal && meal.id !== id),
          );
        } else {
          setWorkoutDetails((prevDetails) =>
            prevDetails.filter((workout) => workout && workout.id !== id),
          );
        }
      }
    } catch (error) {
      console.error(`Error removing favorite ${type}:`, error);
    }
  };

  // effects
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const fetchMealDetails = async (mealId) => {
      const response = await fetch(`/get_meal_details?mealId=${mealId}`);
      return response.ok ? response.json() : null;
    };

    if (profileData.favorited_meals.length > 0) {
      Promise.all(
        profileData.favorited_meals.map((mealId) => fetchMealDetails(mealId)),
      )
        .then((details) => setMealDetails(details))
        .catch((error) => console.error("Error fetching meal details:", error));
    }
  }, [profileData.favorited_meals]);

  useEffect(() => {
    const fetchWorkoutDetails = async (workoutId) => {
      const response = await fetch(
        `/get_workout_details?workoutId=${workoutId}`,
      );
      return response.ok ? response.json() : null;
    };

    if (profileData.favorited_workouts.length > 0) {
      Promise.all(
        profileData.favorited_workouts.map((workoutId) =>
          fetchWorkoutDetails(workoutId),
        ),
      )
        .then((details) => setWorkoutDetails(details))
        .catch((error) =>
          console.error("Error fetching workout details:", error),
        );
    }
  }, [profileData.favorited_workouts]);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <div>
      <Box sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", gap: 3, marginTop: 4 }}>
          <Box sx={{ minWidth: 400 }}>
            <Card>
              <CardContent>
                {isEditing ? (
                  <ProfileForm
                    profileData={profileData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                  />
                ) : (
                  <ProfileInfo
                    profileData={profileData}
                    handleEdit={handleEdit}
                  />
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ maxWidth: 500 }}>
            <Card>
              <CardContent>
                <FavoriteMeals
                  mealDetails={mealDetails}
                  profileData={profileData}
                  handleMealDialogOpen={handleMealDialogOpen}
                  removeFavorite={removeFavorite}
                />
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ maxWidth: 500 }}>
            <Card>
              <CardContent>
                <FavoriteWorkouts
                  workoutDetails={workoutDetails}
                  profileData={profileData}
                  handleWorkoutDialogOpen={handleWorkoutDialogOpen}
                  removeFavorite={removeFavorite}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        <AddMealDialog
          open={mealDialogOpen}
          handleClose={handleMealDialogClose}
          newMeal={newMeal}
          setNewMeal={setNewMeal}
          handleSubmit={handleMealSubmit}
        />

        <AddWorkoutDialog
          open={workoutDialogOpen}
          handleClose={handleWorkoutDialogClose}
          newWorkout={newWorkout}
          setNewWorkout={setNewWorkout}
          handleExerciseChange={handleExerciseChange}
          handleAddExercise={handleAddExercise}
          handleSubmit={handleWorkoutSubmit}
        />
      </Box>
    </div>
  );
}

export default Profile;
