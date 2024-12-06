import React from "react";
import { Typography, Box } from "@mui/material";

/**
 * Home component that renders the main heading for the dashboard.
 * It serves as the entry point or landing page for the user.
 * 
 * @component
 * @example
 * return (
 *   <Home />
 * )
 */
function Home() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
    </Box>
  );
}

export default Home;
