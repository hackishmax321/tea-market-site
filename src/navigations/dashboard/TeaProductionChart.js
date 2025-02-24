import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Env from '../../data/Env';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeaProductionChart = () => {
  const navigate = useNavigate();
  const defaultYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months 1-12
  const processingMethods = ["Orthodox", "CTC", "Green"];
  const [year, setYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedElevations, setSelectedElevations] = useState({
    Low: false,
    Medium: false,
    High: true
  });

  const [weatherData, setWeatherData] = useState([]);
  const cities = ['Kandy', 'Nuwara Eliya', 'Badulla', 'Galle'];

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      const weatherMap = {
        Low: weatherData.find(w => w.name === 'Galle'),
        Medium: weatherData.find(w => w.name === 'Kandy'),
        High: weatherData.find(w => w.name === 'Badulla')
      };
  
      const elevationRequests = Object.keys(selectedElevations)
        .filter(elevation => selectedElevations[elevation])
        .map(async (elevation) => {
          const weather = weatherMap[elevation] || { main: { temp: 25.0, humidity: 75.0 } }; // Default values if no match
  
          const monthRequests = months.map(async (month) => {
            const methodRequests = processingMethods.map(method =>
              axios.post(Env.BACKEND+'/predict-tea-production-weighted', {
                year: year,
                month,
                processing_method: method,
                elevation,
                production_total: 1500,
                inflation_rate: 300,
                temp_avg: weather.main.temp,
                rain: 200.0,
                humidity_day: weather.main.humidity,
                humidity_night: weather.main.humidity + 10 // Example assumption
              })
            );
  
            const responses = await Promise.all(methodRequests);
            return {
              month,
              data: responses.map((res, index) => ({
                method: processingMethods[index],
                estimated_quantity: res.data.predicted_tea_production
              }))
            };
          });
  
          const monthlyData = await Promise.all(monthRequests);
          return { elevation, monthlyData };
        });
  
      const data = await Promise.all(elevationRequests);
  
      // Formatting data for the chart
      const formattedData = {};
      data.forEach(({ elevation, monthlyData }) => {
        formattedData[elevation] = monthlyData;
      });
  
      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching tea production data:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchProductionData();
  }, [selectedElevations,  year]);

  const handleCheckboxChange = (elevation) => {
    setSelectedElevations((prev) => ({
      ...prev,
      [elevation]: !prev[elevation],
    }));
  };

  // Prepare data for the chart
  const labels = months.map(month => `${year}-${month}`);
  const datasets = Object.keys(chartData).flatMap((elevation, index) =>
    processingMethods.map((method, methodIndex) => ({
      label: `${elevation} - ${method}`,
      data: labels.map(monthLabel => {
        const month = parseInt(monthLabel.split('-')[1]);
        const monthData = chartData[elevation]?.find(data => data.month === month);
        // console.log(monthData)
        return monthData
          ? monthData.data.find(d => d.method === method)?.estimated_quantity || 0
          : 0;
      }),
      backgroundColor: `rgba(${50 + index * 50}, ${100 + methodIndex * 30}, 200, 0.6)`,
      borderColor: `rgba(${50 + index * 50}, ${100 + methodIndex * 30}, 200, 1)`,
      borderWidth: 1,
    }))
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Estimated Local Tea Demand by Elevation & Processing Method',
      },
    },
    scales: {
      x: { title: { display: true, text: 'Year - Month' } },
      y: { title: { display: true, text: 'Estimated Quantity (Kg)' }, beginAtZero: true },
    },
  };

  const generatePDF = async () => {
    const doc = new jsPDF("landscape"); // Use landscape mode for better table fit
  
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
  
    logo.onload = () => {
      // Add TeaVerse logo
      doc.addImage(logo, "PNG", 10, 10, 50, 30);
  
      // Add TeaVerse title
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("TeaVerse", 70, 20);
  
      // Add company details (small font)
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
  
      // Add horizontal line
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
  
      // Add Report Title
      doc.setFontSize(16);
      doc.text("Tea Local Production Release Report", 10, 60);
  
      // Capture the chart as an image
      const chartElement = document.querySelector(".chartContainer");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 120); // Adjust size for landscape layout
  
          // Add Table Title
          doc.setFontSize(14);
          doc.text("Estimated Production Data Table", 10, 200);
  
          // Prepare table data
          const tableData = [];
          Object.keys(chartData).forEach((elevation) => {
            chartData[elevation].forEach(({ month, data }) => {
              data.forEach(({ method, estimated_quantity }) => {
                tableData.push([
                  elevation,
                  `${year}-${String(month).padStart(2, "0")}`,
                  method,
                  estimated_quantity,
                ]);
              });
            });
          });
  
          // Add Table with autoTable
          doc.autoTable({
            head: [
              ["Elevation", "Year-Month", "Processing Method", "Estimated Quantity (Kg)"],
            ],
            body: tableData,
            startY: 210, // Ensure proper spacing after the chart
          });
  
          // Save the PDF
          doc.save("Tea_Production_Estimation_Report.pdf");
        });
      }
    };
  };

  const changeYear = (offset) => {
    setYear((prevYear) => prevYear + offset);
  };
  

  useEffect(() => {
    const fetchWeatherForCities = async () => {
      try {
        const responses = await Promise.all(
          cities.map(city =>
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=3ca1b71cf73d793ea485f6d257cedd49&units=metric`)
          )
        );
        console.log(responses)
        setWeatherData(responses.map(res => res.data));
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherForCities();
  }, []);

  return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row', width: '100%', }}>
      <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {/* Weather Update */}
        <img src={`${process.env.PUBLIC_URL}/images/tea-grown.png`} alt="Weather" style={{ width: '100%', height: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
            {weatherData.map((weather, index) => (
            <div key={index} className="weather-token" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', backgroundColor: '#6dedab', borderRadius: '10px' }}>
                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} height={45} alt="weather-icon" />
                <span style={{ fontWeight: 'bold' }}>{weather.name}</span>
                <div>
                    <small>Temperature</small>
                    <p>{weather.main.temp}°C</p>
                </div>
                <div>
                    <small>Humidity</small>
                    <p>{weather.main.humidity}%</p>
                </div>
                
            </div>
            ))}
        </div>
      </div>
      <div style={{ width: '75%', paddingLeft: '40px' }}>
        
        <div className="chartContainer">
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
            <Bar data={{ labels, datasets }} options={chartOptions} />
            )}
        </div>
        {/* <div className="checkboxContainer">
            <h3>Select Elevation Types:</h3>
            {Object.keys(selectedElevations).map((elevation) => (
            <label key={elevation} style={{ marginRight: '15px' }}>
                <input
                type="checkbox"
                checked={selectedElevations[elevation]}
                onChange={() => handleCheckboxChange(elevation)}
                />
                {elevation}
            </label>
            ))}
        </div> */}
        <div style={{display:'flex', justifyContent:'space-between'}}> 
                  <div className="checkboxContainer">
                    <h3>Select Elevation Types:</h3>
                    {Object.keys(selectedElevations).map((elevation) => (
                      <label key={elevation} style={{ marginRight: "15px" }}>
                        <input type="checkbox" checked={selectedElevations[elevation]} onChange={() => handleCheckboxChange(elevation)} />
                        {elevation}
                      </label>
                    ))}
                    
                  </div>
                  <div>
                      <button style={{ marginLeft: "10px", borderRadius: "50%", padding: "5px", fontSize: '20px' }} onClick={() => changeYear(-1)}><FaArrowLeft /></button>
                      <span style={{ margin: "0 20px", fontSize: "1.2rem", fontWeight: "bold" }}>{year}</span>
                      <button style={{ marginLeft: "10px", borderRadius: "50%", padding: "5px", fontSize: '20px' }} onClick={() => changeYear(1)}><FaArrowRight /></button>
                  </div>
        </div>
        <div style={{ marginTop: '20px' }}>
            <button onClick={generatePDF} style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                marginTop: '20px', 
                backgroundColor: 'green', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                transition: '0.3s',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'lightgreen';
                e.target.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'green';
                e.target.style.color = 'white';
              }}>
            Generate PDF Report
            </button>
            <button onClick={() => {
              navigate('/tea-types-whole')
            }} style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                marginTop: '20px', 
                marginLeft: '20px',
                backgroundColor: '#2980b9', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                transition: '0.3s',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.color = 'white';
              }}>
            Whole Production Chart
            </button>
        </div>
      </div>
    </div>
  );
};

export default TeaProductionChart;
