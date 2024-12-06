import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Workout from "../Workout"; 
import { AuthContext } from "../../context/AuthContext"; // Mock AuthContext

jest.mock("../../components/workout/WorkoutDialog", () => () => <div>WorkoutDialog Mock</div>);
jest.mock("../../components/workout/WorkoutCard", () => () => <div>WorkoutCard Mock</div>);

describe("Workout Component", () => {
  const mockUser = { email: "test@example.com" };

  it("renders AI-Generated Workouts section", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Workout />
      </AuthContext.Provider>
    );

    expect(screen.getByText("AI-Generated Workouts")).toBeInTheDocument();
    expect(screen.getByText("Generate Workout")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Provide your workout goals, time availability, or focus areas, and let AI create personalized workout plans for you."
      )
    ).toBeInTheDocument();
  });

  it("renders 'Your Favorited Workouts' section when there are no workouts", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Workout />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Your Favorited Workouts")).toBeInTheDocument();
    expect(
      screen.getByText("Your workout list is looking a bit empty")
    ).toBeInTheDocument();
  });

  it("renders 'Workouts From Other Users' section when no workouts exist", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Workout />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Workouts From Other Users")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore workouts shared by others to discover new ideas and stay inspired."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("No saved workouts yet.")).toBeInTheDocument();
  });

  it("renders WorkoutDialog when open", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Workout />
      </AuthContext.Provider>
    );

    expect(screen.getByText("WorkoutDialog Mock")).toBeInTheDocument();
  });

  it("renders WorkoutCard components for favorited workouts", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Workout />
      </AuthContext.Provider>
    );

    expect(screen.getByText("WorkoutCard Mock")).toBeInTheDocument();
  });
});
