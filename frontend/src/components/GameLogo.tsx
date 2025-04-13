import React from "react";

interface Props {
  size?: "small" | "medium" | "large";
}

export const GameLogo = ({ size = "large" }: Props) => {
  // Size classes based on the prop
  const sizeClasses = {
    small: "text-2xl md:text-3xl",
    medium: "text-3xl md:text-4xl",
    large: "text-4xl md:text-6xl"
  };

  return (
    <div className="text-center">
      <h1 className={`font-bold tracking-tighter ${sizeClasses[size]}`}> 
        <span className="text-red-500">BOMB</span>
        <span className="text-yellow-400">BLITZ</span>
        <span className="text-blue-400"> ARENA</span>
      </h1>
      <div className={`flex justify-center mt-1 space-x-1 ${size === "small" ? "text-xs" : "text-sm"}`}> 
        <span className="px-1 bg-red-500 text-black rounded-sm">BOOM</span>
        <span className="px-1 bg-yellow-400 text-black rounded-sm">BLAST</span>
        <span className="px-1 bg-blue-400 text-black rounded-sm">BATTLE</span>
      </div>
    </div>
  );
};
