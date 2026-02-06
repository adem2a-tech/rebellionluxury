import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type VehicleChatContext = { vehicleName: string } | null;

type ChatContextValue = {
  isOpen: boolean;
  initialMessage: string;
  vehicleContext: VehicleChatContext;
  openChat: (initialMessage?: string) => void;
  openChatForVehicle: (vehicleName: string, initialMessage?: string) => void;
  toggleChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [vehicleContext, setVehicleContext] = useState<VehicleChatContext>(null);

  const openChat = useCallback((message?: string) => {
    setVehicleContext(null);
    setInitialMessage(message ?? "");
    setIsOpen(true);
  }, []);

  const openChatForVehicle = useCallback((vehicleName: string, message?: string) => {
    setVehicleContext({ vehicleName });
    setInitialMessage(message ?? "");
    setIsOpen(true);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setInitialMessage("");
        setVehicleContext(null);
      }
      return !prev;
    });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({ isOpen, initialMessage, vehicleContext, openChat, openChatForVehicle, toggleChat }),
    [isOpen, initialMessage, vehicleContext, openChat, openChatForVehicle, toggleChat],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
