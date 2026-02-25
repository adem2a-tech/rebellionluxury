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
import { BOBOLOC_VEHICLES_URL } from "@/data/chatKnowledge";
import { ExternalLink } from "lucide-react";

const SWIPE_THRESHOLD = 50;

/** Accent Rebellion — blanc / champagne, pas jaune */
const accentIcon = "text-white/90";
const accentPrice = "text-white font-bold";

/** Icône et libellé court selon le type de forfait */
function getForfaitIconAndLabel(duration: string): { icon: React.ReactNode; title: string; subtitle: string } {
  const d = duration.toLowerCase();
  if (d.startsWith("24 heures")) return { icon: <Clock className={`w-5 h-5 ${accentIcon}`} />, title: "24 heures", subtitle: "Tarif journalier" };
  if (d.startsWith("week-end court")) return { icon: <CalendarDays className={`w-5 h-5 ${accentIcon}`} />, title: "Week-end court", subtitle: "Vendredi → Dimanche" };
  if (d.startsWith("week-end long")) return { icon: <CalendarRange className={`w-5 h-5 ${accentIcon}`} />, title: "Week-end long", subtitle: "Vendredi → Lundi" };
  if (d.startsWith("semaine courte")) return { icon: <Briefcase className={`w-5 h-5 ${accentIcon}`} />, title: "Semaine courte", subtitle: "Lundi → Vendredi (5 jours)" };
  if (d.startsWith("semaine complète")) return { icon: <Calendar className={`w-5 h-5 ${accentIcon}`} />, title: "Semaine complète", subtitle: "Location de 7 jours" };
  if (d.startsWith("mois")) return { icon: <CalendarDays className={`w-5 h-5 ${accentIcon}`} />, title: "Mois", subtitle: "Location de 30 jours" };
  return { icon: <Clock className={`w-5 h-5 ${accentIcon}`} />, title: duration.split("(")[0]?.trim() || duration, subtitle: "" };
}

const VehiculeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openChatForVehicle } = useChat();
  const vehicle = slug ? getVehicleBySlug(slug) : undefined;
  const [mainIndex, setMainIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  if (!vehicle) return <Navigate to="/vehicules" replace />;

  const imageSlides = (vehicle.images || []).slice(0, 10).map((src) => ({ type: "image" as const, src }));
  const videoSrcs = (vehicle.videos && vehicle.videos.length > 0) ? vehicle.videos.slice(0, 2) : (vehicle.video ? [vehicle.video] : []);
  const slides = [...imageSlides, ...videoSrcs.map((src) => ({ type: "video" as const, src }))];

  const openLouer = () => openChatForVehicle(vehicle.name, "Je souhaite louer ce véhicule");
  const openDispo = () => window.open(BOBOLOC_VEHICLES_URL, "_blank", "noopener,noreferrer");

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

        {/* Titre véhicule — lisible et stylé */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="vehicle-title-led mb-8 relative"
        >
          {unavailableUntil && (
            <div className="absolute -top-2 right-0 px-4 py-2 rounded-lg bg-white/15 border border-white/25 text-white text-sm font-semibold uppercase tracking-wider">
              Indisponible jusqu&apos;au {formatDate(unavailableUntil)}
            </div>
          )}
          <h1 className="font-luxury text-3xl md:text-4xl font-bold text-white tracking-[0.06em]">
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
              className="relative aspect-[4/3] min-h-[320px] overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing vehicle-image-led flex items-center justify-center"
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
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <img
                  src={slides[mainIndex].src}
                  alt={`${vehicle.name} - Vue ${mainIndex + 1}`}
                  className="w-full h-full object-contain object-center"
                />
              )}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md bg-black/80 px-3 py-2 border border-white/25">
                <img
                  src="/rebellion-luxury-logo.png"
                  alt="Rebellion Luxury"
                  className="h-8 w-8 object-contain shrink-0"
                />
                <span className="font-luxury text-white font-semibold uppercase tracking-[0.15em] text-sm">
                  Rebellion Luxury
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="shrink-0 p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                    className={`shrink-0 w-24 h-16 rounded overflow-hidden transition-opacity ${
                      i === mainIndex ? "ring-2 ring-white/50" : "opacity-80 hover:opacity-100"
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
                className="shrink-0 p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
            className="space-y-6 bg-black p-5 md:p-6 rounded-lg lg:rounded-l-none lg:rounded-r-lg vehicle-info-led vehicle-detail-scroll w-full overflow-y-auto max-h-[calc(100vh-12rem)]"
          >
            {/* Boutons Louez + Voir disponibilité */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-white hover:bg-white/95 text-black font-luxury font-semibold uppercase tracking-[0.18em] py-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.08)] transition-all duration-300"
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

            {/* Section Caractéristiques — lisible, icônes plus grandes */}
            <div>
              <h3 className="font-luxury text-white font-semibold text-lg tracking-[0.08em] pb-3 border-b border-white/25 mb-4">
                Caractéristiques
              </h3>
              <ul className="space-y-0 divide-y divide-white/10">
                <li className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Shield className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Caution
                  </span>
                  <span className="font-semibold text-white text-base tabular-nums">{specVal(s.caution)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Gauge className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Puissance
                  </span>
                  <span className="font-semibold text-white text-base">{specVal(s.power)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Car className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Type
                  </span>
                  <span className="font-semibold text-white text-base">{specVal(s.type)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Settings className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Moteur
                  </span>
                  <span className="font-semibold text-white text-base">{specVal(s.transmission)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Calendar className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Année
                  </span>
                  <span className="font-semibold text-white text-base tabular-nums">{specVal(s.year)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <DoorOpen className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Portes
                  </span>
                  <span className="font-semibold text-white text-base tabular-nums">{specVal(s.doors)}</span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-3 text-white/90 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Users className={`w-5 h-5 ${accentIcon}`} />
                    </span>
                    Sièges
                  </span>
                  <span className="font-semibold text-white text-base tabular-nums">{specVal(s.seats)}</span>
                </li>
              </ul>
            </div>

            {/* Section Tarifs de location — cartes lisibles et stylées */}
            <div>
              <h3 className="font-luxury text-white font-semibold text-lg tracking-[0.08em] pb-3 border-b border-white/25 mb-4 flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${accentIcon}`} />
                Tarifs de location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {vehicle.pricing.map((tier, i) => {
                  const { icon, title, subtitle } = getForfaitIconAndLabel(tier.duration);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl bg-white/[0.06] border border-white/20 p-4 flex flex-col gap-2 hover:border-white/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                            {icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-base leading-tight">{title}</p>
                            {subtitle && (
                              <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>
                            )}
                          </div>
                        </div>
                        <span className={`${accentPrice} text-lg shrink-0 tabular-nums`}>
                          {tier.price}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm font-medium">
                        {tier.km} inclus
                      </p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-white/[0.06] border border-white/20 px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Lock className="w-5 h-5 text-white/90" />
                    </span>
                    <div>
                      <p className="text-white font-medium text-base">Caution requise</p>
                      <p className="text-white/70 text-sm">Empreinte bancaire ou dépôt de garantie</p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-base shrink-0 tabular-nums">{vehicle.specs.caution}</span>
                </div>
                <div className="rounded-xl bg-white/[0.06] border border-white/20 px-4 py-3 flex items-center gap-3">
                  <Info className="w-5 h-5 text-white/80 shrink-0" />
                  <p className="text-white/90 text-sm">
                    Kilomètre supplémentaire : <span className="font-semibold text-white">{vehicle.extraKmPriceChf ?? 5} CHF/km</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Disponibilités en temps réel — lien Boboloc */}
            <div>
              <h3 className="font-luxury text-white font-semibold text-lg tracking-[0.08em] pb-3 border-b border-white/25 mb-4">
                Disponibilités
              </h3>
              <p className="text-white/80 text-base leading-relaxed mb-4">
                Les disponibilités sont mises à jour en temps réel sur notre partenaire Boboloc. Cliquez pour consulter le calendrier à jour.
              </p>
              <Button
                variant="outline"
                className="w-full border-white/40 text-white hover:bg-white/10 gap-2"
                onClick={openDispo}
              >
                Voir les disponibilités en temps réel
                <ExternalLink className="w-4 h-4 shrink-0" />
              </Button>
            </div>
          </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VehiculeDetail;
