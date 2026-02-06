import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "rebellion_pro_logged_in";
const PRO_CODE = "huracandidier";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    void localStorage.length;
    return localStorage;
  } catch {
    try {
      void sessionStorage.length;
      return sessionStorage;
    } catch {
      return null;
    }
  }
}

type ProAuthContextValue = {
  isProLoggedIn: boolean;
  login: (code: string) => boolean;
  logout: () => void;
};

const ProAuthContext = createContext<ProAuthContextValue | null>(null);

export function ProAuthProvider({ children }: { children: ReactNode }) {
  const [isProLoggedIn, setIsProLoggedIn] = useState(false);

  useEffect(() => {
    const storage = getStorage();
    try {
      const stored = storage?.getItem(STORAGE_KEY);
      setIsProLoggedIn(stored === "true");
    } catch {
      setIsProLoggedIn(false);
    }
  }, []);

  const login = useCallback((code: string): boolean => {
    const trimmed = (code || "").trim().toLowerCase();
    if (trimmed === PRO_CODE) {
      const storage = getStorage();
      try {
        storage?.setItem(STORAGE_KEY, "true");
        setIsProLoggedIn(true);
        return true;
      } catch {
        setIsProLoggedIn(true);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      getStorage()?.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setIsProLoggedIn(false);
  }, []);

  const value: ProAuthContextValue = { isProLoggedIn, login, logout };

  return <ProAuthContext.Provider value={value}>{children}</ProAuthContext.Provider>;
}

export function useProAuth(): ProAuthContextValue {
  const ctx = useContext(ProAuthContext);
  if (!ctx) throw new Error("useProAuth must be used within ProAuthProvider");
  return ctx;
}
