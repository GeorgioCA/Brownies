import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const refresh = await AsyncStorage.getItem("refreshToken");
      if (token) {
        setTokens(token, refresh);
        try {
          const profile = await api("/profile/me");
          setUser(profile);
        } catch {
          await AsyncStorage.multiRemove(["token", "refreshToken"]);
          setTokens(null, null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(access, refresh) {
    await AsyncStorage.setItem("token", access);
    await AsyncStorage.setItem("refreshToken", refresh);
    setTokens(access, refresh);
    const profile = await api("/profile/me");
    setUser(profile);
  }

  async function logout() {
    await AsyncStorage.multiRemove(["token", "refreshToken"]);
    setTokens(null, null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
