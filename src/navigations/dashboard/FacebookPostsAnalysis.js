import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Env from "../../data/Env";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const FacebookPostAnalysisChart = () => {
  const [postAnalysisData, setPostAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(
          Env.BACKEND+"/count_posts_by_year_facebook",
          {
            keywords: ["black_tea", "white_tea", "green_tea"],
          }
        );
        console.log(response.data);  // Log the response data
        setPostAnalysisData(response.data);
      } catch (error) {
        console.error("Error fetching Facebook post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, []);

  // Prepare data for Line Chart
  const chartLabels = Array.from(
    new Set([
      ...Object.keys(postAnalysisData["black_tea"] || {}),
      ...Object.keys(postAnalysisData["green_tea"] || {}),
      ...Object.keys(postAnalysisData["white_tea"] || {}),
    ])
  ).sort();

  const lineChartData = {
    labels: chartLabels, // x-axis labels: Years
    datasets: [
      {
        label: "Black Tea",
        data: chartLabels.map((year) => postAnalysisData["black_tea"]?.[year] || 0),
        borderColor: "black",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Green Tea",
        data: chartLabels.map((year) => postAnalysisData["green_tea"]?.[year] || 0),
        borderColor: "green",
        backgroundColor: "rgba(255, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "White Tea",
        data: chartLabels.map((year) => postAnalysisData["white_tea"]?.[year] || 0),
        borderColor: "yellow",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#333" },
      },
      title: {
        display: true,
        text: "Facebook Post Analysis by Year for Tea Types",
        color: "#333",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#333" },
        title: { display: true, text: "Year", color: "#333" },
      },
      y: {
        ticks: { color: "#333" },
        title: { display: true, text: "Number of Posts", color: "#333" },
        beginAtZero: true,
      },
    },
  };

  const generatePDF = async () => {
    const doc = new jsPDF("landscape");
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;

    logo.onload = () => {
      // Add logo and header
      doc.addImage(logo, "PNG", 10, 10, 50, 30);
      doc.setFontSize(22);
      doc.text("TeaVerse", 70, 20);
      doc.setFontSize(10);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
      doc.setFontSize(16);
      doc.text("Facebook Post Analysis Report", 10, 60);

      const chartElement = document.querySelector(".chartContainer2");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 120);

          doc.setFontSize(14);
          doc.text("Estimated Post Data Table", 10, 200);

          const tableData = [];
          Object.keys(postAnalysisData).forEach((teaType) => {
            Object.entries(postAnalysisData[teaType] || {}).forEach(([year, count]) => {
              tableData.push([teaType, year, count]);
            });
          });

          doc.autoTable({
            head: [["Tea Type", "Year", "Number of Posts"]],
            body: tableData,
            startY: 210,
          });

          doc.save("Facebook_Post_Analysis_Report.pdf");
        });
      }
    };
  };

  return (
    <div className="chart">
      <div className="cardHeader">
        <h2 style={{ textAlign: "center" }}>Facebook Post Analysis</h2>
      </div>
      <div className="chartContainer2">
        {loading ? (
          <img
            src={`${process.env.PUBLIC_URL}/animations/loading_screen.gif`}
            className="blog-image"
            style={{
              width: "250px",
              height: "250px",
              objectFit: "contain",
              display: "block",
              margin: "auto",
            }}
            alt="Loading"
          />
        ) : (
          <Line data={lineChartData} options={options} />
        )}
      </div>
      {!loading && (
        <button
          onClick={generatePDF}
          style={{
            display: "block",
            margin: "10px auto",
            padding: '10px 20px',
            backgroundColor: "#28a745",
            color: "#fff",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: 0.6,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'lightgreen';
            e.target.style.color = 'black';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'green';
            e.target.style.color = 'white';
          }}
        >
          Generate PDF
        </button>
      )}
    </div>
  );
};

export default FacebookPostAnalysisChart;
