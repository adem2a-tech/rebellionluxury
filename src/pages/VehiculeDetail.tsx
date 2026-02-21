import React, { useState, useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Gauge,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Car,
  DoorOpen,
  Users,
  Clock,
  Briefcase,
  Lock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";
import { getVehicleBySlug } from "@/data/vehicles";
import { getUnavailableUntil } from "@/data/vehicleReservations";
import { ExternalLink } from "lucide-react";

const SWIPE_THRESHOLD = 50;

/** Icône et libellé court selon le type de forfait */
function getForfaitIconAndLabel(duration: string): { icon: React.ReactNode; title: string; subtitle: string } {
  const d = duration.toLowerCase();
  if (d.startsWith("24 heures")) return { icon: <Clock className="w-5 h-5 text-[#D4A574]" />, title: "24 heures", subtitle: "Tarif journalier" };
  if (d.startsWith("week-end court")) return { icon: <CalendarDays className="w-5 h-5 text-[#D4A574]" />, title: "Week-end court", subtitle: "Vendredi → Dimanche" };
  if (d.startsWith("week-end long")) return { icon: <CalendarRange className="w-5 h-5 text-[#D4A574]" />, title: "Week-end long", subtitle: "Vendredi → Lundi" };
  if (d.startsWith("semaine courte")) return { icon: <Briefcase className="w-5 h-5 text-[#D4A574]" />, title: "Semaine courte", subtitle: "Lundi → Vendredi (5 jours)" };
  if (d.startsWith("semaine complète")) return { icon: <Calendar className="w-5 h-5 text-[#D4A574]" />, title: "Semaine complète", subtitle: "Location de 7 jours" };
  if (d.startsWith("mois")) return { icon: <CalendarDays className="w-5 h-5 text-[#D4A574]" />, title: "Mois", subtitle: "Location de 30 jours" };
  return { icon: <Clock className="w-5 h-5 text-[#D4A574]" />, title: duration.split("(")[0]?.trim() || duration, subtitle: "" };
}

const VehiculeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openChatForVehicle } = useChat();
  const vehicle = slug ? getVehicleBySlug(slug) : undefined;
  const [mainIndex, setMainIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  if (!vehicle) return <Navigate to="/vehicules" replace />;

  const slides = vehicle.video
    ? [...vehicle.images.map((src) => ({ type: "image" as const, src })), { type: "video" as const, src: vehicle.video }]
    : vehicle.images.map((src) => ({ type: "image" as const, src }));

  const openLouer = () => openChatForVehicle(vehicle.name, "Je souhaite louer ce véhicule");
  const availabilityUrl = vehicle.availabilityUrl;
  const openDispo = () => {
    if (availabilityUrl) window.open(availabilityUrl, "_blank", "noopener,noreferrer");
    else openChatForVehicle(vehicle.name, "Je voudrais voir la disponibilité de ce véhicule");
  };

  const s = vehicle.specs;
  /** Affiche une valeur propre : "—" si vide ou placeholder type "À définir" sans abréviation gênante */
  const specVal = (v: string | number | undefined): string => {
    if (v === undefined || v === null) return "—";
    const str = String(v).trim();
    if (!str) return "—";
    return str;
  };
  const unavailableUntil = getUnavailableUntil(vehicle.name);
  const formatDate = (d: string) => {
    const [, m, day] = d.split("-");
    return `${day}/${m}`;
  };
  const goPrev = () => setMainIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setMainIndex((i) => (i + 1) % slides.length);

  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/vehicules">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour aux véhicules
            </Link>
          </Button>
        </motion.div>

        {/* Titre véhicule — 3D + LED blanche sur les bords */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="vehicle-title-led mb-8 relative"
        >
          {unavailableUntil && (
            <div className="absolute -top-2 right-0 px-4 py-2 rounded-lg bg-amber-500/90 text-black text-sm font-semibold uppercase">
              Indisponible jusqu&apos;au {formatDate(unavailableUntil)}
            </div>
          )}
          <h1
            className="font-description text-2xl md:text-3xl font-semibold text-foreground tracking-wide"
            style={{
              textShadow:
                "1px 1px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.4), 3px 3px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {vehicle.name}
          </h1>
        </motion.div>

        <section className="vehicle-detail">
          {/* Bloc gauche : médias (fond noir) — style Exotic Cars */}
          <div className="vehicle-detail__left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            <div
              className="relative aspect-[4/3] min-h-[320px] overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing vehicle-image-led"
              onTouchStart={(e) => { touchStartX.current = e.targetTouches[0]?.clientX ?? null; }}
              onTouchEnd={(e) => {
                if (touchStartX.current == null || slides.length <= 1) { touchStartX.current = null; return; }
                const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
                const delta = touchStartX.current - endX;
                touchStartX.current = null;
                if (Math.abs(delta) < SWIPE_THRESHOLD) return;
                if (delta > 0) goNext();
                else goPrev();
              }}
              onMouseDown={(e) => { if (slides.length > 1) mouseStartX.current = e.clientX; }}
              onMouseMove={(e) => e.buttons === 0 && (mouseStartX.current = null)}
              onMouseLeave={() => (mouseStartX.current = null)}
              onMouseUp={(e) => {
                if (mouseStartX.current == null || slides.length <= 1) { mouseStartX.current = null; return; }
                const delta = mouseStartX.current - e.clientX;
                mouseStartX.current = null;
                if (Math.abs(delta) < SWIPE_THRESHOLD) return;
                if (delta > 0) goNext();
                else goPrev();
              }}
            >
              {slides[mainIndex].type === "video" ? (
                <video
                  key="video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={slides[mainIndex].src}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={slides[mainIndex].src}
                  alt={`${vehicle.name} - Vue ${mainIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              )}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md bg-black/70 px-3 py-2 border border-amber-500/50">
                <img
                  src="/rebellion-luxury-logo.png"
                  alt="Rebellion Luxury"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-sm">
                  Rebellion Luxury
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="shrink-0 p-2 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2 overflow-x-auto flex-1 min-w-0 py-1">
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMainIndex(i)}
                    className={`shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-colors ${
                      i === mainIndex
                        ? "border-amber-500"
                        : "border-border hover:border-amber-500/50"
                    }`}
                  >
                    {slide.type === "video" ? (
                      <video src={slide.src} muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={slide.src} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="shrink-0 p-2 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
          </div>

          {/* Bloc droit : Louez + Voir disponibilité + Caractéristiques + Prix */}
          <div className="vehicle-detail__right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5 bg-black p-5 rounded-lg lg:rounded-l-none lg:rounded-r-lg vehicle-info-led w-full overflow-y-auto max-h-[calc(100vh-12rem)]"
          >
            {/* Boutons Louez + Voir disponibilité */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-[#D4A574] hover:bg-[#c4956a] text-white font-semibold uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2"
                onClick={openLouer}
              >
                Louez
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 border border-white/30"
                onClick={openDispo}
              >
                Voir disponibilité
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Section Caractéristiques */}
            <div>
              <h3 className="text-white font-semibold text-base pb-2 border-b border-white/30 mb-3">
                Caractéristiques
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Shield className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Caution
                  </span>
                  <span className="font-semibold text-white">{specVal(s.caution)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Gauge className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Puissance
                  </span>
                  <span className="font-semibold text-white">{specVal(s.power)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Car className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Type de véhicule
                  </span>
                  <span className="font-semibold text-white">{specVal(s.type)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Settings className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Moteur
                  </span>
                  <span className="font-semibold text-white">{specVal(s.transmission)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Calendar className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Année
                  </span>
                  <span className="font-semibold text-white">{specVal(s.year)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <DoorOpen className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Portes
                  </span>
                  <span className="font-semibold text-white">{specVal(s.doors)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-white/90">
                    <Users className="w-4 h-4 text-[#D4A574] shrink-0" />
                    Sièges
                  </span>
                  <span className="font-semibold text-white">{specVal(s.seats)}</span>
                </li>
              </ul>
            </div>

            {/* Section Tarifs de location — cartes avec icônes */}
            <div>
              <h3 className="text-white font-semibold text-lg pb-2 border-b border-white/30 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4A574]" />
                Tarifs de location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {vehicle.pricing.map((tier, i) => {
                  const { icon, title, subtitle } = getForfaitIconAndLabel(tier.duration);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl bg-white/5 border border-white/15 p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {icon}
                          <div>
                            <p className="text-white font-medium text-sm">{title}</p>
                            {subtitle && (
                              <p className="text-white/60 text-xs">{subtitle}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#D4A574] text-base shrink-0">
                          {tier.price}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">{tier.km} inclus</p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-amber-100 font-medium text-sm">Caution requise</p>
                      <p className="text-amber-200/70 text-xs">Empreinte bancaire ou dépôt de garantie</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-200 text-sm shrink-0">{vehicle.specs.caution}</span>
                </div>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2.5 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-blue-100/90 text-sm">
                    Kilomètre supplémentaire : <span className="font-semibold text-blue-200">{vehicle.extraKmPriceChf ?? 5} CHF/km</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Disponibilités en temps réel — lien Boboloc */}
            <div>
              <h3 className="text-white font-semibold text-base pb-2 border-b border-white/30 mb-3">
                Disponibilités
              </h3>
              <p className="text-white/70 text-sm mb-3">
                Les disponibilités sont mises à jour en temps réel sur notre partenaire Boboloc. Cliquez pour consulter le calendrier à jour.
              </p>
              {availabilityUrl ? (
                <Button
                  variant="outline"
                  className="w-full border-white/40 text-white hover:bg-white/10 gap-2"
                  onClick={() => window.open(availabilityUrl, "_blank", "noopener,noreferrer")}
                >
                  Voir les disponibilités en temps réel
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-white/40 text-white hover:bg-white/10"
                  onClick={() => openChatForVehicle(vehicle.name, "Je voudrais voir la disponibilité")}
                >
                  Demander les disponibilités
                </Button>
              )}
            </div>
          </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VehiculeDetail;
