import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import { recordVisit } from "@/data/adminAnalytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import WelcomePopup from "@/components/WelcomePopup";
import ReidentifyTab from "@/components/ReidentifyTab";

const POPUP_SEEN_KEY = "rebellion_popup_seen";

type SiteLayoutInnerProps = {
  justFinishedTransition: boolean;
};

function SiteLayoutInner({ justFinishedTransition }: SiteLayoutInnerProps) {
  const location = useLocation();
  const { isOpen, initialMessage, openChat, toggleChat } = useChat();

  useEffect(() => {
    recordVisit(location.pathname || "/");
  }, [location.pathname]);
  const showWelcomePopup =
    justFinishedTransition ||
    (typeof window !== "undefined" && !localStorage.getItem(POPUP_SEEN_KEY));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <a
        href="#hero"
        className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:w-auto focus:h-auto focus:overflow-visible focus:[clip:auto] focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      >
        Aller au contenu
      </a>
      <Header onOpenChat={openChat} />
      <main className="min-h-[60vh]">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <AIAssistant
        isOpen={isOpen}
        onToggle={toggleChat}
        initialMessage={initialMessage}
      />
      <ReidentifyTab />
      <WelcomePopup
        key={justFinishedTransition ? "welcome-show" : "welcome-idle"}
        defaultOpen={showWelcomePopup}
        onTryIA={openChat}
      />
    </div>
  );
}

export type SiteLayoutProps = {
  justFinishedTransition: boolean;
};

export default function SiteLayout({ justFinishedTransition }: SiteLayoutProps) {
  return (
    <ChatProvider>
      <SiteLayoutInner justFinishedTransition={justFinishedTransition} />
    </ChatProvider>
  );
}
