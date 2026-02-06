import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { addVisitor } from "@/data/visitors";

const STORAGE_KEY = "rebellion_user";
const POPUP_SEEN_KEY = "rebellion_popup_seen";

export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
};

export type AppPhase = "identification" | "transition" | "app";

type UserContextValue = {
  user: UserData | null;
  isIdentified: boolean;
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  identify: (data: UserData) => void;
  resetIdentification: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

function loadUserFromStorage(): UserData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserData;
    if (
      typeof parsed.firstName === "string" &&
      typeof parsed.lastName === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [phase, setPhase] = useState<AppPhase>("identification");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadUserFromStorage();
    if (stored) {
      setUser(stored);
      setPhase("app");
    }
    setHydrated(true);
  }, []);

  const identify = useCallback((data: UserData) => {
    addVisitor(data);
    setUser(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setPhase("transition");
  }, []);

  const resetIdentification = useCallback(() => {
    setUser(null);
    setPhase("identification");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(POPUP_SEEN_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isIdentified: !!user,
      phase,
      setPhase,
      identify,
      resetIdentification,
    }),
    [user, phase, identify, resetIdentification],
  );

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#e5e5e5",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: "1.25rem" }}>Chargement Rebellion Luxury…</span>
      </div>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
