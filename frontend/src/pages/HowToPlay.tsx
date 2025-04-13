import React from "react";
import { useNavigate } from "react-router-dom";
import { PixelButton } from "components/PixelButton";

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl w-full mx-auto bg-gray-800/80 p-8 rounded-lg border-2 border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">How To Play</h1>
        
        <div className="text-gray-300 mb-8 space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-md">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">CONTROLS</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Arrow Keys: Move your character</li>
              <li>Space Bar: Place bombs</li>
            </ul>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-md">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">OBJECTIVE</h2>
            <p>Be the last player standing! Navigate the maze, avoid explosions, and use your bombs to eliminate other players.</p>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-md">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">POWER-UPS</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Extra Bomb: Increases the number of bombs you can place at once</li>
              <li>Bomb Range: Increases explosion range</li>
              <li>Speed Up: Increases your movement speed</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <PixelButton 
            variant="secondary" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
