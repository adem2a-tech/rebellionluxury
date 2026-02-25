import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "rebellion_pro_logged_in";
const COOKIE_NAME = "rebellion_pro_logged_in";
const COOKIE_MAX_AGE = 730 * 24 * 60 * 60; // 2 ans — persistance tous navigateurs
const PRO_CODE = "huracandidier";

function setProCookie(loggedIn: boolean) {
  if (typeof document === "undefined") return;
  try {
    const value = loggedIn ? "true" : "";
    const maxAge = loggedIn ? COOKIE_MAX_AGE : 0;
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // ignore
  }
}

function readProCookie(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return document.cookie.includes(`${COOKIE_NAME}=true`);
  } catch {
    return false;
  }
}

function readStoredLogin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY) === "true";
    const fromCookie = readProCookie();
    if (fromCookie && !fromStorage) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    return fromStorage || fromCookie;
  } catch {
    return readProCookie();
  }
}

type ProAuthContextValue = {
  isProLoggedIn: boolean;
  login: (code: string) => boolean;
  logout: () => void;
};

const ProAuthContext = createContext<ProAuthContextValue | null>(null);

export function ProAuthProvider({ children }: { children: ReactNode }) {
  const [isProLoggedIn, setIsProLoggedIn] = useState(() => readStoredLogin());

  useEffect(() => {
    const resync = () => {
      if (readStoredLogin()) setIsProLoggedIn(true);
    };
    const t = setTimeout(resync, 150);
    const onVisibility = () => {
      if (document.visibilityState === "visible") resync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const login = useCallback((code: string): boolean => {
    const trimmed = (code || "").trim().toLowerCase();
    if (trimmed === PRO_CODE) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
        setProCookie(true);
        setIsProLoggedIn(true);
        return true;
      } catch {
        setProCookie(true);
        setIsProLoggedIn(true);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setProCookie(false);
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
