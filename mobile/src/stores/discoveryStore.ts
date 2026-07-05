import { create } from 'zustand';
import { discoveryApi } from '../api/client';

interface DiscoveryPhoto {
  id: number;
  photo_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface DiscoveryProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  city: string;
  intent: string;
  bio: string | null;
  height_cm: number | null;
  religion: string | null;
  education: string | null;
  occupation: string | null;
  college: string | null;
  workplace: string | null;
  photo_verified: boolean;
  distance_km: number | null;
  photos: DiscoveryPhoto[];
  languages: { language: string }[];
  voice_prompts: any[];
}

interface DiscoveryState {
  profiles: DiscoveryProfile[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  likesRemaining: number;
  superLikesRemaining: number;
  page: number;

  fetchProfiles: () => Promise<void>;
  loadMore: () => Promise<void>;
  swipe: (swipedId: number, direction: string) => Promise<{ matched: boolean; matchId?: number } | null>;
  undo: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setCurrentIndex: (index: number) => void;
  clearProfiles: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  profiles: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  likesRemaining: 50,
  superLikesRemaining: 1,
  page: 1,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null, page: 1 });
    try {
      const { data } = await discoveryApi.getProfiles(1);
      set({ profiles: data, isLoading: false, currentIndex: 0 });
      await get().fetchStats();
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to load profiles',
        isLoading: false,
      });
    }
  },

  loadMore: async () => {
    const page = get().page + 1;
    try {
      const { data } = await discoveryApi.getProfiles(page);
      set((state) => ({
        profiles: [...state.profiles, ...data],
        page,
      }));
    } catch {}
  },

  swipe: async (swipedId: number, direction: string) => {
    try {
      const { data } = await discoveryApi.swipe(swipedId, direction);
      await get().fetchStats();
      return {
        matched: data.matched || false,
        matchId: data.match_id,
      };
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Swipe failed' });
      return null;
    }
  },

  undo: async () => {
    try {
      await discoveryApi.undo();
      await get().fetchStats();
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Undo failed' });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await discoveryApi.getStats();
      set({
        likesRemaining: data.likes_remaining,
        superLikesRemaining: data.super_likes_remaining,
      });
    } catch {}
  },

  setCurrentIndex: (index: number) => set({ currentIndex: index }),

  clearProfiles: () => set({ profiles: [], currentIndex: 0, page: 1 }),
}));
