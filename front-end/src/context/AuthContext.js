"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, publicApi } from "@/lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "game_backlog_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const loginWithToken = useCallback(async (nextToken) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);

    const data = await authApi.getMe(nextToken);
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        await loginWithToken(savedToken);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [loginWithToken, logout]);

  const login = useCallback(
    async (credentials) => {
      const data = await publicApi.login(credentials);
      await loginWithToken(data.token);
      return data;
    },
    [loginWithToken]
  );

  const register = useCallback(
    async (credentials) => {
      const data = await publicApi.register(credentials);
      await loginWithToken(data.token);
      return data;
    },
    [loginWithToken]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin_user",
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
