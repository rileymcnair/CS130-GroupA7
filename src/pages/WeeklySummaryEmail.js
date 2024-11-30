import nodemailer from 'nodemailer';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const WeeklySummaryEmail = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      sendWeeklySummaryEmail(user.email);
    }
  }, [user]);

  const sendWeeklySummaryEmail = async (email) => {
    try {
      // Fetch progress data to include in the email
      const response = await fetch(`/get_weekly_summary_data?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        await sendEmail(email, data);
      } else {
        console.error('Failed to fetch weekly summary data');
      }
    } catch (error) {
      console.error('Error fetching weekly summary data:', error);
    }
  };

  const sendEmail = async (recipientEmail, summaryData) => {
    try {
      // Create transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password or app password
        },
      });

      // Define email options
      const mailOptions = {
        from: 'no-reply@fitnessapp.com',
        to: recipientEmail,
        subject: 'Your Weekly Fitness Summary',
        text: `Hello ${summaryData.name},

Here is your weekly fitness summary:

- Weight: ${summaryData.weight} kg
- Calories Burned: ${summaryData.caloriesBurned}
- Calories Consumed: ${summaryData.caloriesConsumed}

Keep up the great work and continue your journey towards your goals!

The Fitness App Team`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Weekly summary email sent successfully');
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
    }
  };

  return null;
};

export default WeeklySummaryEmail;