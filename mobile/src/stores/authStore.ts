import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, profileApi } from '../api/client';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  profileComplete: boolean;
  phoneNumber: string;
  accessToken: string | null;

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  setPassword: (password: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setPhoneNumber: (phone: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isNewUser: false,
  profileComplete: false,
  phoneNumber: '',
  accessToken: null,

  setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),

  sendOtp: async (phone: string) => {
    await authApi.sendOtp(phone);
    set({ phoneNumber: phone });
  },

  verifyOtp: async (phone: string, otp: string) => {
    const { data } = await authApi.verifyOtp(phone, otp);
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    set({
      token: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      isNewUser: data.is_new_user,
      profileComplete: data.profile_complete,
      phoneNumber: phone,
    });
    return data.profile_complete;
  },

  setPassword: async (password: string) => {
    await authApi.setPassword(password);
  },

  login: async (phone: string, password: string) => {
    const { data } = await authApi.login(phone, password);
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    set({
      token: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      phoneNumber: phone,
    });
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isNewUser: false,
      profileComplete: false,
    });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (token) {
        set({
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        // Check profile completeness
        try {
          const { data } = await profileApi.getMyProfile();
          set({ profileComplete: data.profile_complete ?? true });
        } catch {
          // Token expired, refresh will handle it
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    await authApi.deleteAccount();
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
