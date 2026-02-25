import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { addVisitor } from "@/data/visitors";
import SplashScreen from "@/components/SplashScreen";
import { COOKIE_BANNER_OPEN_EVENT } from "@/components/CookieConsent";

const STORAGE_KEY = "rebellion_user";
const POPUP_SEEN_KEY = "rebellion_popup_seen";
const USER_COOKIE_NAME = "rebellion_user";
const USER_BACKUP_COOKIE_NAME = "rebellion_user_bak"; // reconnaissance appareil si déconnexion
const USER_COOKIE_MAX_AGE = 730 * 24 * 60 * 60; // 2 ans — persistance tous navigateurs

export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type AppPhase = "identification" | "transition" | "app";

type UserContextValue = {
  user: UserData | null;
  isIdentified: boolean;
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  identify: (data: UserData) => void;
  resetIdentification: () => void;
  /** Tente de restaurer la session depuis l'appareil (cookie de secours). Retourne true si reconnecté. */
  tryRestoreFromDevice: () => boolean;
  /** true si l'utilisateur a été rechargé depuis le stockage (retour sur le site) */
  loadedFromStorage: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

function parseUserPayload(raw: string): UserData | null {
  try {
    const parsed = JSON.parse(raw) as UserData;
    if (
      typeof parsed.firstName === "string" &&
      typeof parsed.lastName === "string" &&
      typeof parsed.email === "string"
    ) {
      return {
        ...parsed,
        phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function readUserFromCookie(): UserData | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_COOKIE_NAME}=([^;]*)`));
    const value = match?.[1];
    if (!value) return null;
    const raw = decodeURIComponent(value);
    return parseUserPayload(raw);
  } catch {
    return null;
  }
}

function readUserFromBackupCookie(): UserData | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_BACKUP_COOKIE_NAME}=([^;]*)`));
    const value = match?.[1];
    if (!value) return null;
    const raw = decodeURIComponent(value);
    return parseUserPayload(raw);
  } catch {
    return null;
  }
}

function setUserCookie(data: UserData | null) {
  if (typeof document === "undefined") return;
  try {
    const secure = typeof window !== "undefined" && window.location?.protocol === "https:";
    if (!data) {
      document.cookie = `${USER_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${USER_BACKUP_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      return;
    }
    const value = encodeURIComponent(JSON.stringify(data));
    if (value.length > 4000) return;
    const opts = `path=/; max-age=${USER_COOKIE_MAX_AGE}; SameSite=Lax${secure ? "; Secure" : ""}`;
    document.cookie = `${USER_COOKIE_NAME}=${value}; ${opts}`;
    document.cookie = `${USER_BACKUP_COOKIE_NAME}=${value}; ${opts}`;
  } catch {
    // ignore
  }
}

function loadUserFromStorage(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const user = parseUserPayload(raw);
      if (user) return user;
    }
    const fromCookie = readUserFromCookie();
    if (fromCookie) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fromCookie));
      return fromCookie;
    }
    const fromBackup = readUserFromBackupCookie();
    if (fromBackup) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fromBackup));
      } catch {
        // ignore
      }
      setUserCookie(fromBackup);
      return fromBackup;
    }
    return null;
  } catch {
    return readUserFromCookie() ?? readUserFromBackupCookie();
  }
}

  const initialUser = useRef<UserData | null>(null);
  if (initialUser.current === null && typeof window !== "undefined") {
    initialUser.current = loadUserFromStorage();
  }
  const initial = initialUser.current;

  const [user, setUser] = useState<UserData | null>(() => initial);
  const [phase, setPhase] = useState<AppPhase>(() => (initial ? "transition" : "identification"));
  const [hydrated, setHydrated] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(() => !!initial);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  const restoreIfFound = useCallback(() => {
    const stored = loadUserFromStorage();
    if (!stored) return false;
    setUser(stored);
    setPhase("transition");
    setLoadedFromStorage(true);
    return true;
  }, []);

  useEffect(() => {
    try {
      const existing = document.cookie.includes("rebellion_visit=");
      if (!existing) {
        document.cookie = `rebellion_visit=${Date.now()}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // ignore
    }
    restoreIfFound();
    setHydrated(true);
  }, [restoreIfFound]);

  useEffect(() => {
    const t1 = setTimeout(restoreIfFound, 100);
    const t2 = setTimeout(restoreIfFound, 400);
    const t3 = setTimeout(restoreIfFound, 900);
    const onVisibility = () => {
      if (document.visibilityState === "visible") restoreIfFound();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [restoreIfFound]);

  const identify = useCallback((data: UserData) => {
    addVisitor(data);
    setUser(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUserCookie(data);
    } catch {
      setUserCookie(data);
    }
    setPhase("transition");
  }, []);

  const resetIdentification = useCallback(() => {
    setUser(null);
    setPhase("identification");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(POPUP_SEEN_KEY);
      setUserCookie(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(COOKIE_BANNER_OPEN_EVENT));
      }
    } catch {
      setUserCookie(null);
    }
  }, []);

  const tryRestoreFromDevice = useCallback((): boolean => {
    const stored = loadUserFromStorage();
    if (stored) {
      setUser(stored);
      setPhase("transition");
      setLoadedFromStorage(true);
      return true;
    }
    return false;
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isIdentified: !!user,
      phase,
      setPhase,
      identify,
      resetIdentification,
      tryRestoreFromDevice,
      loadedFromStorage,
    }),
    [user, phase, identify, resetIdentification, tryRestoreFromDevice, loadedFromStorage],
  );

  const [splashDone, setSplashDone] = useState(false);

  if (!hydrated || !splashDone) {
    return (
      <SplashScreen
        onComplete={() => {
          setSplashDone(true);
        }}
      />
    );
  }

  if (!user && phase === "identification" && !recoveryAttempted) {
    return (
      <UserContext.Provider value={value}>
        <RecoveryScreen
          onRestore={(restoredUser) => {
            setUser(restoredUser);
            setPhase("transition");
            setLoadedFromStorage(true);
            setRecoveryAttempted(true);
          }}
          onDone={() => setRecoveryAttempted(true)}
        />
      </UserContext.Provider>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function RecoveryScreen({ onRestore, onDone }: { onRestore: (user: UserData) => void; onDone: () => void }) {
  const tried = useRef(false);
  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    const stored = loadUserFromStorage();
    if (stored) {
      onRestore(stored);
      return;
    }
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onRestore, onDone]);

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center bg-black px-4" role="dialog" aria-modal="true" aria-label="Reconnexion">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black to-white/[0.02]" aria-hidden />
      <div className="relative z-10 text-center max-w-sm">
        <h1 className="font-luxury text-2xl font-semibold tracking-wide text-white md:text-3xl">
          C&apos;est bien vous ?
        </h1>
        <p className="mt-4 font-sans text-sm text-white/80">
          Reconnexion en cours…
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
