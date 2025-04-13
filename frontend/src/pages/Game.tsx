import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameBoard } from "components/GameBoard";
import { GameControls } from "components/GameControls";
import { GameInfo } from "components/GameInfo";
import { GameInstructions } from "components/GameInstructions";
import { useGameStore } from "utils/gameStore";
import { initAudio } from "utils/audioManager";

export default function Game() {
  const navigate = useNavigate();
  const { generateBoard, resetGame } = useGameStore();
  
  // Initialize the game board when component mounts
  useEffect(() => {
    const newBoard = generateBoard();
    resetGame();
    return () => resetGame(); // Cleanup when unmounting
  }, [generateBoard, resetGame]);
  
  // Initialize audio when game loads
  useEffect(() => {
    initAudio();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-4">BombBlitz Arena</h1>
        
        {/* Game info bar (lives, time) */}
        <GameInfo />
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main game board */}
          <div className="flex-1">
            <GameBoard className="mx-auto" />
          </div>
          
          {/* Game sidebar */}
          <div className="w-full lg:w-64 space-y-6">
            <GameInstructions />
            
            <GameControls onExit={() => navigate('/')} />
          </div>
        </div>
      </div>
    </div>
  );
}
