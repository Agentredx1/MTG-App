import { useState, useEffect } from 'react';
import { Hero } from './components/Hero.jsx';
import './App.css';
import AddGameForm from './components/AddGameForm.jsx';
function App() {

  return (
    <div>
        <Hero></Hero>
        <AddGameForm></AddGameForm>
    </div>
  );
}

export default App;
