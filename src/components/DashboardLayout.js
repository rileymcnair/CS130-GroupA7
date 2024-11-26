import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
          backgroundColor: "#f3f9f3",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
