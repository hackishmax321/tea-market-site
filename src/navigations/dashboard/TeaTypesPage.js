// pages/TeaTypesPage.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import TeaProductionChart from './TeaProductionChart';

const TeaTypesPage = () => {
      const [isAdmin, setIsAdmin] = useState(false);
    
      useEffect(() => {
        const userRole = localStorage.getItem('userRole'); 
        setIsAdmin(userRole === 'admin');
      }, []);

  return (
    <div className="dashContainer">
      {isAdmin && <Sidebar />}
      <div className={`main ${!isAdmin ? 'full-width' : ''}`}>
        <Topbar />
        
        <div className="details">
          <h2>Tea Local Market Release Quantity Prediction</h2>
          <TeaProductionChart />
          {/* <TypesChart /> */}
          {/* <PredictionSummary goldDetails={goldDetails}/> */}
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default TeaTypesPage;
