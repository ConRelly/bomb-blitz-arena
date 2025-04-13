import { create } from 'zustand';
import { 
  BOARD_SIZE, 
  CellType, 
  Direction, 
  GameStatus, 
  Position,
  PLAYER_SPEED,
  BOMB_SETTINGS
} from './gameConstants';
import { 
  PowerUpType, 
  POWERUP_SPAWN_CHANCE, 
  POWERUP_CELL_MAPPING, 
  POWERUP_EFFECTS,
  getRandomPowerUpType,
  isPowerUpCell,
  getPowerUpTypeFromCell
} from './powerupManager';
import { playSound, GAME_SOUNDS } from './audioManager';

interface Bomb {
  id: number;
  position: Position;
  placedAt: number; // Timestamp when bomb was placed
  explosionRange: number;
  exploded: boolean;
}

interface Explosion {
  id: number;
  position: Position;
  createdAt: number; // Timestamp when explosion was created
  range: number;
  cells: Position[]; // Cells affected by explosion
}

interface PlayerPowerUps {
  maxBombs: number;
  bombRange: number;
  speed: number;
}

interface AIPlayer {
  id: number;
  position: Position;
  direction: Direction;
  lastMoveTime: number;
  moveDelay: number; // Movement speed in milliseconds
  bombCooldown: number;
  lastBombTime: number | null;
  bombRange: number;
}

interface GameState {
  // Game state
  board: number[][];
  playerPosition: Position;
  playerDirection: Direction;
  playerLives: number;
  gameStatus: GameStatus;
  gameTime: number;
  lastUpdateTime: number | null;
  bombs: Bomb[];
  explosions: Explosion[];
  lastBombPlacedAt: number | null;
  bombIdCounter: number;
  explosionIdCounter: number;
  playerPowerUps: PlayerPowerUps;
  aiPlayers: AIPlayer[];
  aiIdCounter: number;
  
  // Game properties
  isGameRunning: boolean;
  canPlaceBomb: boolean;
  
  // Methods
  startGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  movePlayer: (direction: Direction) => void;
  placeBomb: () => void;
  updateGame: (timestamp: number) => void;
  generateBoard: () => number[][];
  checkBombs: (currentTime: number) => void;
  detonateBomb: (bomb: Bomb, currentTime: number) => void;
  updateExplosions: (currentTime: number) => void;
  checkPlayerDamage: () => void;
  
  // AI methods
  initializeAIPlayers: () => void;
  updateAIPlayers: (timestamp: number) => void;
  moveAI: (ai: AIPlayer, timestamp: number) => AIPlayer;
  getValidMovesForAI: (ai: AIPlayer) => Direction[];
  isValidCell: (x: number, y: number) => boolean;
  isAIInDanger: (ai: AIPlayer) => boolean;
  getEscapeDirection: (ai: AIPlayer, possibleMoves: Direction[]) => Direction;
  getDirectionTowardsPlayer: (ai: AIPlayer, possibleMoves: Direction[]) => Direction;
  aiShouldPlaceBomb: (ai: AIPlayer, timestamp: number) => boolean;
  aiPlaceBomb: (ai: AIPlayer, timestamp: number) => void;
}

// Helper to create an empty game board
const createEmptyBoard = (): number[][] => {
  // Initialize with empty cells
  const board = Array(BOARD_SIZE.height).fill(null).map(() => 
    Array(BOARD_SIZE.width).fill(CellType.EMPTY)
  );
  
  // Add walls around the edges
  for (let y = 0; y < BOARD_SIZE.height; y++) {
    for (let x = 0; x < BOARD_SIZE.width; x++) {
      // Border walls
      if (x === 0 || y === 0 || x === BOARD_SIZE.width - 1 || y === BOARD_SIZE.height - 1) {
        board[y][x] = CellType.WALL;
      }
      // Interior walls (every 2 cells)
      else if (x % 2 === 0 && y % 2 === 0) {
        board[y][x] = CellType.WALL;
      }
    }
  }

  return board;
};

// Helper to add destructible blocks to the board
const addDestructibleBlocks = (board: number[][]): number[][] => {
  const newBoard = [...board.map(row => [...row])];
  
  // Safe zones around player starting position
  const safeZones = [
    {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, // Player start
    {x: BOARD_SIZE.width - 2, y: 1}, {x: BOARD_SIZE.width - 3, y: 1}, {x: BOARD_SIZE.width - 2, y: 2}, // Top right
    {x: 1, y: BOARD_SIZE.height - 2}, {x: 2, y: BOARD_SIZE.height - 2}, {x: 1, y: BOARD_SIZE.height - 3}, // Bottom left
    {x: BOARD_SIZE.width - 2, y: BOARD_SIZE.height - 2}, {x: BOARD_SIZE.width - 3, y: BOARD_SIZE.height - 2}, {x: BOARD_SIZE.width - 2, y: BOARD_SIZE.height - 3}, // Bottom right
  ];
  
  // Add destructible blocks with ~40% probability (avoiding walls and safe zones)
  for (let y = 1; y < BOARD_SIZE.height - 1; y++) {
    for (let x = 1; x < BOARD_SIZE.width - 1; x++) {
      // Skip if it's a wall or in a safe zone
      if (board[y][x] === CellType.WALL || safeZones.some(pos => pos.x === x && pos.y === y)) {
        continue;
      }
      
      // 40% chance of placing a destructible block
      if (Math.random() < 0.4) {
        newBoard[y][x] = CellType.DESTRUCTIBLE;
      }
    }
  }
  
  return newBoard;
};

// Create the game store
export const useGameStore = create<GameState>((set, get) => {
  // Initialize animation frame ID for cleanup
  let animationFrameId: number | null = null;
  
  // Create the game loop
  const gameLoop = (timestamp: number) => {
    const state = get();
    
    if (state.gameStatus === GameStatus.RUNNING) {
      // Update game state
      state.updateGame(timestamp);
      
      // Continue the loop
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };
  
  return {
    // Initial state
    board: createEmptyBoard(),
    playerPosition: { x: 1, y: 1 },
    playerDirection: Direction.NONE,
    playerLives: 3,
    gameStatus: GameStatus.IDLE,
    gameTime: 0,
    lastUpdateTime: null,
    bombs: [],
    explosions: [],
    lastBombPlacedAt: null,
    bombIdCounter: 0,
    explosionIdCounter: 0,
    playerPowerUps: {
      maxBombs: BOMB_SETTINGS.MAX_BOMBS,
      bombRange: BOMB_SETTINGS.EXPLOSION_RANGE,
      speed: PLAYER_SPEED
    },
    aiPlayers: [],
    aiIdCounter: 0,
    
    // Computed properties
    get isGameRunning(): boolean {
      return get().gameStatus === GameStatus.RUNNING;
    },
    
    get canPlaceBomb(): boolean {
      const { bombs, lastBombPlacedAt } = get();
      const now = performance.now();
      
      // Check if we're under the maximum bomb count
      if (bombs.length >= BOMB_SETTINGS.MAX_BOMBS) {
        return false;
      }
      
      // Check if we're still in cooldown
      if (lastBombPlacedAt && now - lastBombPlacedAt < BOMB_SETTINGS.COOLDOWN) {
        return false;
      }
      
      return true;
    },
    
    // Methods
    startGame: () => {
      const currentState = get();
      
      // Only start if not already running
      if (currentState.gameStatus !== GameStatus.RUNNING) {
        set({ 
          gameStatus: GameStatus.RUNNING,
          lastUpdateTime: performance.now() 
        });
        
        // Start the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
        
        // Set up keyboard controls
        const handleKeyDown = (e: KeyboardEvent) => {
          const { isGameRunning } = get();
          if (!isGameRunning) return;
          
          switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
              get().movePlayer(Direction.UP);
              break;
            case 'ArrowDown':
            case 's':
            case 'S':
              get().movePlayer(Direction.DOWN);
              break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
              get().movePlayer(Direction.LEFT);
              break;
            case 'ArrowRight':
            case 'd':
            case 'D':
              get().movePlayer(Direction.RIGHT);
              break;
            case ' ': // Spacebar
              get().placeBomb();
              break;
            case 'Escape':
            case 'p':
            case 'P':
              get().stopGame();
              break;
          }
        };
        
        // Add event listener
        window.addEventListener('keydown', handleKeyDown);
        
        // Cleanup function to remove event listener
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        };
      }
    },
    
    stopGame: () => {
      set({ gameStatus: GameStatus.PAUSED });
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
    
    resetGame: () => {
      // Stop the game first
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Reset game state
      set({
        board: get().generateBoard(),
        playerPosition: { x: 1, y: 1 },
        playerDirection: Direction.NONE,
        playerLives: 3,
        gameStatus: GameStatus.IDLE,
        gameTime: 0,
        lastUpdateTime: null,
        bombs: [],
        explosions: [],
        lastBombPlacedAt: null,
        bombIdCounter: 0,
        explosionIdCounter: 0,
        playerPowerUps: {
          maxBombs: BOMB_SETTINGS.MAX_BOMBS,
          bombRange: BOMB_SETTINGS.EXPLOSION_RANGE,
          speed: PLAYER_SPEED
        },
        aiPlayers: [],
        aiIdCounter: 0
      });
      
      // Initialize AI players
      get().initializeAIPlayers();
    },
    
    movePlayer: (direction: Direction) => {
      const { board, playerPosition, playerPowerUps } = get();
      
      // Calculate new position based on direction
      let newPosition = { ...playerPosition };
      
      switch (direction) {
        case Direction.UP:
          newPosition.y -= 1;
          break;
        case Direction.DOWN:
          newPosition.y += 1;
          break;
        case Direction.LEFT:
          newPosition.x -= 1;
          break;
        case Direction.RIGHT:
          newPosition.x += 1;
          break;
      }
      
      // Check collision with walls and destructible blocks
      const cellType = board[newPosition.y]?.[newPosition.x];
      if (cellType === undefined || 
          cellType === CellType.WALL || 
          cellType === CellType.DESTRUCTIBLE || 
          cellType === CellType.BOMB) {
        // Collision detected, don't move
        return;
      }
      
      // Check if player collects a power-up
      let updatedBoard = [...board];
      let updatedPowerUps = { ...playerPowerUps };
      let powerUpCollected = false;
      
      if (isPowerUpCell(cellType)) {
        const powerUpType = getPowerUpTypeFromCell(cellType);
        if (powerUpType) {
          // Apply power-up effect
          switch (powerUpType) {
            case PowerUpType.BOMB:
              updatedPowerUps.maxBombs += POWERUP_EFFECTS[PowerUpType.BOMB];
              break;
            case PowerUpType.RANGE:
              updatedPowerUps.bombRange += POWERUP_EFFECTS[PowerUpType.RANGE];
              break;
            case PowerUpType.SPEED:
              updatedPowerUps.speed += POWERUP_EFFECTS[PowerUpType.SPEED];
              break;
          }
          
          // Clear the power-up from the board
          updatedBoard = [...board.map(row => [...row])];
          updatedBoard[newPosition.y][newPosition.x] = CellType.EMPTY;
          powerUpCollected = true;
          
          // Play power-up collect sound (if available)
          if (GAME_SOUNDS.POWERUP) {
            playSound(GAME_SOUNDS.POWERUP, { volume: 0.7 });
          }
        }
      }
      
      // Update player position, direction, and potentially board and power-ups
      if (powerUpCollected) {
        set({
          playerPosition: newPosition,
          playerDirection: direction,
          board: updatedBoard,
          playerPowerUps: updatedPowerUps
        });
      } else {
        set({
          playerPosition: newPosition,
          playerDirection: direction
        });
      }
    },
    
    placeBomb: () => {
      const { playerPosition, bombs, canPlaceBomb, board, playerPowerUps } = get();
      
      // Check if we can place a bomb
      if (!canPlaceBomb) {
        return;
      }
      
      // Check if player has reached their bomb limit
      const activeBombs = bombs.filter(bomb => !bomb.exploded).length;
      if (activeBombs >= playerPowerUps.maxBombs) {
        return;
      }
      
      // Check if there's already a bomb at this position
      const bombAtPosition = bombs.some(bomb => 
        bomb.position.x === playerPosition.x && 
        bomb.position.y === playerPosition.y
      );
      
      if (bombAtPosition) {
        return;
      }
      
      // Play bomb placement sound
      playSound(GAME_SOUNDS.BOMB_PLACE, { volume: 0.5 });
      
      // Create a new bomb
      const newBomb = {
        id: get().bombIdCounter,
        position: { ...playerPosition },
        placedAt: performance.now(),
        explosionRange: get().playerPowerUps.bombRange,
        exploded: false
      };
      
      // Update game state with new bomb
      const newBoard = [...get().board.map(row => [...row])];
      newBoard[playerPosition.y][playerPosition.x] = CellType.BOMB;
      
      set({
        bombs: [...bombs, newBomb],
        bombIdCounter: get().bombIdCounter + 1,
        lastBombPlacedAt: performance.now(),
        board: newBoard
      });
    },
    
    updateGame: (timestamp: number) => {
      const { lastUpdateTime, gameTime } = get();
      
      if (lastUpdateTime) {
        const deltaTime = (timestamp - lastUpdateTime) / 1000; // Convert to seconds
        
        // Update game time
        set({
          gameTime: gameTime + deltaTime,
          lastUpdateTime: timestamp
        });
        
        // Check bombs and explosions
        get().checkBombs(timestamp);
        get().updateExplosions(timestamp);
        get().checkPlayerDamage();
        
        // Update AI players
        get().updateAIPlayers(timestamp);
      } else {
        set({ lastUpdateTime: timestamp });
      }
    },
    
    generateBoard: () => {
      // Create a new board with empty cells and walls
      const newBoard = createEmptyBoard();
      
      // Add destructible blocks
      return addDestructibleBlocks(newBoard);
    },
    
    checkBombs: (currentTime: number) => {
      const { bombs } = get();
      
      // Check for bombs that should explode
      bombs.forEach(bomb => {
        if (!bomb.exploded && currentTime - bomb.placedAt >= BOMB_SETTINGS.COUNTDOWN) {
          get().detonateBomb(bomb, currentTime);
        }
      });
    },
    
    detonateBomb: (bomb: Bomb, currentTime: number) => {
      const { board, explosions } = get();
      const { position, explosionRange, id } = bomb;
      const { x, y } = position;
      const newBoard = [...board.map(row => [...row])];
      const affectedCells: Position[] = [{ x, y }]; // Center of explosion
      
      // Play explosion sound
      playSound(GAME_SOUNDS.EXPLOSION, { volume: 0.7 });
      
      // Mark bomb as exploded in the state
      const updatedBombs = get().bombs.map(b => {
        if (b.id === id) {
          return { ...b, exploded: true };
        }
        return b;
      });
      
      // Remove the bomb from the board
      newBoard[y][x] = CellType.EXPLOSION_CENTER;
      
      // Check in four directions and add explosion cells
      const directions = [
        { dx: 1, dy: 0, tipType: CellType.EXPLOSION_TIP_RIGHT },   // Right
        { dx: -1, dy: 0, tipType: CellType.EXPLOSION_TIP_LEFT },    // Left
        { dx: 0, dy: 1, tipType: CellType.EXPLOSION_TIP_DOWN },     // Down
        { dx: 0, dy: -1, tipType: CellType.EXPLOSION_TIP_UP }       // Up
      ];
      
      directions.forEach(dir => {
        let isTip = true;
        
        for (let i = 1; i <= explosionRange; i++) {
          const newX = x + dir.dx * i;
          const newY = y + dir.dy * i;
          
          // Check if this position is valid
          if (newX < 0 || newX >= BOARD_SIZE.width || newY < 0 || newY >= BOARD_SIZE.height) {
            break;
          }
          
          const cellType = board[newY][newX];
          
          // Explosion stops at walls
          if (cellType === CellType.WALL) {
            break;
          }
          
          // Explosion destroys destructible blocks and stops
          if (cellType === CellType.DESTRUCTIBLE) {
            // Determine if a power-up should spawn (random chance)
            if (Math.random() < POWERUP_SPAWN_CHANCE) {
              // Get a random power-up type
              const powerUpType = getRandomPowerUpType();
              // Convert to cell type
              const powerUpCellType = POWERUP_CELL_MAPPING[powerUpType];
              // Mark this cell for delayed power-up spawning after explosion clears
              setTimeout(() => {
                const state = get();
                const currentCellType = state.board[newY][newX];
                // Only spawn if the cell is empty (explosion has cleared)
                if (currentCellType === CellType.EMPTY) {
                  const updatedBoard = [...state.board.map(row => [...row])];
                  updatedBoard[newY][newX] = powerUpCellType;
                  set({ board: updatedBoard });
                }
              }, BOMB_SETTINGS.EXPLOSION_DURATION + 100); // Delay slightly more than explosion duration
            }
            
            newBoard[newY][newX] = isTip ? dir.tipType : 
              (dir.dx !== 0 ? CellType.EXPLOSION_HORIZONTAL : CellType.EXPLOSION_VERTICAL);
            affectedCells.push({ x: newX, y: newY });
            break;
          }
          
          // Chain reaction with other bombs
          if (cellType === CellType.BOMB) {
            // Find the bomb and detonate it immediately
            const bombToDetonate = get().bombs.find(b => 
              b.position.x === newX && b.position.y === newY && !b.exploded
            );
            
            if (bombToDetonate) {
              get().detonateBomb(bombToDetonate, currentTime);
            }
          }
          
          // Add explosion cell
          newBoard[newY][newX] = isTip ? dir.tipType : 
            (dir.dx !== 0 ? CellType.EXPLOSION_HORIZONTAL : CellType.EXPLOSION_VERTICAL);
          affectedCells.push({ x: newX, y: newY });
          
          // Only the last cell in range is a tip
          isTip = (i === explosionRange);
        }
      });
      
      // Create a new explosion
      const newExplosion = {
        id: get().explosionIdCounter,
        position: { ...position },
        createdAt: currentTime,
        range: explosionRange,
        cells: affectedCells
      };
      
      // Update state with new explosion
      set({
        board: newBoard,
        bombs: updatedBombs,
        explosions: [...explosions, newExplosion],
        explosionIdCounter: get().explosionIdCounter + 1
      });
    },
    
    updateExplosions: (currentTime: number) => {
      const { explosions, board } = get();
      
      // Check for explosions that should be removed
      const updatedExplosions = explosions.filter(explosion => {
        const explosionAge = currentTime - explosion.createdAt;
        return explosionAge < BOMB_SETTINGS.EXPLOSION_DURATION;
      });
      
      // If any explosions were removed, update the board
      if (updatedExplosions.length < explosions.length) {
        const newBoard = [...board.map(row => [...row])];
        
        // Create a set of active explosion cells
        const activeCells = new Set();
        updatedExplosions.forEach(explosion => {
          explosion.cells.forEach(cell => {
            activeCells.add(`${cell.x},${cell.y}`);
          });
        });
        
        // Clear cells from removed explosions
        explosions.forEach(explosion => {
          if (!updatedExplosions.includes(explosion)) {
            explosion.cells.forEach(cell => {
              const cellKey = `${cell.x},${cell.y}`;
              // Only clear if not part of another active explosion
              if (!activeCells.has(cellKey)) {
                newBoard[cell.y][cell.x] = CellType.EMPTY;
              }
            });
          }
        });
        
        set({
          explosions: updatedExplosions,
          board: newBoard
        });
      }
    },
    
    checkPlayerDamage: () => {
      const { board, playerPosition, playerLives, gameStatus, aiPlayers } = get();
      const { x, y } = playerPosition;
      
      // Check if player is on an explosion cell
      const cellType = board[y][x];
      const isExplosionCell = cellType === CellType.EXPLOSION_CENTER || 
                             cellType === CellType.EXPLOSION_HORIZONTAL || 
                             cellType === CellType.EXPLOSION_VERTICAL || 
                             cellType === CellType.EXPLOSION_TIP_LEFT || 
                             cellType === CellType.EXPLOSION_TIP_RIGHT || 
                             cellType === CellType.EXPLOSION_TIP_UP || 
                             cellType === CellType.EXPLOSION_TIP_DOWN;
      
      if (isExplosionCell) {
        // Player takes damage
        const newLives = playerLives - 1;
        
        if (newLives <= 0) {
          // Game over
          set({
            playerLives: 0,
            gameStatus: GameStatus.OVER
          });
          get().stopGame();
        } else {
          // Reset player position after damage
          set({
            playerLives: newLives,
            playerPosition: { x: 1, y: 1 }
          });
        }
      }
      
      // Also check AI players for damage
      const updatedAiPlayers = aiPlayers.filter(ai => {
        const aiCellType = board[ai.position.y][ai.position.x];
        const aiInExplosion = aiCellType === CellType.EXPLOSION_CENTER || 
                              aiCellType === CellType.EXPLOSION_HORIZONTAL || 
                              aiCellType === CellType.EXPLOSION_VERTICAL || 
                              aiCellType === CellType.EXPLOSION_TIP_LEFT || 
                              aiCellType === CellType.EXPLOSION_TIP_RIGHT || 
                              aiCellType === CellType.EXPLOSION_TIP_UP || 
                              aiCellType === CellType.EXPLOSION_TIP_DOWN;
        
        // Remove AI if it's in an explosion
        return !aiInExplosion;
      });
      
      // Update state if any AI was removed
      if (updatedAiPlayers.length < aiPlayers.length) {
        set({ aiPlayers: updatedAiPlayers });
        
        // Check win condition - if no AI players left
        if (updatedAiPlayers.length === 0) {
          set({ gameStatus: GameStatus.WON });
          get().stopGame();
        }
      }
    },
    
    // AI Methods
    initializeAIPlayers: () => {
      const { aiIdCounter } = get();
      const board = get().board;
      const aiPlayers: AIPlayer[] = [];
      
      // Add AI players at different corners of the map
      const aiPositions = [
        { x: BOARD_SIZE.width - 2, y: 1 },          // Top right
        { x: 1, y: BOARD_SIZE.height - 2 },         // Bottom left
        { x: BOARD_SIZE.width - 2, y: BOARD_SIZE.height - 2 } // Bottom right
      ];
      
      // Create AI players with different speeds
      aiPositions.forEach((position, index) => {
        aiPlayers.push({
          id: aiIdCounter + index,
          position,
          direction: Direction.NONE,
          lastMoveTime: 0,
          moveDelay: 800 - (index * 100), // Varying speeds: 800ms, 700ms, 600ms
          bombCooldown: 3000 + (index * 500), // Different bomb cooldowns
          lastBombTime: null,
          bombRange: BOMB_SETTINGS.EXPLOSION_RANGE
        });
      });
      
      set({
        aiPlayers,
        aiIdCounter: aiIdCounter + aiPositions.length
      });
    },
    
    updateAIPlayers: (timestamp: number) => {
      const { aiPlayers, board, playerPosition } = get();
      
      if (aiPlayers.length === 0) return;
      
      // Update each AI player
      const updatedAIPlayers = aiPlayers.map(ai => {
        // Only move AI after its move delay has passed
        if (timestamp - ai.lastMoveTime < ai.moveDelay) {
          return ai;
        }
        
        // Choose an action: move or place bomb
        const shouldPlaceBomb = get().aiShouldPlaceBomb(ai, timestamp);
        
        if (shouldPlaceBomb) {
          get().aiPlaceBomb(ai, timestamp);
          return {
            ...ai,
            lastBombTime: timestamp,
            lastMoveTime: timestamp // Reset move timer
          };
        }
        
        // Move AI
        return get().moveAI(ai, timestamp);
      });
      
      set({ aiPlayers: updatedAIPlayers });
    },
    
    moveAI: (ai: AIPlayer, timestamp: number) => {
      const { board, playerPosition, bombs } = get();
      const { position } = ai;
      
      // Get possible directions the AI can move in
      const possibleMoves = get().getValidMovesForAI(ai);
      
      // If there are no valid moves, don't move
      if (possibleMoves.length === 0) {
        return {
          ...ai,
          lastMoveTime: timestamp
        };
      }
      
      // Choose direction based on strategy
      let targetDirection: Direction;
      
      // Check if nearby cells have explosions
      const isDanger = get().isAIInDanger(ai);
      
      if (isDanger) {
        // Try to escape from danger
        targetDirection = get().getEscapeDirection(ai, possibleMoves);
      } else if (Math.random() < 0.7) {
        // 70% chance to follow player
        targetDirection = get().getDirectionTowardsPlayer(ai, possibleMoves);
      } else {
        // 30% chance to choose random direction
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        targetDirection = possibleMoves[randomIndex];
      }
      
      // Calculate new position based on direction
      const newPosition = { ...position };
      
      switch (targetDirection) {
        case Direction.UP:
          newPosition.y -= 1;
          break;
        case Direction.DOWN:
          newPosition.y += 1;
          break;
        case Direction.LEFT:
          newPosition.x -= 1;
          break;
        case Direction.RIGHT:
          newPosition.x += 1;
          break;
        default:
          // No movement
          break;
      }
      
      // Return updated AI with new position
      return {
        ...ai,
        position: newPosition,
        direction: targetDirection,
        lastMoveTime: timestamp
      };
    },
    
    getValidMovesForAI: (ai: AIPlayer) => {
      const { board, bombs } = get();
      const { position } = ai;
      const { x, y } = position;
      const validMoves: Direction[] = [];
      
      // Check each adjacent cell
      if (y > 0 && get().isValidCell(x, y - 1)) {
        validMoves.push(Direction.UP);
      }
      
      if (y < BOARD_SIZE.height - 1 && get().isValidCell(x, y + 1)) {
        validMoves.push(Direction.DOWN);
      }
      
      if (x > 0 && get().isValidCell(x - 1, y)) {
        validMoves.push(Direction.LEFT);
      }
      
      if (x < BOARD_SIZE.width - 1 && get().isValidCell(x + 1, y)) {
        validMoves.push(Direction.RIGHT);
      }
      
      return validMoves;
    },
    
    isValidCell: (x: number, y: number) => {
      const { board } = get();
      const cellType = board[y]?.[x];
      
      // AI can't move through walls, destructible blocks, bombs
      return cellType !== undefined && 
             cellType !== CellType.WALL && 
             cellType !== CellType.DESTRUCTIBLE && 
             cellType !== CellType.BOMB;
    },
    
    isAIInDanger: (ai: AIPlayer) => {
      const { board, bombs } = get();
      const { position } = ai;
      const { x, y } = position;
      
      // Check nearby cells for bombs or explosions
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          // Check if the cell is within bounds
          if (y + dy < 0 || y + dy >= BOARD_SIZE.height || x + dx < 0 || x + dx >= BOARD_SIZE.width) {
            continue;
          }
          
          const cellType = board[y + dy][x + dx];
          
          // Check for bombs or explosions
          if (cellType === CellType.BOMB ||
              cellType === CellType.EXPLOSION_CENTER ||
              cellType === CellType.EXPLOSION_HORIZONTAL ||
              cellType === CellType.EXPLOSION_VERTICAL ||
              cellType === CellType.EXPLOSION_TIP_LEFT ||
              cellType === CellType.EXPLOSION_TIP_RIGHT ||
              cellType === CellType.EXPLOSION_TIP_UP ||
              cellType === CellType.EXPLOSION_TIP_DOWN) {
            return true;
          }
        }
      }
      
      return false;
    },
    
    getEscapeDirection: (ai: AIPlayer, possibleMoves: Direction[]) => {
      const { bombs, board } = get();
      const { position } = ai;
      
      // Calculate danger level in each direction
      const dangerScores: Record<Direction, number> = {
        [Direction.UP]: 0,
        [Direction.DOWN]: 0,
        [Direction.LEFT]: 0,
        [Direction.RIGHT]: 0,
        [Direction.NONE]: 999 // Highest danger for not moving
      };
      
      // Check each possible move for proximity to bombs
      possibleMoves.forEach(direction => {
        let newX = position.x;
        let newY = position.y;
        
        switch (direction) {
          case Direction.UP: newY -= 1; break;
          case Direction.DOWN: newY += 1; break;
          case Direction.LEFT: newX -= 1; break;
          case Direction.RIGHT: newX += 1; break;
        }
        
        // Calculate danger score (lower is safer)
        bombs.forEach(bomb => {
          if (bomb.exploded) return;
          
          const bombX = bomb.position.x;
          const bombY = bomb.position.y;
          
          // Check if in bomb's potential explosion path
          if ((bombX === newX && Math.abs(bombY - newY) <= bomb.explosionRange) ||
              (bombY === newY && Math.abs(bombX - newX) <= bomb.explosionRange)) {
            // Higher danger the closer to explosion time
            const timeUntilExplosion = bomb.placedAt + BOMB_SETTINGS.COUNTDOWN - timestamp;
            dangerScores[direction] += 10 * (1 - timeUntilExplosion / BOMB_SETTINGS.COUNTDOWN);
          }
        });
        
        // Add danger for existing explosions
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (newY + dy < 0 || newY + dy >= BOARD_SIZE.height || 
                newX + dx < 0 || newX + dx >= BOARD_SIZE.width) {
              continue;
            }
            
            const cellType = board[newY + dy][newX + dx];
            if (cellType >= CellType.EXPLOSION_CENTER && cellType <= CellType.EXPLOSION_TIP_DOWN) {
              // Distance-based danger score
              dangerScores[direction] += 50 / (Math.abs(dx) + Math.abs(dy) + 1);
            }
          }
        }
      });
      
      // Sort directions by danger level (ascending)
      const sortedDirections = possibleMoves.sort((dir1, dir2) => 
        dangerScores[dir1] - dangerScores[dir2]
      );
      
      // Return safest direction or random if all equally dangerous
      return sortedDirections[0] || Direction.NONE;
    },
    
    getDirectionTowardsPlayer: (ai: AIPlayer, possibleMoves: Direction[]) => {
      const { playerPosition } = get();
      const { position } = ai;
      
      // Calculate Manhattan distance for each possible move
      const distances: Record<Direction, number> = {
        [Direction.UP]: 999,
        [Direction.DOWN]: 999,
        [Direction.LEFT]: 999,
        [Direction.RIGHT]: 999,
        [Direction.NONE]: 999
      };
      
      // Calculate distance for each possible move
      possibleMoves.forEach(direction => {
        let newX = position.x;
        let newY = position.y;
        
        switch (direction) {
          case Direction.UP: newY -= 1; break;
          case Direction.DOWN: newY += 1; break;
          case Direction.LEFT: newX -= 1; break;
          case Direction.RIGHT: newX += 1; break;
        }
        
        // Manhattan distance to player
        distances[direction] = Math.abs(newX - playerPosition.x) + Math.abs(newY - playerPosition.y);
      });
      
      // Sort directions by distance (ascending)
      const sortedDirections = possibleMoves.sort((dir1, dir2) => 
        distances[dir1] - distances[dir2]
      );
      
      // Return direction that gets closest to player, or random if all same
      return sortedDirections[0] || (possibleMoves.length > 0 ? possibleMoves[0] : Direction.NONE);
    },
    
    aiShouldPlaceBomb: (ai: AIPlayer, timestamp: number) => {
      // Check if AI can place a bomb (cooldown)
      if (ai.lastBombTime && timestamp - ai.lastBombTime < ai.bombCooldown) {
        return false;
      }
      
      const { playerPosition, board } = get();
      const { position } = ai;
      
      // Check if player is in range for bombing
      const isPlayerInLine = playerPosition.x === position.x || playerPosition.y === position.y;
      const distance = Math.abs(playerPosition.x - position.x) + Math.abs(playerPosition.y - position.y);
      
      // Place bomb if player is in range and in line of sight
      if (isPlayerInLine && distance <= ai.bombRange + 2) {
        // Check if path to player is clear
        let hasObstacle = false;
        
        if (playerPosition.x === position.x) {
          // Vertical alignment
          const minY = Math.min(playerPosition.y, position.y);
          const maxY = Math.max(playerPosition.y, position.y);
          
          for (let y = minY + 1; y < maxY; y++) {
            const cellType = board[y][position.x];
            if (cellType === CellType.WALL || cellType === CellType.BOMB) {
              hasObstacle = true;
              break;
            }
          }
        } else if (playerPosition.y === position.y) {
          // Horizontal alignment
          const minX = Math.min(playerPosition.x, position.x);
          const maxX = Math.max(playerPosition.x, position.x);
          
          for (let x = minX + 1; x < maxX; x++) {
            const cellType = board[position.y][x];
            if (cellType === CellType.WALL || cellType === CellType.BOMB) {
              hasObstacle = true;
              break;
            }
          }
        }
        
        return !hasObstacle && Math.random() < 0.7; // 70% chance to place bomb if player is in range
      }
      
      // Also place bombs near destructible blocks occasionally
      const adjacentCells = [
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + 1 },
        { x: position.x - 1, y: position.y },
        { x: position.x + 1, y: position.y }
      ];
      
      const hasDestructibleNearby = adjacentCells.some(cell => {
        if (cell.x < 0 || cell.x >= BOARD_SIZE.width || cell.y < 0 || cell.y >= BOARD_SIZE.height) {
          return false;
        }
        return board[cell.y][cell.x] === CellType.DESTRUCTIBLE;
      });
      
      return hasDestructibleNearby && Math.random() < 0.2; // 20% chance to place bomb near destructible blocks
    },
    
    aiPlaceBomb: (ai: AIPlayer, timestamp: number) => {
      const { board, bombs } = get();
      const { position } = ai;
      
      // Check if there's already a bomb at this position
      const bombAtPosition = bombs.some(bomb => 
        bomb.position.x === position.x && 
        bomb.position.y === position.y
      );
      
      if (bombAtPosition) {
        return;
      }
      
      // Play bomb placement sound
      playSound(GAME_SOUNDS.BOMB_PLACE, { volume: 0.5 });
      
      // Create a new bomb
      const newBomb = {
        id: get().bombIdCounter,
        position: { ...position },
        placedAt: timestamp,
        explosionRange: ai.bombRange,
        exploded: false
      };
      
      // Update game state with new bomb
      const newBoard = [...board.map(row => [...row])];
      newBoard[position.y][position.x] = CellType.BOMB;
      
      set({
        bombs: [...bombs, newBomb],
        bombIdCounter: get().bombIdCounter + 1,
        board: newBoard
      });
    }
  };
});
