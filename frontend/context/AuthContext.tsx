"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  preferences?: Record<string, unknown>;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  guestSessionId: string | null;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setGuestSessionId: (sessionId: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [guestSessionId, setGuestSessionIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let guestSessionId = localStorage.getItem('guestSessionId');
      if (!guestSessionId) {
        guestSessionId = crypto.randomUUID();
        localStorage.setItem('guestSessionId', guestSessionId);
      }
      setGuestSessionIdState(guestSessionId);
      setIsInitialized(true);
    }
  }, []);

  const setGuestSessionId = (sessionId: string) => {
    setGuestSessionIdState(sessionId);
    if (typeof window !== "undefined") {
      localStorage.setItem('guestSessionId', sessionId);
    }
  };

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: false, // Authentication is disabled
        user: null,
        token: null,
        guestSessionId,
        login: () => {},
        logout: () => {},
        updateUser: () => {},
        setGuestSessionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};
