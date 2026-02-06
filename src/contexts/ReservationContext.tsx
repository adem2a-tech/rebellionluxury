import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ReservationContextValue {
  version: number;
  refresh: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <ReservationContext.Provider value={{ version, refresh }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  return ctx ?? { version: 0, refresh: () => {} };
}
