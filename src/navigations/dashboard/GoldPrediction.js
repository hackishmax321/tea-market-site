// pages/GoldPrediction.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Card from '../../components/cards/Card';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import Env from '../../data/Env';
import GoldRatesChart from './GoldRates.chart';
import VolumeList from './Volumes.list';
import PredictionSummary from './Prediction.summary';

const GoldPrediction = () => {
  const [goldDetails, setGoldDetails] = useState(null);
  const [goldStats, setGoldStats] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  

  useEffect(() => {
    const fetchGoldDetails = async () => {
      try {
        const response = await fetch(Env.BACKEND+'/gold-details');
        if (!response.ok) throw new Error('Failed to fetch gold details');
        const data = await response.json();
        console.log(data.gold_details);
        setGoldDetails(data.gold_details);
        setGoldStats(data.statistics);
      } catch (error) {
        console.error('Error fetching gold details:', error);
      }
    };
    
    fetchGoldDetails();
  }, []);

  return (
    <div className="dashContainer">
      <Sidebar />
      <div className="main">
        <Topbar />
        
        <div className="details">
          {/* <h2>Gold Price Details</h2> */}
          {goldDetails&&<GoldRatesChart goldDetails={goldDetails}/>}
          {goldDetails&&<PredictionSummary goldDetails={goldDetails}/>}
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default GoldPrediction;
