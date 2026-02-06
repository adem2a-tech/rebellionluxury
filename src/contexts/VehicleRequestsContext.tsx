import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface VehicleRequestsContextValue {
  version: number;
  refresh: () => void;
}

const VehicleRequestsContext = createContext<VehicleRequestsContextValue | null>(null);

export function VehicleRequestsProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <VehicleRequestsContext.Provider value={{ version, refresh }}>
      {children}
    </VehicleRequestsContext.Provider>
  );
}

export function useVehicleRequests() {
  const ctx = useContext(VehicleRequestsContext);
  return ctx ?? { version: 0, refresh: () => {} };
}
