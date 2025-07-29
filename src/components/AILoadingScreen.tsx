import React from 'react';
import './styles/AILoadingScreen.css';

const robotMessages = [
  'Bip bop... crunching meta-data!',
  'Calculating the future... please wait!',
  'Bzzzt! Analyzing dungeons...',
  '01001000 01101000! (Hi!)',
  'Charging AI batteries...',
  'Bip bop beep... fetching predictions!',
  'Synthesizing meta trends...',
  'Beep beep! Downloading more RAM...',
  'Loading up some spicy affixes...',
  'Bop! Did you know robots love statistics?',
  'Bip bop... calibrating funniness sensors!',
  'Bzzzt! Please do not feed the robot.',
  'Bip bop... looking for the meta cheese!',
  'One moment, my circuits are stretching...',
  'Bip bop... is this thing on?',
  'Bip bop... 42% more fun guaranteed!',
  'Bip bop... running on coffee and code!',
  'Bop bip! I see you, human!',
  'Bip bop... almost there, don’t panic!'
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
