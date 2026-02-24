import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";

interface HeroProps {
  onOpenChat?: () => void;
  onCheckAvailability?: () => void;
}

const Hero = ({ onOpenChat, onCheckAvailability }: HeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const playAttemptRef = useRef(false);
  const showPlayButtonRef = useRef(showPlayButton);
  showPlayButtonRef.current = showPlayButton;

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || playAttemptRef.current) return;
    playAttemptRef.current = true;

    try {
      video.muted = true; // requis pour autoplay sur iOS / mobile
      video.playsInline = true;
      await video.play();
      setShowPlayButton(false);
    } catch {
      setShowPlayButton(true);
    } finally {
      playAttemptRef.current = false;
    }
  }, []);

  // Lecture au montage — canplay = prêt pour mobile (plus fiable que loadeddata)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => {
      // court délai : certains mobiles ont besoin que le viewport soit prêt
      requestAnimationFrame(() => {
        requestAnimationFrame(() => attemptPlay());
      });
    };

    if (video.readyState >= 3) {
      onCanPlay();
    } else {
      video.addEventListener("canplay", onCanPlay, { once: true });
    }

    return () => video.removeEventListener("canplay", onCanPlay);
  }, [attemptPlay]);

  // Reprise quand l'utilisateur revient sur l'onglet (iOS met en pause en arrière-plan)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const video = videoRef.current;
      if (!video || !video.paused || showPlayButtonRef.current) return;
      video.muted = true;
      video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const handlePlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().then(() => setShowPlayButton(false)).catch(() => {});
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      aria-label="Accueil"
    >
      {/* Fond : vidéo Audi R8 (lecture auto, muet, boucle) — apparition en douceur */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Vidéo en plein écran : remplit toute la section Hero */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-background.png"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover object-center hero-background-media"
          aria-hidden="true"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
          <source src="/hero-background.webm" type="video/webm" />
        </video>
        {/* Bouton lecture visible uniquement si autoplay bloqué (ex. mobile) */}
        {showPlayButton && (
          <button
            type="button"
            onClick={handlePlayClick}
            className="absolute inset-0 z-[1] flex items-center justify-center bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Lancer la vidéo"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95">
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </span>
          </button>
        )}
        {/* Overlays sombres — vidéo visible, teinte sombre sans reflets blancs */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/55" />
        {/* Vignette légère */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 15, translateZ: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <motion.span
              className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6"
              whileHover={{ scale: 1.05, translateZ: 8 }}
              transition={{ duration: 0.3 }}
            >
              🇨🇭 Suisse Romande • Location Premium
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, rotateX: 12, translateZ: -50 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            className="font-display text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Location de{" "}
            <span className="text-gradient-orange">véhicule haute gamme</span>
            <br />
            en Suisse romande
          </motion.h1>

          <motion.p
            id="why-ai"
            initial={{ opacity: 0, y: 40, rotateX: 10, translateZ: -30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed scroll-mt-24"
          >
            Découvrez notre flotte exclusive de supercars et posez vos questions
            à <span className="text-primary font-semibold">Rebellion IA</span>, notre assistant intelligent
            qui connaît tout le site sur le bout des doigts — posez-lui toutes les questions imaginables !
          </motion.p>

        </div>
      </div>

      {/* Scroll indicator — centré sur tous les écrans */}
      <motion.div
          initial={{ opacity: 0, y: 20, translateZ: -20 }}
          animate={{ opacity: 1, y: 0, translateZ: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          style={{ transformStyle: "preserve-3d" }}
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 12, 0], rotateX: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
            style={{ transformStyle: "preserve-3d", perspective: 200 }}
          >
            <span className="text-sm">Découvrir</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
    </section>
  );
};

export default Hero;
