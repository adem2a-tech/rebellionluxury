import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { getAllVehicles } from "@/data/vehicles";
import { getApprovedVehicles } from "@/data/vehicleRequests";
import { useVehicleRequests } from "@/contexts/VehicleRequestsContext";
import { getUnavailableUntil } from "@/data/vehicleReservations";
import { useReservations } from "@/contexts/ReservationContext";

interface VehiclesSectionProps {
  onAskQuestion?: (vehicleName: string) => void;
  /** Afficher uniquement les véhicules issus de demandes acceptées (hors Rebellion) */
  onlyHorsRebellion?: boolean;
}

function isVideoUrl(url: string): boolean {
  if (url.startsWith("data:video/")) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

/** Carrousel images + vidéos (vidéos à la fin) : centré, sans bordures */
function VehicleCardCarousel({ images, videos = [], badgeLabel = "Rebellion" }: { images: string[]; videos?: string[]; badgeLabel?: string }) {
  const [index, setIndex] = useState(0);
  const slides = [...images.slice(0, 10), ...videos.slice(0, 2)];
  const count = slides.length;
  const currentSrc = count > 0 ? slides[index % count] : null;
  const isVideo = currentSrc ? isVideoUrl(currentSrc) : false;

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  if (count === 0) {
    return (
      <div className="relative aspect-[3/2] bg-zinc-900 shrink-0 w-full flex items-center justify-center text-zinc-500 text-sm">
        Aucun média
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[3/2] bg-zinc-900 overflow-hidden shrink-0 w-full select-none z-20 rounded-t-2xl"
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label="Carrousel photos et vidéos"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {currentSrc && isVideo ? (
            <motion.video
              key={index}
              src={currentSrc}
              className="max-w-full max-h-full w-full h-full object-contain object-center pointer-events-none"
              controls
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          ) : currentSrc ? (
            <motion.img
              key={index}
              src={currentSrc}
              alt=""
              className="max-w-full max-h-full w-full h-full object-contain object-center pointer-events-none"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      {/* Légère ombre en bas pour transition vers le contenu */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/15 px-2.5 py-1.5 text-[10px] font-semibold text-white/95 uppercase tracking-wider pointer-events-none">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-white text-[8px] font-bold">R</span>
        {badgeLabel}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:border-white/20 text-white flex items-center justify-center z-30 cursor-pointer border touch-manipulation transition-colors"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5 pointer-events-none" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:border-white/20 text-white flex items-center justify-center z-30 cursor-pointer border touch-manipulation transition-colors"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5 pointer-events-none" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2 z-30 pointer-events-auto">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer border-0 touch-manipulation flex-shrink-0 ${
                    i === index % count ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
              className="text-[10px] uppercase tracking-wider text-white/90 hover:text-white bg-white/15 hover:bg-white/25 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer touch-manipulation transition-colors"
              aria-label="Photo suivante"
            >
              Photo suivante
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const VehiclesSection = ({ onAskQuestion, onlyHorsRebellion = false }: VehiclesSectionProps) => {
  const { version } = useVehicleRequests();
  const { version: reservationsVersion } = useReservations();
  const vehicles = onlyHorsRebellion ? getApprovedVehicles() : getAllVehicles();

  return (
    <section id="vehicles" className="py-20 lg:py-32 relative font-display">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 15, translateZ: -60 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.span
            className="inline-block px-4 py-2 rounded-full border border-white/20 bg-white/5 text-primary text-sm font-medium tracking-wide mb-5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -1 }}
          >
            {onlyHorsRebellion ? "Catalogue des particuliers" : "Notre Flotte"}
          </motion.span>
          <p className="font-display text-base md:text-lg text-muted-foreground font-medium mb-3 tracking-wide uppercase">
            {onlyHorsRebellion ? "Loués par des particuliers via notre plateforme" : "L'excellence au volant — L'émotion en Suisse romande"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 tracking-tight text-foreground">
            {onlyHorsRebellion ? <>Véhicules des <span className="text-gradient-orange">particuliers</span></> : <>Nos <span className="text-gradient-orange">véhicules</span> d&apos;exception</>}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6" />
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            {onlyHorsRebellion
              ? "Ces véhicules sont proposés par des propriétaires qui les louent via Rebellion Luxury. Même exigence de qualité et de service."
              : "Chaque véhicule est méticuleusement entretenu pour vous offrir une expérience de conduite inoubliable. Supercars de prestige, conditions transparentes et un service sur mesure pour vos envies de liberté."}
          </p>
          {!onlyHorsRebellion && (
          <motion.a
            href="https://www.tiktok.com/@rebellion.luxury"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary/90 font-medium hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg transition-colors"
            aria-label="Suivre Rebellion Luxury sur TikTok"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Music2 className="w-5 h-5" />
            Suivez-nous sur TikTok
          </motion.a>
          )}
        </motion.div>

        {/* Grille catalogue pleine largeur — thème sombre type NERO */}
        <div className="w-full">
          {vehicles.length === 0 && onlyHorsRebellion ? (
            <p className="text-center text-muted-foreground py-12">Aucun véhicule de particulier pour le moment. Les véhicules acceptés via « Loue ton propre véhicule » apparaîtront ici.</p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {vehicles.map((vehicle) => {
                    const slug = vehicle.slug;
                    const unavailableUntil = getUnavailableUntil(vehicle.name);
                    const formatDate = (d: string) => {
                      const [y, m, day] = d.split("-");
                      return `${day}/${m}`;
                    };
                    const v = vehicle as {
                      slug?: string;
                      name: string;
                      year?: number;
                      pricePerDay?: number;
                      location?: string;
                      category?: string;
                      images?: string[];
                      video?: string;
                      specs?: { power?: string };
                    };
                    /* Liste d’images pour le carrousel (imports Vite = URLs string) */
                    const imageList: string[] = Array.isArray(v.images)
                      ? v.images.slice(0, 10).map((x) => (typeof x === "string" ? x : String(x)))
                      : [];
                    const videoList: string[] = (v.videos && v.videos.length > 0)
                      ? v.videos.slice(0, 2)
                      : (v.video ? [v.video] : []);
                    const locationLabel = v.location ?? "";
                    const yearLabel = v.year != null ? v.year : "";
                    const categoryLabel = v.category ?? "";
                    const detailUrl = slug ? `/vehicules/${slug}` : "/vehicules";
                    return (
                      <motion.article
                        key={vehicle.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                        className="w-full relative"
                      >
                        <div className="relative h-full block group">
                          <div className="relative rounded-2xl overflow-hidden h-full min-h-[360px] flex flex-col bg-black/90 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                            <VehicleCardCarousel images={imageList} videos={videoList} badgeLabel={onlyHorsRebellion ? "Particulier" : "Rebellion"} />
                            {onlyHorsRebellion && (
                              <p className="px-4 py-2 text-xs text-zinc-500 bg-zinc-900/80 border-t border-white/5">
                                Ce véhicule n&apos;appartient pas à Rebellion Luxury
                              </p>
                            )}
                            {unavailableUntil && (
                              <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-amber-500/95 text-black text-xs font-semibold uppercase shadow-lg">
                                Indisponible jusqu&apos;au {formatDate(unavailableUntil)}
                              </div>
                            )}
                            <Link
                              to={detailUrl}
                              className="p-5 flex flex-col gap-2 shrink-0 bg-gradient-to-b from-black/95 to-black cursor-pointer block hover:from-white/[0.06] hover:to-black/95 transition-colors rounded-b-2xl border-t border-white/10"
                            >
                              <p className="font-display font-semibold text-base text-white uppercase tracking-tight leading-tight">
                                {v.name}
                                {v.specs?.power && ` — ${v.specs.power}`}
                                {locationLabel && ` (${locationLabel})`}
                              </p>
                              {v.pricePerDay != null && (
                                <p className="text-sm text-muted-foreground font-medium">
                                  À partir de <span className="text-foreground">{v.pricePerDay.toLocaleString("fr-CH")} CHF</span> <span className="text-muted-foreground/80">/ 24h</span>
                                </p>
                              )}
                              <div className="pt-2">
                                <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors group-hover:bg-white group-hover:text-black">
                                  Voir le véhicule
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
          </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VehiclesSection;
