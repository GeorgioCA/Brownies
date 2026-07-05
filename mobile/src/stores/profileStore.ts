import { create } from 'zustand';
import { profileApi } from '../api/client';

interface Photo {
  id: number;
  photo_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface Language {
  language: string;
}

interface VoicePrompt {
  id: number;
  prompt_question: string;
  audio_url: string;
  duration_seconds: number | null;
}

export interface UserProfile {
  id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  bio: string | null;
  intent: string;
  city: string;
  college: string | null;
  workplace: string | null;
  height_cm: number | null;
  religion: string | null;
  education: string | null;
  occupation: string | null;
  phone_verified: boolean;
  photo_verified: boolean;
  profile_complete: boolean;
  is_premium: boolean;
  preferred_language: string;
  show_online_status: boolean;
  last_active: string | null;
  photos: Photo[];
  languages: Language[];
  voice_prompts: VoicePrompt[];
  created_at: string;
}

interface Preferences {
  id: number;
  min_age: number;
  max_age: number;
  preferred_gender: string;
  max_distance_km: number;
  intent_filter: string | null;
  city_filter: string | null;
}

interface ProfileState {
  profile: UserProfile | null;
  preferences: Preferences | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  setupProfile: (data: Record<string, unknown>) => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  uploadPhoto: (uri: string) => Promise<void>;
  deletePhoto: (photoId: number) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (data: Record<string, unknown>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  preferences: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await profileApi.getMyProfile();
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to load profile',
        isLoading: false,
      });
    }
  },

  setupProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await profileApi.setup(profileData);
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to save profile',
        isLoading: false,
      });
      throw err;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await profileApi.update(profileData);
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to update profile',
        isLoading: false,
      });
    }
  },

  uploadPhoto: async (uri) => {
    set({ error: null });
    try {
      await profileApi.uploadPhoto(uri);
      // Refresh profile to get updated photos
      const { data } = await profileApi.getMyProfile();
      set({ profile: data });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to upload photo',
      });
    }
  },

  deletePhoto: async (photoId) => {
    set({ error: null });
    try {
      await profileApi.deletePhoto(photoId);
      const { data } = await profileApi.getMyProfile();
      set({ profile: data });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to delete photo',
      });
    }
  },

  fetchPreferences: async () => {
    try {
      const { data } = await profileApi.update({}); // placeholder
      // Preferences have their own endpoint
    } catch {}
    // Attempt real fetch
    try {
      const { default: { get } } = await import('../api/client');
      const { data } = await get('/preferences');
      set({ preferences: data });
    } catch {}
  },

  updatePreferences: async (prefData) => {
    try {
      const { default: { put } } = await import('../api/client');
      const { data } = await put('/preferences', prefData);
      set({ preferences: data });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Failed to update preferences',
      });
    }
  },

  clearProfile: () => set({ profile: null, preferences: null }),
}));
