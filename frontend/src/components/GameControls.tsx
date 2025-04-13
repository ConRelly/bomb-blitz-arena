import React from 'react';
import { useGameStore } from 'utils/gameStore';
import { PixelButton } from './PixelButton';

interface Props {
  onExit: () => void;
}

export const GameControls: React.FC<Props> = ({ onExit }) => {
  const { 
    isGameRunning, 
    startGame, 
    stopGame, 
    resetGame 
  } = useGameStore();

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {isGameRunning ? (
        <PixelButton 
          variant="secondary" 
          size="sm" 
          onClick={stopGame}
        >
          Pause
        </PixelButton>
      ) : (
        <PixelButton 
          variant="primary" 
          size="sm" 
          onClick={startGame}
        >
          Start
        </PixelButton>
      )}
      
      <PixelButton 
        variant="success" 
        size="sm" 
        onClick={resetGame}
      >
        Reset
      </PixelButton>
      
      <PixelButton 
        variant="secondary" 
        size="sm" 
        onClick={onExit}
      >
        Exit
      </PixelButton>
    </div>
  );
};
