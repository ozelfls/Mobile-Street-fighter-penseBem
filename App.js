import React, { useState } from 'react';
import Home from './Home';
import Game from './Game';

export default function App() {
  const [screen, setScreen] = useState('home');
  if (screen === 'home') return <Home onSelect={setScreen} />;
  return <Game key={screen} mode={screen} onExit={() => setScreen('home')} />;
}
