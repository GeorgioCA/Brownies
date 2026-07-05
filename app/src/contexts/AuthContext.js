import React, { createContext, useContext, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { api, setTokens } from "../api/client";

const Storage = {
  async getItem(k) {
    try {
      const m = await import("@react-native-async-storage/async-storage");
      return m.default.getItem(k);
    } catch {
      return localStorage.getItem(k);
    }
  },
  async setItem(k, v) {
    try {
      const m = await import("@react-native-async-storage/async-storage");
      return m.default.setItem(k, v);
    } catch {
      return localStorage.setItem(k, v);
    }
  },
  async remove(k) {
    try {
      const m = await import("@react-native-async-storage/async-storage");
      return m.default.removeItem(k);
    } catch {
      return localStorage.removeItem(k);
    }
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await Storage.getItem("token");
        const refresh = await Storage.getItem("refreshToken");
        if (token) {
          setTokens(token, refresh);
          try {
            const profile = await api("/profile/me");
            setUser(profile);
          } catch {
            await Storage.remove("token");
            await Storage.remove("refreshToken");
            setTokens(null, null);
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(access, refresh) {
    await Storage.setItem("token", access);
    await Storage.setItem("refreshToken", refresh);
    setTokens(access, refresh);
    const profile = await api("/profile/me");
    setUser(profile);
  }

  async function logout() {
    await Storage.remove("token");
    await Storage.remove("refreshToken");
    setTokens(null, null);
    setUser(null);
  }

  if (loading) {
    return React.createElement(View, { style: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fcf8f3" } },
      React.createElement(Text, { style: { fontSize: 18, color: "#8b7a6e" } }, "Loading...")
    );
  }

  return React.createElement(AuthContext.Provider, { value: { user, setUser, loading, login, logout } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
