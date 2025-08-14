import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddGameForm from "./pages/AddGameForm.jsx";
import Navigation from "./components/Navigation.jsx";
import { Hero } from './components/Hero.jsx';
import './App.css';
function App() {

  return (
    <div>
        <BrowserRouter>
          <Navigation/>
            <Routes>
              <Route path="/" element={<Hero/>} />
              <Route path="/AddGameForm" element={<AddGameForm />} />
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
