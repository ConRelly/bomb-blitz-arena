import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserGuardContext } from "app";
import { PixelButton } from "components/PixelButton";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore, UserStats } from "utils/userStore";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const { stats, isLoading, fetchUserStats, subscribeToUserStats } = useUserStore();

  // Subscribe to user stats from Firestore
  useEffect(() => {
    if (user?.uid) {
      // Initial fetch
      fetchUserStats(user.uid);
      
      // Setup real-time listener
      const unsubscribe = subscribeToUserStats(user.uid);
      
      // Cleanup listener on unmount
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user, fetchUserStats, subscribeToUserStats]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="max-w-3xl w-full mx-auto bg-gray-800/80 p-8 rounded-lg border-2 border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Player Profile</h1>
        
        {/* User Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 bg-gray-700/50 rounded-lg">
          <Avatar className="w-20 h-20 border-2 border-yellow-400">
            <div className="flex items-center justify-center w-full h-full bg-gray-600 text-2xl font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-white truncate">
              {user?.email || 'Anonymous Player'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {user?.metadata?.creationTime 
                ? `Player since ${new Date(user.metadata.creationTime).toLocaleDateString()}` 
                : 'New Player'}
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 px-1">Player Stats</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-700/30 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Games Played" value={stats.gamesPlayed.toString()} icon="🎮" />
              <StatCard label="Wins" value={stats.wins.toString()} icon="🏆" />
              <StatCard label="Win Rate" value={stats.winRate} icon="📊" />
              <StatCard label="Total Kills" value={stats.totalKills.toString()} icon="💥" />
              <StatCard label="Blocks Destroyed" value={stats.totalBlocks.toString()} icon="🧱" />
              <StatCard label="High Score" value={stats.highScore.toString()} icon="🎯" />
            </div>
          )}
          
          <p className="text-gray-400 text-xs mt-2 text-center">
            Stats will be updated after each game
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <PixelButton 
            variant="primary" 
            onClick={() => navigate('/Game')}
          >
            Play Game
          </PixelButton>
          
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

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <Card className="p-4 bg-gray-700/50 border-gray-600 hover:border-gray-500 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
};
