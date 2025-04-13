import React, { useEffect, useRef } from 'react';
import { useGameStore } from 'utils/gameStore';
import { CELL_SIZE, BOARD_SIZE } from 'utils/gameConstants';
import { initAudio } from 'utils/audioManager';

interface Props {
  className?: string;
}

export const GameBoard: React.FC<Props> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    board,
    playerPosition,
    playerLives,
    bombs,
    isGameRunning,
    gameTime,
    playerPowerUps,
    aiPlayers,
    startGame,
    stopGame
  } = useGameStore();

  // Initialize the game board when component mounts
  useEffect(() => {
    // Initialize audio
    initAudio();
    return () => stopGame();
  }, [stopGame]);

  // Render the game board whenever it changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the board
    for (let y = 0; y < BOARD_SIZE.height; y++) {
      for (let x = 0; x < BOARD_SIZE.width; x++) {
        const cell = board[y][x];
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;

        // Draw cell background
        ctx.fillStyle = '#111827'; // Dark background
        ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

        // Draw cell content based on type
        switch (cell) {
          case 0: // Empty space
            ctx.fillStyle = '#1F2937'; // Slightly lighter than background
            ctx.fillRect(xPos + 1, yPos + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            break;
          case 1: // Wall
            ctx.fillStyle = '#374151'; // Dark gray
            ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);
            
            // Add 3D effect
            ctx.fillStyle = '#4B5563'; // Light edge
            ctx.fillRect(xPos, yPos, CELL_SIZE, 4);
            ctx.fillRect(xPos, yPos, 4, CELL_SIZE);
            
            ctx.fillStyle = '#1F2937'; // Dark edge
            ctx.fillRect(xPos, yPos + CELL_SIZE - 4, CELL_SIZE, 4);
            ctx.fillRect(xPos + CELL_SIZE - 4, yPos, 4, CELL_SIZE);
            break;
          case 2: // Destructible block
            ctx.fillStyle = '#B45309'; // Brown
            ctx.fillRect(xPos + 2, yPos + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            
            // Add wooden texture lines
            ctx.strokeStyle = '#92400E';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo(xPos + 2, yPos + 8 + i * 8);
              ctx.lineTo(xPos + CELL_SIZE - 2, yPos + 8 + i * 8);
              ctx.stroke();
            }
            break;
          // Power-ups
          case 11: // Bomb power-up
            // Draw empty cell background
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(xPos + 1, yPos + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            
            // Draw the power-up base (a glowing circle)
            const bombGrad = ctx.createRadialGradient(
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, 2,
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 2.5
            );
            bombGrad.addColorStop(0, '#FEF3C7');
            bombGrad.addColorStop(0.6, '#F59E0B');
            bombGrad.addColorStop(1, '#B45309');
            
            ctx.fillStyle = bombGrad;
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw a bomb icon on top
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw fuse
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2 - CELL_SIZE / 6);
            ctx.lineTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2 - CELL_SIZE / 4);
            ctx.stroke();
            
            // Draw +1 text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+1', xPos + CELL_SIZE / 2, yPos + CELL_SIZE - 5);
            break;
          case 12: // Range power-up
            // Draw empty cell background
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(xPos + 1, yPos + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            
            // Draw the power-up base (a glowing circle)
            const rangeGrad = ctx.createRadialGradient(
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, 2,
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 2.5
            );
            rangeGrad.addColorStop(0, '#DCFCE7'); // Light green
            rangeGrad.addColorStop(0.6, '#22C55E'); // Green
            rangeGrad.addColorStop(1, '#15803D'); // Dark green
            
            ctx.fillStyle = rangeGrad;
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw explosion range icon (cross symbol)
            ctx.fillStyle = 'white';
            // Horizontal bar
            ctx.fillRect(xPos + CELL_SIZE / 4, yPos + CELL_SIZE / 2 - 2, CELL_SIZE / 2, 4);
            // Vertical bar
            ctx.fillRect(xPos + CELL_SIZE / 2 - 2, yPos + CELL_SIZE / 4, 4, CELL_SIZE / 2);
            
            // Draw +1 text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+1', xPos + CELL_SIZE / 2, yPos + CELL_SIZE - 5);
            break;
          case 13: // Speed power-up
            // Draw empty cell background
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(xPos + 1, yPos + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            
            // Draw the power-up base (a glowing circle)
            const speedGrad = ctx.createRadialGradient(
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, 2,
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 2.5
            );
            speedGrad.addColorStop(0, '#DBEAFE'); // Light blue
            speedGrad.addColorStop(0.6, '#3B82F6'); // Blue
            speedGrad.addColorStop(1, '#1D4ED8'); // Dark blue
            
            ctx.fillStyle = speedGrad;
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw lightning bolt for speed
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 4);
            ctx.lineTo(xPos + CELL_SIZE / 3, yPos + CELL_SIZE / 2);
            ctx.lineTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2);
            ctx.lineTo(xPos + CELL_SIZE / 2, yPos + 3 * CELL_SIZE / 4);
            ctx.lineTo(xPos + 2 * CELL_SIZE / 3, yPos + CELL_SIZE / 2);
            ctx.lineTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2);
            ctx.fill();
            
            // Draw +0.5 text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+0.5', xPos + CELL_SIZE / 2, yPos + CELL_SIZE - 5);
            break;
          case 3: // Bomb
            // Draw dark background
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(xPos + 1, yPos + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            
            // Draw bomb body
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw fuse
            ctx.strokeStyle = '#FCD34D';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 3);
            ctx.lineTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 6);
            ctx.stroke();
            
            // Draw spark on top of fuse (pulsing based on time)
            const sparkSize = 3 + Math.sin(gameTime * 10) * 2;
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 6, sparkSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Find the bomb object for countdown visualization
            const bomb = bombs.find(b => b.position.x === x && b.position.y === y && !b.exploded);
            if (bomb) {
              const timeLeft = Math.max(0, (bomb.placedAt + 2000 - performance.now()) / 1000);
              const countdown = timeLeft.toFixed(1);
              
              // Draw countdown text
              ctx.fillStyle = 'white';
              ctx.font = '10px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(countdown, xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2 + 3);
            }
            break;
          case 4: // Explosion center
          case 5: // Explosion horizontal
          case 6: // Explosion vertical
          case 7: // Explosion tip left
          case 8: // Explosion tip right
          case 9: // Explosion tip up
          case 10: // Explosion tip down
            // Get explosion gradient colors
            const explosionGradient = ctx.createRadialGradient(
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, 2,
              xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 2
            );
            explosionGradient.addColorStop(0, '#FEF3C7'); // Yellow center
            explosionGradient.addColorStop(0.7, '#F59E0B'); // Amber
            explosionGradient.addColorStop(1, '#B45309'); // Brown outside

            ctx.fillStyle = explosionGradient;
            
            // Draw different explosion shapes based on type
            if (cell === 4) { // Center
              ctx.beginPath();
              ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (cell === 5) { // Horizontal
              ctx.fillRect(xPos, yPos + CELL_SIZE / 4, CELL_SIZE, CELL_SIZE / 2);
            } else if (cell === 6) { // Vertical
              ctx.fillRect(xPos + CELL_SIZE / 4, yPos, CELL_SIZE / 2, CELL_SIZE);
            } else if (cell >= 7 && cell <= 10) { // Tips
              ctx.beginPath();
              
              // Draw appropriate tip shape based on direction
              if (cell === 7) { // Left tip
                ctx.moveTo(xPos + CELL_SIZE, yPos + CELL_SIZE / 4);
                ctx.lineTo(xPos, yPos + CELL_SIZE / 2);
                ctx.lineTo(xPos + CELL_SIZE, yPos + 3 * CELL_SIZE / 4);
              } else if (cell === 8) { // Right tip
                ctx.moveTo(xPos, yPos + CELL_SIZE / 4);
                ctx.lineTo(xPos + CELL_SIZE, yPos + CELL_SIZE / 2);
                ctx.lineTo(xPos, yPos + 3 * CELL_SIZE / 4);
              } else if (cell === 9) { // Up tip
                ctx.moveTo(xPos + CELL_SIZE / 4, yPos + CELL_SIZE);
                ctx.lineTo(xPos + CELL_SIZE / 2, yPos);
                ctx.lineTo(xPos + 3 * CELL_SIZE / 4, yPos + CELL_SIZE);
              } else if (cell === 10) { // Down tip
                ctx.moveTo(xPos + CELL_SIZE / 4, yPos);
                ctx.lineTo(xPos + CELL_SIZE / 2, yPos + CELL_SIZE);
                ctx.lineTo(xPos + 3 * CELL_SIZE / 4, yPos);
              }
              
              ctx.closePath();
              ctx.fill();
            }
            
            // Add glow effect
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 10;
            ctx.fillRect(xPos + CELL_SIZE / 2 - 2, yPos + CELL_SIZE / 2 - 2, 4, 4);
            ctx.shadowBlur = 0;
            break;
        }

        // Draw grid lines
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1;
        ctx.strokeRect(xPos, yPos, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw the player
    if (playerPosition) {
      const { x, y } = playerPosition;
      const xPos = x * CELL_SIZE;
      const yPos = y * CELL_SIZE;

      // Player body
      ctx.fillStyle = '#3B82F6'; // Blue
      ctx.fillRect(xPos + 4, yPos + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      
      // Player details (eyes)
      ctx.fillStyle = 'white';
      ctx.fillRect(xPos + 8, yPos + 10, 4, 4);
      ctx.fillRect(xPos + CELL_SIZE - 12, yPos + 10, 4, 4);
    }
    
    // Draw AI players
    if (aiPlayers && aiPlayers.length > 0) {
      // Different colors for different AI players
      const aiColors = ['#DC2626', '#7C3AED', '#EC4899'];
      
      aiPlayers.forEach((ai, index) => {
        const { x, y } = ai.position;
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;
        
        // AI body (use different colors for each AI)
        const aiColor = aiColors[index % aiColors.length];
        ctx.fillStyle = aiColor;
        ctx.fillRect(xPos + 4, yPos + 4, CELL_SIZE - 8, CELL_SIZE - 8);
        
        // AI details (eyes - make them look meaner than player)
        ctx.fillStyle = 'white';
        ctx.fillRect(xPos + 8, yPos + 10, 4, 4);
        ctx.fillRect(xPos + CELL_SIZE - 12, yPos + 10, 4, 4);
        
        // AI angry eyebrows
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xPos + 7, yPos + 8);
        ctx.lineTo(xPos + 13, yPos + 6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(xPos + CELL_SIZE - 7, yPos + 8);
        ctx.lineTo(xPos + CELL_SIZE - 13, yPos + 6);
        ctx.stroke();
      });
    }
  }, [board, playerPosition, bombs, gameTime, aiPlayers]);

  return (
    <div className={`relative ${className}`}>
      {/* Game stats and controls */}
      <div className="mb-2 flex justify-between items-center text-white">
        <div className="flex items-center">
          <span className="mr-2">Lives:</span>
          {Array.from({ length: playerLives }).map((_, i) => (
            <div 
              key={i} 
              className="w-4 h-4 bg-red-500 rounded-full mx-0.5"
              title="Player life"
            />
          ))}
        </div>
        <div>
          <span className="text-sm">Press SPACE to place bombs</span>
        </div>
        <div>
          <span>Time: {Math.floor(gameTime)}s</span>
        </div>
      </div>
      
      {/* Power-up indicators */}
      <div className="mb-2 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-amber-500 rounded-full mr-1.5" title="Bombs"></div>
            <span>{playerPowerUps.maxBombs}</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 rounded-full mr-1.5" title="Range"></div>
            <span>{playerPowerUps.bombRange}</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full mr-1.5" title="Speed"></div>
            <span>{playerPowerUps.speed.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE.width * CELL_SIZE}
        height={BOARD_SIZE.height * CELL_SIZE}
        className="border-4 border-gray-700 rounded-lg shadow-lg bg-gray-900"
      />
      
      {!isGameRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Game Paused</h2>
            <button 
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
