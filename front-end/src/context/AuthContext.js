"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, publicApi } from "@/lib/api";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      try {
        const data = await authApi.getMe()
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await publicApi.login(credentials)
    setUser(data.user)
    return data
  }, []);

  const register = useCallback(async (credentials) => {
    const data = await publicApi.register(credentials)
    setUser(data.user)
    return data
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {} 
    finally {
      setUser(null)
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin_user",
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}