import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GoldRatesChart = ({ goldDetails }) => {
  // Helper function to format the dates
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options); // "17 October 2024"
  };

  // Extracting and formatting dates and prices from goldDetails
  const dates = Object.keys(goldDetails.open_prices['GC=F']).map(formatDate);
  const openPrices = Object.values(goldDetails.open_prices['GC=F']);
  const highPrices = Object.values(goldDetails.high_prices['GC=F']);
  const lowPrices = Object.values(goldDetails.low_prices['GC=F']);

  // Chart data using goldDetails data
  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Gold Opening Price (USD)',
        data: openPrices,
        backgroundColor: '#f2c511',
        borderColor: '#ffe270',
        borderWidth: 1,
      },
      {
        label: 'Gold High Price (USD)',
        data: highPrices,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Gold Low Price (USD)',
        data: lowPrices,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Gold Price Details Over Time',
        color: '#333',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
        },
        title: {
          display: true,
          text: 'Dates',
          color: '#333',
        },
      },
      y: {
        ticks: {
          color: '#333',
        },
        title: {
          display: true,
          text: 'Gold Price (USD)',
          color: '#333',
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="chart">
      <div className="cardHeader">
        <h2>Recent Gold Price Details</h2>
        <a href="#" className="btn">View All</a>
      </div>
      <div className="chartContainer">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default GoldRatesChart;
