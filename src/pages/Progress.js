import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetchProgressData(user.email);
      fetchLeaderboardData();
    }
  }, [user]);

  const fetchProgressData = async (email) => {
    try {
      const response = await fetch(`/get_progress_data?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        console.error("Failed to fetch progress data");
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(`/get_leaderboard_data`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        console.error("Failed to fetch leaderboard data");
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 3, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h5">Progress Tracking</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', marginBottom: 2 }}>
          Track your journey and see how you improve over time!
        </Typography>
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" />
              <Line type="monotone" dataKey="caloriesBurned" stroke="#82ca9d" />
              <Line type="monotone" dataKey="caloriesConsumed" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
            No progress data available. Start tracking your workouts and meals!
          </Typography>
        )}
      </Paper>

      <Paper sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant="h5">Leaderboard</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', marginBottom: 2 }}>
          See how you rank among others!
        </Typography>
        {leaderboardData.length > 0 ? (
          <Box>
            {leaderboardData.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <Typography variant="body1">{index + 1}. {entry.name}</Typography>
                <Typography variant="body1">Calories Burned: {entry.caloriesBurned}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
            No leaderboard data available. Start competing with others!
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Progress;
