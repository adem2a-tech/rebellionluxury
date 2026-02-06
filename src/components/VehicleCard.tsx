import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Gauge,
  Palette,
  Settings,
  Shield,
  Globe,
  Award,
  CircleDot,
} from "lucide-react";
import { CONTACT } from "@/data/chatKnowledge";

interface VehicleSpec {
  caution: string;
  power: string;
  type: string;
  transmission: string;
  boite?: string;
  year: number;
  doors: number;
  seats: number;
  exteriorColor?: string;
  interiorColor?: string;
  kilometers?: string;
  warranty?: string;
}

interface PricingTier {
  duration: string;
  km: string;
  price: string;
}

interface VehicleCardProps {
  index?: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  slug?: string;
  name: string;
  description?: string;
  video?: string;
  images: string[];
  specs: VehicleSpec;
  pricing: PricingTier[];
  onOpenChatForVehicle?: (vehicleName: string, initialMessage?: string) => void;
}

type Slide = { type: "video"; src: string } | { type: "image"; src: string };

const EMPTY_SPEC = "—";

const VehicleCard = ({
  index,
  isHighlighted = false,
  isDimmed = false,
  onMouseEnter,
  onMouseLeave,
  slug,
  name,
  video,
  images,
  specs,
  onOpenChatForVehicle,
}: VehicleCardProps) => {
  const slides: Slide[] = video
    ? [{ type: "video", src: video }, ...images.map((src) => ({ type: "image" as const, src }))]
    : images.map((src) => ({ type: "image" as const, src }));

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const s = specs;
  const openPrice = () => onOpenChatForVehicle?.(name, "Quel est le prix pour ce véhicule ?");
  const openCallback = () => onOpenChatForVehicle?.(name, "Je souhaite être rappelé");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: 8, translateZ: -40 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0, translateZ: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{
        scale: isHighlighted ? 1.05 : isDimmed ? 0.94 : 1,
        y: isHighlighted ? -16 : isDimmed ? 8 : 0,
        zIndex: isHighlighted ? 20 : isDimmed ? 0 : 10,
        rotateY: isHighlighted ? 2 : isDimmed ? -2 : 0,
        opacity: isDimmed ? 0.88 : 1,
        boxShadow: isHighlighted
          ? "0 32px 80px -20px hsl(0 0% 100% / 0.2)"
          : isDimmed
            ? "0 8px 24px -8px rgba(0,0,0,0.2)"
            : "0 16px 48px -16px rgba(0,0,0,0.15)",
      }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
      className={`group glass-card rounded-2xl overflow-hidden border transition-all duration-300 [backface-visibility:visible] relative ${isHighlighted ? "border-primary/50" : "border-border"}`}
    >
      {/* Bandeau titre — nom véhicule (fond blanc, texte noir) */}
      {slug ? (
        <Link
          to={`/vehicules/${slug}`}
          className="block font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-black bg-white px-4 py-3 hover:bg-zinc-100 transition-colors"
        >
          {name}
        </Link>
      ) : (
        <div className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-black bg-white px-4 py-3">
          {name}
        </div>
      )}

      {/* Grille 2 colonnes : gauche = image + galerie, droite = 3 boutons + specs */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0">
        {/* Colonne gauche : image fond noir + logo overlay + bande miniatures avec flèches */}
        <div className="space-y-2 p-2 lg:p-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            {slides[currentIndex].type === "video" ? (
              <video
                key="video"
                autoPlay
                loop
                muted
                playsInline
                src={slides[currentIndex].src}
                className="w-full h-full object-contain"
                aria-label={`Vidéo ${name}`}
              />
            ) : (
              <img
                src={typeof slides[currentIndex].src === "string" ? slides[currentIndex].src : ""}
                alt={`${name} - Vue ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            )}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1.5 border border-amber-500/50">
              <img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="h-6 w-6 object-contain"
              />
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-xs">
                Rebellion Luxury
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevSlide}
              className="shrink-0 p-1.5 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1 overflow-x-auto flex-1 min-w-0 py-0.5">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                    i === currentIndex ? "border-amber-500" : "border-border hover:border-amber-500/50"
                  }`}
                >
                  {slide.type === "video" ? (
                    <video src={slide.src} muted className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={typeof slide.src === "string" ? slide.src : ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={nextSlide}
              className="shrink-0 p-1.5 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Colonne droite : 3 boutons + liste specs */}
        <div className="space-y-3 p-3 lg:p-4 border-t lg:border-t-0 lg:border-l border-border bg-card/30">
          <Button
            size="sm"
            className="w-full bg-[#D4A574] hover:bg-[#c4956a] text-black font-semibold uppercase tracking-wider py-4 rounded-none flex items-center justify-center gap-2 text-sm"
            onClick={openPrice}
          >
            Demander le prix
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full bg-black hover:bg-zinc-900 text-white font-semibold uppercase tracking-wider py-4 rounded-none flex items-center justify-center gap-2 text-sm"
            onClick={openCallback}
          >
            Rappel demandé
            <ChevronRight className="w-4 h-4" />
          </Button>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-none bg-black hover:bg-zinc-900 text-white font-semibold uppercase tracking-wider text-sm transition-colors"
          >
            Contacter par WhatsApp
            <Download className="w-4 h-4" />
          </a>

          <div className="border border-border rounded overflow-hidden bg-background/50">
            <ul className="divide-y divide-border/50">
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  Année
                </span>
                <span className="font-medium text-xs">{s.year}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <CircleDot className="w-4 h-4 text-amber-500 shrink-0" />
                  Kilométrage
                </span>
                <span className="font-medium text-xs">{s.kilometers ?? EMPTY_SPEC}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Settings className="w-4 h-4 text-amber-500 shrink-0" />
                  Transmission
                </span>
                <span className="font-medium text-xs">{s.transmission}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Palette className="w-4 h-4 text-amber-500 shrink-0" />
                  Couleur ext.
                </span>
                <span className="font-medium text-xs">{s.exteriorColor ?? EMPTY_SPEC}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Palette className="w-4 h-4 text-amber-500 shrink-0" />
                  Couleur int.
                </span>
                <span className="font-medium text-xs">{s.interiorColor ?? EMPTY_SPEC}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Gauge className="w-4 h-4 text-amber-500 shrink-0" />
                  Puissance
                </span>
                <span className="font-medium text-xs">{s.power}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Settings className="w-4 h-4 text-amber-500 shrink-0" />
                  Motorisation
                </span>
                <span className="font-medium text-xs">{s.boite ?? EMPTY_SPEC}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                  Specs
                </span>
                <span className="font-medium text-xs">{s.type}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  Garantie
                </span>
                <span className="font-medium text-xs">{s.warranty ?? EMPTY_SPEC}</span>
              </li>
              <li className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                  Caution
                </span>
                <span className="font-medium text-xs">{s.caution}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
