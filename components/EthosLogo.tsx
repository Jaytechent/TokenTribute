
import React from 'react';

const EthosLogo: React.FC = () => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
      
      {/* 3D-ish Logo Simulation */}
      <div className="animate-rotate-3d">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" stroke="#00D1FF" strokeWidth="2" />
          <path d="M50 20L75 32V68L50 80L25 68V32L50 20Z" fill="#00D1FF" fillOpacity="0.2" stroke="#00D1FF" strokeWidth="1" />
          <text x="50" y="62" textAnchor="middle" fill="#00D1FF" className="font-azeera text-2xl font-bold">T</text>
        </svg>
      </div>
    </div>
  );
};

export default EthosLogo;
