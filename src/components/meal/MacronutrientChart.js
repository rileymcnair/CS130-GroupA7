import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MacronutrientChart = ({ proteins, carbs, fats, calories }) => {
  const totalMacros = proteins + carbs + fats;

  // Doughnut chart data
  const data = {
    labels: ["Carbs", "Fats", "Proteins"],
    datasets: [
      {
        data: [ fats, carbs, proteins],
        backgroundColor: [ "#1abc9c", "#3498db", "#9b59b6"], // Custom colors
        hoverBackgroundColor: ["#1abc9c", "#3498db","#9b59b6"], // Same colors for hover
        borderWidth: 2
      }
    ]
  };

  // Chart options with custom center text and percentage labels
  const options = {
    plugins: {
      legend: {
        display: false,
        position: "right",
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            const label = tooltipItem.label;
            return `${label}: ${value}g`;
          }
        }
      }
    },
    cutout: "75%", // Creates the doughnut effect
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    elements: {
      center: {
        text: `${calories} kcal`,
        color: "#000", // Black text
        fontStyle: "Arial", // Default font
        sidePadding: 20, // Adds padding for text
        minFontSize: 14, // Minimum font size
        lineHeight: 25 // Text line height
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Custom center text plugin
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width } = chart;
      const { height } = chart;
      const { ctx } = chart;
      // const text = `${calories} cal`;
      // const subText = `${totalMacros}g`;
      const text = ``;
      const subText = ``;

      // Draw calories (main text)
      ctx.restore();
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = "#000"; // Black
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.fillText(text, centerX, centerY - 10);

      // Draw total grams (sub-text)
      ctx.font = "normal 14px Arial";
      ctx.fillStyle = "gray"; // Gray
      ctx.fillText(subText, centerX, centerY + 15);
      ctx.save();
    }
  };

  return (
    <div style={{ width: "100px", height: "100px" }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default MacronutrientChart;
