import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "rebellion_admin_session";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    void localStorage.length;
    return localStorage;
  } catch {
    return null;
  }
}

type AdminAuthContextValue = {
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const ADMIN_EMAIL = "admin@rebellionluxury.ch";
const ADMIN_PASSWORD = "huracan2025";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const stored = getStorage()?.getItem(STORAGE_KEY);
      setIsAdmin(stored === "true");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const ok = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok) {
      try {
        getStorage()?.setItem(STORAGE_KEY, "true");
        setIsAdmin(true);
      } catch {
        setIsAdmin(true);
      }
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    try {
      getStorage()?.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
