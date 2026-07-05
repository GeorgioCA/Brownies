import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL =
  'https://api.datebrownies.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401, auto-refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await SecureStore.setItemAsync('access_token', data.access_token);
        await SecureStore.setItemAsync('refresh_token', data.refresh_token);

        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // Navigate to login — handled by auth store listener
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API ──

export const authApi = {
  sendOtp: (phone_number: string) =>
    apiClient.post('/auth/send-otp', { phone_number }),

  verifyOtp: (phone_number: string, otp: string) =>
    apiClient.post('/auth/verify-otp', { phone_number, otp }),

  setPassword: (password: string) =>
    apiClient.post('/auth/set-password', { password }),

  login: (phone_number: string, password: string) =>
    apiClient.post('/auth/login', { phone_number, password }),

  refresh: (refresh_token: string) =>
    apiClient.post('/auth/refresh', { refresh_token }),

  logout: () => apiClient.post('/auth/logout'),

  deleteAccount: () => apiClient.delete('/auth/account'),
};

// ── Profile API ──

export const profileApi = {
  getMyProfile: () => apiClient.get('/profile/me'),

  setup: (data: Record<string, unknown>) =>
    apiClient.post('/profile/setup', data),

  update: (data: Record<string, unknown>) =>
    apiClient.patch('/profile/me', data),

  getProfile: (userId: number) =>
    apiClient.get(`/profile/${userId}`),

  uploadPhoto: (fileUri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as unknown as Blob);
    return apiClient.post('/profile/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePhoto: (photoId: number) =>
    apiClient.delete(`/profile/photos/${photoId}`),

  reorderPhotos: (photo_ids: number[]) =>
    apiClient.put('/profile/photos/reorder', { photo_ids }),

  getVoicePrompts: () => apiClient.get('/profile/voice-prompts'),

  uploadVoicePrompt: (fileUri: string, prompt_question: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'audio/m4a',
      name: 'voice.m4a',
    } as unknown as Blob);
    formData.append('prompt_question', prompt_question);
    return apiClient.post('/profile/voice-prompts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteVoicePrompt: (id: number) =>
    apiClient.delete(`/profile/voice-prompts/${id}`),

  updateLanguages: (languages: string[]) =>
    apiClient.put('/profile/languages', { languages }),
};

// ── Discovery API ──

export const discoveryApi = {
  getProfiles: (page = 1, per_page = 20) =>
    apiClient.get('/discovery', { params: { page, per_page } }),

  swipe: (swiped_id: number, direction: string) =>
    apiClient.post('/discovery/swipes', { swiped_id, direction }),

  undo: () => apiClient.post('/discovery/swipes/undo'),

  getStats: () => apiClient.get('/discovery/swipes/stats'),
};

// ── Matches API ──

export const matchesApi = {
  getMatches: (page = 1, per_page = 20) =>
    apiClient.get('/matches', { params: { page, per_page } }),

  getMatch: (matchId: number) =>
    apiClient.get(`/matches/${matchId}`),

  unmatch: (matchId: number) =>
    apiClient.delete(`/matches/${matchId}`),

  getMessages: (matchId: number, page = 1, per_page = 50) =>
    apiClient.get(`/matches/${matchId}/messages`, { params: { page, per_page } }),

  sendMessage: (matchId: number, content: string, message_type = 'text') =>
    apiClient.post(`/matches/${matchId}/messages`, { content, message_type }),

  getWomenFirstStatus: (matchId: number) =>
    apiClient.get(`/matches/${matchId}/women-first-status`),

  markRead: (matchId: number) =>
    apiClient.put(`/matches/${matchId}/messages/read`),
};

// ── Notifications API ──

export const notificationsApi = {
  getAll: (page = 1, per_page = 20) =>
    apiClient.get('/notifications', { params: { page, per_page } }),

  getUnreadCount: () => apiClient.get('/notifications/unread-count'),

  markRead: (id: number) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllRead: () => apiClient.put('/notifications/read-all'),

  registerPushToken: (token: string) =>
    apiClient.post('/notifications/push-token', { token }),
};

// ── Preferences API ──

export const preferencesApi = {
  get: () => apiClient.get('/preferences'),
  update: (data: Record<string, unknown>) =>
    apiClient.put('/preferences', data),
  updateNotificationSettings: (data: Record<string, unknown>) =>
    apiClient.put('/preferences/notification-settings', data),
};

// ── Reports & Blocks API ──

export const reportsApi = {
  reportUser: (reported_id: number, reason?: string) =>
    apiClient.post('/reports', { reported_id, reason }),

  blockUser: (reported_id: number, reason?: string) =>
    apiClient.post('/blocks', { reported_id, reason }),

  unblockUser: (target_id: number) =>
    apiClient.delete(`/blocks/${target_id}`),

  getBlockedUsers: () => apiClient.get('/blocks'),
};

// ── Verification API ──

export const verificationApi = {
  getStatus: () => apiClient.get('/verification/status'),
  sendPhoneOtp: () => apiClient.post('/verification/phone/send-otp'),
  verifyPhone: (otp: string) =>
    apiClient.post('/verification/phone/verify', null, { params: { otp } }),
  submitPhoto: (fileUri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'verification.jpg',
    } as unknown as Blob);
    return apiClient.post('/verification/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Subscriptions API ──

export const subscriptionsApi = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  getMySubscription: () => apiClient.get('/subscriptions/me'),
  createOrder: (plan_id: number) =>
    apiClient.post('/subscriptions/order', null, { params: { plan_id } }),
  verifyPayment: (data: Record<string, unknown>) =>
    apiClient.post('/subscriptions/verify', data),
  cancel: () => apiClient.post('/subscriptions/cancel'),
};

// ── Family Share API ──

export const familyApi = {
  createShare: (match_id: number, data: Record<string, unknown>) =>
    apiClient.post(`/family-share/${match_id}`, data),

  viewShared: (token: string) =>
    apiClient.get(`/shared/${token}`),

  revokeShare: (share_id: number) =>
    apiClient.delete(`/family-share/${share_id}`),
};

export default apiClient;
