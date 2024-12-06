import nodemailer from 'nodemailer';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * A component that sends a weekly summary email to the user, containing their fitness progress.
 * The email is sent automatically when the user's email is available.
 */
const WeeklySummaryEmail = () => {
  const { user } = useAuth(); // Get the current user from the AuthContext

  /**
   * useEffect hook that triggers the weekly summary email sending when the user is available.
   * It runs once when the component mounts and when the user changes.
   */
  useEffect(() => {
    if (user?.email) {
      sendWeeklySummaryEmail(user.email); // Call function to send email with weekly summary
    }
  }, [user]); // Depend on user, triggering the effect when the user object changes

  /**
   * Sends the weekly summary email to the specified email address.
   * Fetches summary data and then sends the email.
   * @param {string} email - The user's email address to send the summary to.
   */
  const sendWeeklySummaryEmail = async (email) => {
    try {
      // Fetch the weekly summary data for the user
      const response = await fetch(`/get_weekly_summary_data?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        await sendEmail(email, data); // Send the email with the fetched data
      } else {
        console.error('Failed to fetch weekly summary data');
      }
    } catch (error) {
      console.error('Error fetching weekly summary data:', error);
    }
  };

  /**
   * Sends an email with the user's weekly fitness summary.
   * @param {string} recipientEmail - The email address of the recipient.
   * @param {Object} summaryData - The data to be included in the email.
   * @param {string} summaryData.name - The user's name.
   * @param {number} summaryData.weight - The user's weight.
   * @param {number} summaryData.caloriesBurned - The total calories burned.
   * @param {number} summaryData.caloriesConsumed - The total calories consumed.
   */
  const sendEmail = async (recipientEmail, summaryData) => {
    try {
      // Create transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail's SMTP service
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password or app password
        },
      });

      // Define email options
      const mailOptions = {
        from: 'no-reply@fitnessapp.com', // Sender email address
        to: recipientEmail, // Recipient email address
        subject: 'Your Weekly Fitness Summary', // Email subject
        text: `Hello ${summaryData.name},

Here is your weekly fitness summary:

- Weight: ${summaryData.weight} kg
- Calories Burned: ${summaryData.caloriesBurned}
- Calories Consumed: ${summaryData.caloriesConsumed}

Keep up the great work and continue your journey towards your goals!

The Fitness App Team`, // Email body text
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Weekly summary email sent successfully');
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
    }
  };

  return null; // The component does not render anything
};

export default WeeklySummaryEmail;
