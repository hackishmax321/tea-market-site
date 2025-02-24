import React, { useState } from 'react';
import axios from 'axios';
import Env from '../../data/Env';

const PredictionSummary = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    SPX: '',
    USO: '',
    SLV: '',
    EUR_USD: ''
  });

  // State for prediction result
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the API
      const response = await axios.post(Env.BACKEND+'/predict-gld', {
        SPX: parseFloat(formData.SPX),
        USO: parseFloat(formData.USO),
        SLV: parseFloat(formData.SLV),
        EUR_USD: parseFloat(formData.EUR_USD)
      });

      // Update the prediction state
      setPrediction(response.data.predicted_GLD);
      setError(null); // Clear any previous errors
    } catch (err) {
      setPrediction(null); // Clear previous prediction
      setError('Prediction failed. Please try again.');
    }
  };

  return (
    <div className="container-list">
      <div className="cardHeader">
        <h2>Predict GLD Value</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>SPX:</label>
          <input
            type="number"
            name="SPX"
            value={formData.SPX}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>USO:</label>
          <input
            type="number"
            name="USO"
            value={formData.USO}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>SLV:</label>
          <input
            type="number"
            name="SLV"
            value={formData.SLV}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>EUR/USD:</label>
          <input
            type="number"
            name="EUR_USD"
            value={formData.EUR_USD}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn">Predict</button>
      </form>

      {prediction && (
        <div className="result">
          <h3>Predicted GLD Value: {prediction.toFixed(2)}</h3>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default PredictionSummary;
