import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('renders login page with form elements', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login'); // Ensure this matches your route

    // Check for the presence of form elements
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
  });

  test('allows user to log in with valid credentials', async ({ page }) => {
    // Mock backend API response
    await page.route('**/api/login', async (route) => {
      const request = route.request();
      const requestBody = JSON.parse(request.postData());
      
      if (requestBody.email === 'test@example.com' && requestBody.password === 'password123') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Login successful' }),
        });
      } else {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    });

    // Navigate to the login page
    await page.goto('/login');

    // Type in email and password
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert successful navigation to the home page
    await expect(page).toHaveURL('/home');
  });

//   test('displays an error for invalid credentials', async ({ page }) => {
//     // Mock backend API response for invalid credentials
//     await page.route('**/api/login', async (route) => {
//       route.fulfill({
//         status: 401,
//         body: JSON.stringify({ message: 'Invalid credentials' }),
//       });
//     });

//     // Navigate to the login page
//     await page.goto('/login');

//     // Type in email and password
//     await page.fill('input[placeholder="Email"]', 'wrong@example.com');
//     await page.fill('input[placeholder="Password"]', 'wrongpassword');

//     // Submit the form
//     await page.click('button[type="submit"]');

//     // Assert error message is displayed (replace this with your actual error handling)
//     const consoleLogs = [];
//     page.on('console', (msg) => consoleLogs.push(msg.text()));

//     // Check if the error was logged
//     expect(consoleLogs).toContain('Failed to log in');
//   });
});
