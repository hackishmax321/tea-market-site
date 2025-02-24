import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement, // Import PointElement
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import axios from "axios";
import TwitterPostAnalysisChart from "./TwiterPostsAnalysis";
import FacebookPostAnalysisChart from "./FacebookPostsAnalysis";
import InstagramPostAnalysisChart from "./InstagramPostsAnalysis";
import Env from "../../data/Env";

// Registering necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement, 
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TrendAnalysisChart = () => {
  const [trendData, setTrendData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("Facebook");

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(Env.BACKEND+"/get-google-trends-dates", {
          topics: ["Green Tea", "Black Tea", "White Tea"],
        });
        console.log(response.data)
        setTrendData(response.data.trend_data);
      } catch (error) {
        console.error("Error fetching Google Trends data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  // Prepare data for Line Chart
  const lineChartData = {
    labels: trendData["dates"] || [],
    datasets: [
      {
        label: "Green Tea",
        data: trendData["Green Tea"] || [],
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Black Tea",
        data: trendData["Black Tea"] || [],
        borderColor: "black",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "White Tea",
        data: trendData["White Tea"] || [],
        borderColor: "yellow",
        backgroundColor: "rgba(255, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for Pie Chart (This Year Summary)
  const thisYearData = {
    labels: ["Green Tea", "Black Tea", "White Tea"],
    datasets: [
      {
        data: [
          trendData["Green Tea"] ? trendData["Green Tea"][trendData["Green Tea"].length - 1] : 0,
          trendData["Black Tea"] ? trendData["Black Tea"][trendData["Black Tea"].length - 1] : 0,
          trendData["White Tea"] ? trendData["White Tea"][trendData["White Tea"].length - 1] : 0,
        ],
        backgroundColor: ["green", "black", "yellow"],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
        },
      },
      title: {
        display: true,
        text: `Google Trends Data for Tea Types Over 5 Years`,
        color: "#333",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#333",
        },
        title: {
          display: true,
          text: "Year",
          color: "#333",
        },
      },
      y: {
        ticks: {
          color: "#333",
        },
        title: {
          display: true,
          text: "Interest",
          color: "#333",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart">
      {/* <div className="cardHeader">
        <h2 style={{ textAlign: "center" }}>Tea Types Trends</h2>
      </div> */}

      {/* Line Chart */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        {/* Line Chart (75%) */}
        <div className="chartContainer" style={{ flex: "3", marginBottom: "20px" }}>
          {loading ? (
            <img 
            src={`${process.env.PUBLIC_URL}/animations/loading_screen.gif`} 
            className="blog-image" 
            style={{ 
              width: "250px", 
              height: "250px", 
              objectFit: "contain", 
              display: "block", 
              margin: "auto" 
            }} 
          />
          ) : (
            <Line data={lineChartData} options={options} />
          )}
        </div>

        {/* Pie Chart (25%) */}
        <div style={{ flex: "1", textAlign: "center", marginTop: "40px" }}>
          <h3>This Year Summary</h3>
          <Pie data={thisYearData} />
        </div>
      </div>

      

      {/* Make as a Tabmenu section */}
      <div style={{ textAlign: "center", marginTop: "50px", marginBottom: "20px", display: 'flex' }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 20px",
            margin: "10px",
            cursor: "pointer",
            backgroundColor: selectedType === "Facebook" ? "#007bff" : "#f0f0f0",
            color: selectedType === "Facebook" ? "#fff" : "#333",
            borderRadius: "25px",
            fontWeight: "bold",
            boxShadow: selectedType === "Facebook" ? "0px 4px 10px rgba(0, 123, 255, 0.5)" : "none",
            transition: "all 0.3s ease",
            padding: "12px 25px",
            margin: "0 10px",
          }}
          onClick={() => handleTypeChange("Facebook")}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007bff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = selectedType === "Facebook" ? "#007bff" : "#f0f0f0")}
        >
          Facebook
        </div>
        <div
          style={{
            padding: "12px 25px",
            margin: "0 10px",
            cursor: "pointer",
            backgroundColor: selectedType === "Instagram" ? "#007bff" : "#f0f0f0",
            color: selectedType === "Instagram" ? "#fff" : "#333",
            borderRadius: "25px",
            fontWeight: "bold",
            boxShadow: selectedType === "Instagram" ? "0px 4px 10px rgba(0, 123, 255, 0.5)" : "none",
            transition: "all 0.3s ease",
          }}
          onClick={() => handleTypeChange("Instagram")}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007bff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = selectedType === "Instagram" ? "#007bff" : "#f0f0f0")}
        >
          Instagram
        </div>
        {/* <div
          style={{
            padding: "12px 25px",
            margin: "0 10px",
            cursor: "pointer",
            backgroundColor: selectedType === "Twitter/X" ? "#007bff" : "#f0f0f0",
            color: selectedType === "Twitter/X" ? "#fff" : "#333",
            borderRadius: "25px",
            fontWeight: "bold",
            boxShadow: selectedType === "Twitter/X" ? "0px 4px 10px rgba(0, 123, 255, 0.5)" : "none",
            transition: "all 0.3s ease",
          }}
          onClick={() => handleTypeChange("Twitter/X")}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007bff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = selectedType === "Twitter/X" ? "#007bff" : "#f0f0f0")}
        >
          Twitter/X
        </div> */}
      </div>


      {/* Conditional rendering based on selected type */}
      {selectedType === "Facebook" && <FacebookPostAnalysisChart />}
      {selectedType === "Instagram" && <InstagramPostAnalysisChart />}
      {/* {selectedType === "Twitter/X" && <TwitterPostAnalysisChart />} */}
    </div>
  );
};

export default TrendAnalysisChart;
