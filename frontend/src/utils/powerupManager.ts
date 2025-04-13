import { CellType, Position } from './gameConstants';

// Types of powerups
export enum PowerUpType {
  BOMB = 'bomb',      // Increases bombs that can be placed
  RANGE = 'range',    // Increases explosion range
  SPEED = 'speed'     // Increases player movement speed
}

// Maps from PowerUpType to CellType
export const POWERUP_CELL_MAPPING = {
  [PowerUpType.BOMB]: CellType.POWERUP_BOMB,
  [PowerUpType.RANGE]: CellType.POWERUP_RANGE,
  [PowerUpType.SPEED]: CellType.POWERUP_SPEED
};

// Probability of powerup spawning when a destructible block is destroyed
export const POWERUP_SPAWN_CHANCE = 0.3; // 30% chance

// How much each power-up type increases the player's stats
export const POWERUP_EFFECTS = {
  [PowerUpType.BOMB]: 1,      // +1 max bomb
  [PowerUpType.RANGE]: 1,     // +1 explosion range
  [PowerUpType.SPEED]: 0.5,   // +0.5 player speed
};

// Get a random power-up type
export const getRandomPowerUpType = (): PowerUpType => {
  const types = Object.values(PowerUpType);
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
};

// Check if a cell contains a power-up
export const isPowerUpCell = (cellType: CellType): boolean => {
  return [
    CellType.POWERUP_BOMB,
    CellType.POWERUP_RANGE,
    CellType.POWERUP_SPEED
  ].includes(cellType);
};

// Get the power-up type from a cell type
export const getPowerUpTypeFromCell = (cellType: CellType): PowerUpType | null => {
  switch (cellType) {
    case CellType.POWERUP_BOMB:
      return PowerUpType.BOMB;
    case CellType.POWERUP_RANGE:
      return PowerUpType.RANGE;
    case CellType.POWERUP_SPEED:
      return PowerUpType.SPEED;
    default:
      return null;
  }
};
