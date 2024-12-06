import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "../Profile";

// Mock AuthContext
jest.mock("../../context/AuthContext", () => {
  const AuthContext = require("react").createContext();
  return { AuthContext };
});

describe("Profile Component", () => {
  it("renders loading message when user is not available", () => {
    const { AuthContext } = require("../../context/AuthContext");

    render(
      <AuthContext.Provider value={{ user: null }}>
        <Profile />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the Profile component when the user is available", () => {
    const { AuthContext } = require("../../context/AuthContext");

    const mockUser = { email: "test@example.com" };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Profile />
      </AuthContext.Provider>
    );

    expect(screen.getByText("ProfileForm Mock")).toBeInTheDocument();
  });
});
