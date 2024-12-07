import React from "react";
import { Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

// Utility function to format date for ICS file as an all-day event
const formatAllDayDate = (date) => {
  // Create a date object and convert to YYYYMMDD format without time
  const d = new Date(date);
  return d.toISOString().split("T")[0].replace(/-/g, "");
};

const formatDescription = (desc) => {
  if (!desc) return "";

  let res = "";
  for (let [key, value] of Object.entries(desc)) {
    //console.log(key)
    const reservedKeys = new Set(["name", "type", "date"]);
    if (reservedKeys.has(key)) continue;
    if (Array.isArray(value)) {
      value = value.join(", "); // comma separated list
    }
    res += `${key}: ${value}\\n`;
  }
  return res;
};

const GenerateCalendarFile = () => {
  const { user } = useAuth();
  const handleDownloadFile = async () => {
    try {
      const response = await fetch("/historical_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      console.log(`calendarData: ${JSON.stringify(data)}`);
      generateICSFile(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  const generateICSFile = (calendarDataArr) => {
    // Create ICS file content
    let icsContent = "BEGIN:VCALENDAR\n";
    icsContent += "VERSION:2.0\n";
    icsContent += "PRODID:-//Health Tracker//Daily Activities//EN\n";

    calendarDataArr.forEach((activity) => {
      icsContent += "BEGIN:VEVENT\n";

      // Use DTSTART and DTEND with VALUE=DATE to create all-day events
      const eventDate = formatAllDayDate(activity.date);
      icsContent += `DTSTART;VALUE=DATE:${eventDate}\n`;
      icsContent += `DTEND;VALUE=DATE:${eventDate}\n`;

      icsContent += `SUMMARY:${activity.type}: ${activity.name}\n`;
      icsContent += `DESCRIPTION:${formatDescription(activity)}\n`;
      icsContent += `DTSTAMP:${formatAllDayDate(activity.date)}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    // Create and trigger file download
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "daily_activities.ics";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button onClick={handleDownloadFile} className="mt-4">
      Download Calendar
    </Button>
  );
};

export default GenerateCalendarFile;
