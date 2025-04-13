export const CELL_SIZE = 32; // Size of each cell in pixels

export const BOARD_SIZE = {
  width: 15,  // 15 cells across
  height: 13  // 13 cells down
};

export const PLAYER_SPEED = 4; // Cells per second

export const BOMB_SETTINGS = {
  COUNTDOWN: 2000, // Milliseconds until bomb explodes
  EXPLOSION_DURATION: 1000, // Milliseconds explosion lasts
  COOLDOWN: 1500, // Milliseconds between bomb placements
  MAX_BOMBS: 1, // Maximum number of bombs player can place at once
  EXPLOSION_RANGE: 2 // How far the explosion reaches
};

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  DESTRUCTIBLE = 2,
  BOMB = 3,
  EXPLOSION_CENTER = 4,
  EXPLOSION_HORIZONTAL = 5,
  EXPLOSION_VERTICAL = 6,
  EXPLOSION_TIP_LEFT = 7,
  EXPLOSION_TIP_RIGHT = 8,
  EXPLOSION_TIP_UP = 9,
  EXPLOSION_TIP_DOWN = 10,
  POWERUP_BOMB = 11,     // Extra bomb power-up
  POWERUP_RANGE = 12,    // Bomb range power-up
  POWERUP_SPEED = 13     // Speed power-up
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none'
}

export enum GameStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  OVER = 'over',
  WON = 'won'
}

export interface Position {
  x: number;
  y: number;
}
