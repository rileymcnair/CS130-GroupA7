import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import { act } from "react";

// Mock the useAuth hook
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Login Component", () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock the return value of the useAuth hook
    require("../context/AuthContext").useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false, // Simulate the user not being authenticated
    });

    // Mock useNavigate
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  test("renders login form with email and password fields", () => {
    renderLogin();

    // Check for form elements
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  test("allows typing in email and password fields", () => {
    renderLogin();

    // Simulate user typing in the email and password fields
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Verify the values
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

// LIKELY LEAVE THE ACTUAL LOGIN PART FOR E2E TESTS
//   test("calls login function and navigates on successful login", async () => {
//     // Mock the login function to resolve
//     mockLogin.mockResolvedValueOnce();

//     // Simulate the user being authenticated after login
//     require("../context/AuthContext").useAuth.mockReturnValue({
//       login: mockLogin,
//       isAuthenticated: true,
//     });

//     renderLogin();
    
//     const emailInput = screen.getByPlaceholderText("Email");
//     const passwordInput = screen.getByPlaceholderText("Password");
//     const loginButton = screen.getByRole("button", { name: /login/i });
    
//     // Simulate user interaction
//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });
//     await act(() => {
//       fireEvent.click(loginButton);
//     });
//       // Assert that the login function was called with correct arguments
//       expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      
//       // Assert that the navigate function was called with "/home"
//       // NOTE IT REQUIRES A LOT MORE SETUP TO TEST WITH BACKEND
//     //   expect(mockNavigate).toHaveBeenCalledWith("/home");
//   });

//   test("shows an error when login fails", async () => {
//     // Simulate login failure
//     mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

//     renderLogin();

//     const emailInput = screen.getByPlaceholderText("Email");
//     const passwordInput = screen.getByPlaceholderText("Password");
//     const loginButton = screen.getByRole("button", { name: /login/i });

//     // Simulate user interaction
//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
//     fireEvent.click(loginButton);

//     // Since this is a basic console error log, you can verify the function is called
//     // But in production, you may want to update the UI to display an error message
//     expect(mockLogin).toHaveBeenCalledWith("test@example.com", "wrongpassword");
//     // Navigation should not be called
//     expect(mockNavigate).not.toHaveBeenCalled();
//   });
});
