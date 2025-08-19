import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddGameForm from "./pages/AddGameForm.jsx";
import Navigation from "./components/Navigation/Navigation.jsx";
import { Hero } from './components/Hero/Hero.jsx';
import Metrics from './pages/Metrics.jsx';
import { GameMetaProvider } from './contexts/GameMetaProvider';
import PlayerPage from './pages/PlayerPage.jsx';
import './App.css';
function App() {

  return (
    <div>
        <GameMetaProvider>
        <BrowserRouter>
          <Navigation/>
            <Routes>
              <Route path="/" element={<Hero/>} />
              <Route path="/AddGameForm" element={<AddGameForm />}/>
              <Route path="/Metrics" element={<Metrics/>}/>
              <Route path="/Metrics/:name" element={<PlayerPage/>}/>
            </Routes>
        </BrowserRouter>
        </GameMetaProvider>
    </div>
  );
}

export default App;
