import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ReidentifyTab() {
  const { resetIdentification } = useUser();

  return (
    <motion.button
      type="button"
      onClick={resetIdentification}
      className="fixed bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-muted-foreground hover:text-primary transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Se réidentifier"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <LogOut className="w-4 h-4 shrink-0" aria-hidden />
      <span>Se réidentifier</span>
    </motion.button>
  );
}
