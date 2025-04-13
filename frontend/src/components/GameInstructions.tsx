import React from 'react';

interface Props {}

export const GameInstructions: React.FC<Props> = () => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-sm text-gray-300">
      <h3 className="text-yellow-400 font-bold mb-2">Controls:</h3>
      <ul className="space-y-1">
        <li className="flex justify-between">
          <span>Movement:</span>
          <span className="font-bold">WASD / Arrow Keys</span>
        </li>
        <li className="flex justify-between">
          <span>Place Bomb:</span>
          <span className="font-bold">Space Bar</span>
        </li>
        <li className="flex justify-between">
          <span>Pause Game:</span>
          <span className="font-bold">Escape / P</span>
        </li>
      </ul>
    </div>
  );
};
