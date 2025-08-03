import React from 'react';
import './styles/AILoadingScreen.css';

const robotMessages = [
  '🔮 Predicting the meta with quantum precision...',
  '⚡ Processing 10,000+ dungeon runs in parallel...',
  '🧠 Neural networks analyzing spec evolution patterns...',
  '📊 Cross-validating predictions across all seasons...',
  '🎯 Identifying rising stars in the meta...',
  '📈 Detecting subtle trend shifts in real-time...',
  '🔍 Deep-diving into class performance analytics...',
  '⚔️ Mapping the competitive landscape...',
  '🎮 Analyzing player behavior patterns...',
  '📋 Synthesizing comprehensive meta insights...',
  '🚀 Optimizing prediction algorithms...',
  '🎲 Running Monte Carlo simulations...',
  '📊 Validating statistical significance...',
  '🔬 Conducting meta analysis research...',
  '⚡ Charging prediction engines to full capacity...',
  '🎯 Fine-tuning accuracy parameters...',
  '📈 Processing temporal trend data...',
  '🧮 Calculating confidence intervals...',
  '🎮 Mining competitive intelligence...',
  '🔮 Unveiling the future of Mythic+ meta...'  
];

export const AILoadingScreen: React.FC = () => {
  const [message, setMessage] = React.useState(robotMessages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(robotMessages[Math.floor(Math.random() * robotMessages.length)]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-loading-screen">
      <div className="robot-emoji" role="img" aria-label="Robot" style={{ fontSize: '5rem', animation: 'bounce-robot 1.5s infinite' }}>🤖</div>
      <div className="ai-loading-message">{message}</div>
    </div>
  );
};

export default AILoadingScreen;
