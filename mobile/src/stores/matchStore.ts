import { create } from 'zustand';
import { matchesApi } from '../api/client';

interface UserSummary {
  id: number;
  name: string;
  age: number;
  gender: string;
  city: string;
  intent: string;
  photo_verified: boolean;
}

interface Match {
  id: number;
  matched_at: string;
  is_active: boolean;
  user: UserSummary;
}

interface Message {
  id: number;
  match_id: number;
  sender_id: number;
  message_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface MatchState {
  matches: Match[];
  messages: Record<number, Message[]>;
  isLoading: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
  fetchMessages: (matchId: number) => Promise<void>;
  sendMessage: (matchId: number, content: string) => Promise<void>;
  unmatch: (matchId: number) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  messages: {},
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await matchesApi.getMatches();
      set({ matches: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to load matches',
        isLoading: false,
      });
    }
  },

  fetchMessages: async (matchId: number) => {
    try {
      const { data } = await matchesApi.getMessages(matchId);
      set((state) => ({
        messages: { ...state.messages, [matchId]: data },
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to load messages' });
    }
  },

  sendMessage: async (matchId: number, content: string) => {
    try {
      const { data } = await matchesApi.sendMessage(matchId, content);
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: [...(state.messages[matchId] || []), data],
        },
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to send message' });
      throw err;
    }
  },

  unmatch: async (matchId: number) => {
    try {
      await matchesApi.unmatch(matchId);
      set((state) => ({
        matches: state.matches.filter((m) => m.id !== matchId),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to unmatch' });
    }
  },
}));
