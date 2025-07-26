
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

const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(idx => (idx + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wow-loading-screen">
      <div className="wow-spinner" />
      <div className="wow-loading-text">{messages[msgIdx]}</div>
    </div>
  );
};

export default LoadingScreen;
