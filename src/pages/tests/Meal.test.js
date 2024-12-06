import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Meal from "../Meal"; 
import { AuthContext } from "../../context/AuthContext"; 

jest.mock("../../components/meal/MealDialog", () => () => <div>MealDialog Mock</div>);
jest.mock("../../components/meal/MealCard", () => () => <div>MealCard Mock</div>);

describe("Meal Component", () => {
  const mockUser = { email: "test@example.com" };

  it("renders AI-Generated Meal Suggestions header", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Meal />
      </AuthContext.Provider>
    );

    expect(screen.getByText("AI-Generated Meal Suggestions")).toBeInTheDocument();
    expect(screen.getByText("Generate Meal")).toBeInTheDocument();
  });

  it("renders 'Your Favorited Meals' section when there are no meals", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Meal />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Your Favorited Meals")).toBeInTheDocument();
    expect(screen.getByText("Your meal list is looking a bit empty")).toBeInTheDocument();
  });

  it("renders 'Meals From Other Users' section when no meals exist", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Meal />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Meals From Other Users")).toBeInTheDocument();
    expect(screen.getByText("Explore meals shared by others to discover new ideas and stay inspired.")).toBeInTheDocument();
    expect(screen.getByText("No saved meals yet.")).toBeInTheDocument();
  });

  it("renders MealDialog when open", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Meal />
      </AuthContext.Provider>
    );

    expect(screen.getByText("MealDialog Mock")).toBeInTheDocument();
  });

  it("renders MealCard components for favorited meals", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Meal />
      </AuthContext.Provider>
    );

    expect(screen.getByText("MealCard Mock")).toBeInTheDocument();
  });
});
