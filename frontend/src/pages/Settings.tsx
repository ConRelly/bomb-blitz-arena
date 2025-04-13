import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PixelButton } from "components/PixelButton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const navigate = useNavigate();
  const [volume, setVolume] = useState(80);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-xl w-full mx-auto bg-gray-800/80 p-8 rounded-lg border-2 border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Settings</h1>
        
        <div className="space-y-6 mb-8">
          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Volume: {volume}%</Label>
            </div>
            <Slider 
              value={[volume]} 
              onValueChange={(values) => setVolume(values[0])} 
              max={100} 
              step={1}
              className="py-2"
            />
          </div>
          
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-white">Sound Effects</Label>
            <Switch 
              checked={sfxEnabled} 
              onCheckedChange={setSfxEnabled}
            />
          </div>
          
          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-white">Music</Label>
            <Switch 
              checked={musicEnabled} 
              onCheckedChange={setMusicEnabled}
            />
          </div>
          
          {/* Difficulty (placeholder) */}
          <div className="p-4 rounded-md bg-gray-700/50">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">Difficulty</h2>
            <div className="flex gap-2">
              <PixelButton 
                variant="primary" 
                size="sm"
                className="flex-1"
              >
                Easy
              </PixelButton>
              <PixelButton 
                variant="secondary" 
                size="sm"
                className="flex-1"
              >
                Medium
              </PixelButton>
              <PixelButton 
                variant="success" 
                size="sm"
                className="flex-1"
              >
                Hard
              </PixelButton>
            </div>
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
