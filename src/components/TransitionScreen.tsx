import { useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";

const TRANSITION_DURATION_MS = 2500;

type TransitionScreenProps = {
  onComplete: () => void;
};

export default function TransitionScreen({ onComplete }: TransitionScreenProps) {
  const { user } = useUser();
  const firstName = user?.firstName ?? "";

  useEffect(() => {
    const t = setTimeout(onComplete, TRANSITION_DURATION_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/welcome-transition.jpg)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"
        aria-hidden
      />
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
          Bienvenue{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-4 text-lg text-white/90 drop-shadow">
          Rebellion Luxury
        </p>
      </motion.div>
    </div>
  );
}
