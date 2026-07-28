"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Role, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const demoUser: User = { id: "demo", fullname: "Nadia Pratama", email: "nadia@smartinv.id", role: "admin", is_active: true };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem("smart-inventory-user");
      if (stored) setUser(JSON.parse(stored));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const login = (token: string, currentUser: User) => {
    localStorage.setItem("smart-inventory-token", token);
    localStorage.setItem("smart-inventory-user", JSON.stringify(currentUser));
    setUser(currentUser);
  };
  const logout = () => {
    localStorage.removeItem("smart-inventory-token");
    localStorage.removeItem("smart-inventory-user");
    setUser(null);
  };
  const updateUser = (nextUser: User) => {
    localStorage.setItem("smart-inventory-user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return <AuthContext.Provider value={{ user, ready, login, updateUser, logout, hasRole: (...roles) => !!user && roles.includes(user.role) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { demoUser };
