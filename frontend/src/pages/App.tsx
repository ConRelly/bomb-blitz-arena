import React from "react";
import { useNavigate } from "react-router-dom";
import { GameLogo } from "components/GameLogo";
import { PixelButton } from "components/PixelButton";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden relative">
      {/* Pixel art background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-blue-400 rounded-full animate-pulse"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#ffffff11 1px, transparent 1px), linear-gradient(90deg, #ffffff11 1px, transparent 1px)', 
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <main className="container mx-auto px-4 py-8 z-10 text-center">
        <div className="max-w-3xl mx-auto bg-gray-800/80 p-8 rounded-lg border-2 border-gray-700 shadow-lg backdrop-blur-sm">
          {/* Game Logo */}
          <GameLogo size="large" />
          
          {/* Game Description */}
          <div className="mt-6 mb-8 text-gray-300">
            <p className="text-lg mb-2">Get ready for explosive action in this fast-paced battle arena!</p>
            <p>Navigate the maze, place bombs strategically, collect power-ups, and be the last player standing.</p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col space-y-4 mt-8 max-w-xs mx-auto">
            <PixelButton 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/Game')}
              className="w-full"
            >
              PLAY GAME
            </PixelButton>
            
            <PixelButton 
              variant="secondary" 
              size="md" 
              onClick={() => navigate('/HowToPlay')}
              className="w-full"
            >
              HOW TO PLAY
            </PixelButton>
            
            <PixelButton 
              variant="success" 
              size="md" 
              onClick={() => navigate('/Settings')}
              className="w-full"
            >
              SETTINGS
            </PixelButton>
            
            <PixelButton 
              variant="secondary" 
              size="md" 
              onClick={() => navigate('/Profile')}
              className="w-full"
            >
              PROFILE
            </PixelButton>
            
            <PixelButton 
              variant="primary" 
              size="md" 
              onClick={() => navigate('/Login')}
              className="w-full"
            >
              LOGIN
            </PixelButton>
          </div>

          {/* Footer */}
          <div className="mt-10 text-xs text-gray-500">
            <p>© 2025 BombBlitz Arena | Use arrow keys to move, Space to place bombs</p>
          </div>
        </div>
      </main>
    </div>
  );
}
