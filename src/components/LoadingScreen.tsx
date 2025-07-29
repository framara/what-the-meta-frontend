
import React, { useEffect, useState } from 'react';
import './styles/LoadingScreen.css';

const messages = [
  'Getting consumables ready',
  'Tank is preparing route',
  'Someone forgot to repair',
  'Ready check in progress',
  'Pull 10 and go',
  'Rogue, your key',
];

const getRandomMessage = () => messages[Math.floor(Math.random() * messages.length)];

const LoadingScreen: React.FC = () => {
  const [message, setMessage] = useState(getRandomMessage());

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(getRandomMessage());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wow-loading-screen">
      <div className="wow-spinner" />
      <div className="wow-loading-text">{message}</div>
    </div>
  );
};

export default LoadingScreen;
