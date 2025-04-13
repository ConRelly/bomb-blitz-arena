import { create } from 'zustand';
import { firebaseApp } from 'app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';

const db = getFirestore(firebaseApp);

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  totalKills: number;
  totalBlocks: number;
  highScore: number;
  winRate: string;
}

const defaultStats: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  totalKills: 0,
  totalBlocks: 0,
  highScore: 0,
  winRate: "0%",
};

interface UserStoreState {
  stats: UserStats;
  isLoading: boolean;
  error: Error | null;
  // Methods
  fetchUserStats: (userId: string) => Promise<void>;
  subscribeToUserStats: (userId: string) => Unsubscribe | null;
  updateUserStats: (userId: string, stats: Partial<UserStats>) => Promise<void>;
  createUserProfile: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  stats: defaultStats,
  isLoading: true,
  error: null,

  fetchUserStats: async (userId: string) => {
    if (!userId) return;
    
    try {
      set({ isLoading: true });
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ 
          stats: userData.stats || defaultStats,
          isLoading: false 
        });
      } else {
        // Initialize user profile if it doesn't exist
        await get().createUserProfile(userId);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      set({ error: error as Error, isLoading: false });
    }
  },

  subscribeToUserStats: (userId: string) => {
    if (!userId) return null;
    
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ 
          stats: userData.stats || defaultStats,
          isLoading: false 
        });
      } else {
        set({ stats: defaultStats, isLoading: false });
      }
    }, (error) => {
      console.error("Error in stats subscription:", error);
      set({ error: error as Error, isLoading: false });
    });
  },

  updateUserStats: async (userId: string, newStats: Partial<UserStats>) => {
    if (!userId) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      let currentStats = defaultStats;
      if (docSnap.exists()) {
        const userData = docSnap.data();
        currentStats = userData.stats || defaultStats;
      }
      
      // Calculate win rate if we have new wins or games played
      let updatedStats = { ...currentStats, ...newStats };
      
      if ('wins' in newStats || 'gamesPlayed' in newStats) {
        const winRate = updatedStats.gamesPlayed > 0 
          ? Math.round((updatedStats.wins / updatedStats.gamesPlayed) * 100) 
          : 0;
        updatedStats.winRate = `${winRate}%`;
      }
      
      // Optimistic update
      set({ stats: updatedStats });
      
      await setDoc(userRef, { 
        stats: updatedStats,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user stats:", error);
      set({ error: error as Error });
      // Revert to previous state on error by re-fetching
      get().fetchUserStats(userId);
    }
  },

  createUserProfile: async (userId: string) => {
    if (!userId) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        userId,
        stats: defaultStats,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      set({ stats: defaultStats });
    } catch (error) {
      console.error("Error creating user profile:", error);
      set({ error: error as Error });
    }
  }
}));
