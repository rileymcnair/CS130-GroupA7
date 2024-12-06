import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../Dashboard";
import { AuthContext } from "../../context/AuthContext"; // Mock AuthContext

// Mock child components
jest.mock("react-calendar", () => () => <div>Calendar Mock</div>);
jest.mock("../../components/workout/CompactWorkoutCard", () => () => <div>CompactWorkoutCard Mock</div>);
jest.mock("../../components/meal/CompactMealCard", () => () => <div>CompactMealCard Mock</div>);
jest.mock("../../components/dashboard/DailyStatsCard", () => () => <div>DailyStatsCard Mock</div>);
jest.mock("../../components/workout/WorkoutListCard", () => () => <div>WorkoutListCard Mock</div>);
jest.mock("../../components/meal/MealListCard", () => () => <div>MealListCard Mock</div>);

describe("Dashboard Component", () => {
  const mockUser = { email: "test@example.com", uid: "12345" };

  it("renders the calendar section", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Calendar Mock")).toBeInTheDocument();
  });

  it("renders the DailyStatsCard section", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText("DailyStatsCard Mock")).toBeInTheDocument();
  });

  it("renders the workout and meal list sections", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText("WorkoutListCard Mock")).toBeInTheDocument();
    expect(screen.getByText("MealListCard Mock")).toBeInTheDocument();
  });
});
