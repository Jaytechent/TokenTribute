import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import DonatePage from './pages/DonatePages';
import GuidePage from './pages/GuidePage';

const App: React.FC = () => {


    
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donate/:username" element={<DonatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </Router>
  );
};

export default App;
