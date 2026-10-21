import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler } from "../api/client";

interface User {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  checkingSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { bio?: string; displayName?: string; email?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  function persist(token: string, user: User) {
    localStorage.setItem("token", token);
    setUser(user);
  }

  function clearSession() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // On startup, don't trust a cached user object — the token backing it may
  // have expired or been issued before a schema change. Ask the server.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingSession(false);
      return;
    }

    api
      .getMe()
      .then((me) => setUser(me))
      .catch(() => clearSession())
      .finally(() => setCheckingSession(false));
  }, []);

  // Any API call that comes back 401 (expired/invalid token) drops the
  // session immediately, from wherever in the app it happened.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    persist(res.token, res.user);
  }

  async function signup(email: string, password: string, displayName: string) {
    const res = await api.signup({ email, password, displayName });
    persist(res.token, res.user);
  }

  function logout() {
    clearSession();
  }

  async function updateProfile(data: { bio?: string; displayName?: string; email?: string }) {
    const updated = await api.updateProfile(data);
    setUser(updated);
  }

  async function uploadAvatar(file: File) {
    const updated = await api.uploadAvatar(file);
    setUser(updated);
  }

  async function changePassword(data: { currentPassword: string; newPassword: string }) {
    await api.changePassword(data);
  }

  return (
    <AuthContext.Provider
      value={{ user, checkingSession, login, signup, logout, updateProfile, uploadAvatar, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
