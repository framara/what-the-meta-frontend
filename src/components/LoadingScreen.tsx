import React from 'react';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => (
  <div className="wow-loading-screen">
    <div className="wow-spinner" />
    <div className="wow-loading-text">Loading data from Azeroth...</div>
  </div>
);

export default LoadingScreen;
