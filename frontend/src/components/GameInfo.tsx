import React from 'react';
import { useGameStore } from 'utils/gameStore';

interface Props {}

export const GameInfo: React.FC<Props> = () => {
  const { playerLives, gameTime } = useGameStore();
  
  // Format time (seconds) to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex items-center">
        <span className="text-white font-bold mr-2">Lives:</span>
        {Array.from({ length: playerLives }).map((_, i) => (
          <span key={i} className="text-xl">❤️</span>
        ))}
      </div>
      
      <div className="bg-gray-700 px-4 py-2 rounded-md">
        <span className="text-yellow-400 font-mono font-bold">{formatTime(gameTime)}</span>
      </div>
    </div>
  );
};
