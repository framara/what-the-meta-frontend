
import React, { useEffect, useState } from 'react';
import './styles/LoadingScreen.css';

const messages = [
  'Checking group buffs',
  'Tank is preparing route',
  'Someone forgot to repair',
  'Ready check in progress',
  'Pull 10 and go',
  'Rogue, your key',
  'Leeeeeroy Jenkins!',
  'Oh shit, raid talents',
  'PI on me, please',
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
