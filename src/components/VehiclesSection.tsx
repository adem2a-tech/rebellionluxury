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

/** Carrousel d’images par carte : boutons uniquement (flèches, points, bouton photo suivante) */
function VehicleCardCarousel({ images, badgeLabel = "Rebellion" }: { images: string[]; badgeLabel?: string }) {
  const [index, setIndex] = useState(0);

  const count = images.length;
  const currentSrc = count > 0 ? images[index % count] : null;

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  if (count === 0) {
    return (
      <div className="relative aspect-[3/2] bg-zinc-900 shrink-0 w-full flex items-center justify-center text-zinc-500 text-sm">
        Aucune image
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[3/2] bg-zinc-900 overflow-hidden shrink-0 w-full select-none z-20 border-2 border-white rounded-t-xl"
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label="Carrousel photos"
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          {currentSrc && (
            <motion.img
              key={index}
              src={currentSrc}
              alt=""
              className="w-full h-full object-cover pointer-events-none absolute inset-0"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-black/70 border border-white/20 px-2 py-1 text-[10px] font-medium text-white/90 uppercase tracking-wider pointer-events-none">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white text-[8px] font-bold">R</span>
        {badgeLabel}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center z-30 cursor-pointer border-0 touch-manipulation"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5 pointer-events-none" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center z-30 cursor-pointer border-0 touch-manipulation"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5 pointer-events-none" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2 z-30 pointer-events-auto">
            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }}
                  className={`w-3 h-3 rounded-full transition-colors cursor-pointer border-0 touch-manipulation flex-shrink-0 ${
                    i === index % count ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
              className="text-[10px] uppercase tracking-wider text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded cursor-pointer border-0 touch-manipulation"
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
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {onlyHorsRebellion ? "Véhicules hors Rebellion" : "Notre Flotte"}
          </motion.span>
          <p className="font-display text-lg md:text-xl text-primary font-semibold mb-2">
            {onlyHorsRebellion ? "Loués par des particuliers via notre plateforme" : "L'excellence au volant — L'émotion en Suisse romande"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {onlyHorsRebellion ? <>Véhicules des <span className="text-gradient-orange">particuliers</span></> : <>Nos <span className="text-gradient-orange">véhicules</span> d'exception</>}
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            {onlyHorsRebellion
              ? "Ces véhicules sont proposés par des propriétaires qui les louent via Rebellion Luxury. Même exigence de qualité et de service."
              : "Chaque véhicule est méticuleusement entretenu pour vous offrir une expérience de conduite inoubliable. Supercars de prestige, conditions transparentes et un service sur mesure pour vos envies de liberté."}
          </p>
          {!onlyHorsRebellion && (
          <motion.a
            href="https://www.tiktok.com/@rebellion.luxury"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
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
            <p className="text-center text-muted-foreground py-12">Aucun véhicule hors Rebellion pour le moment. Les véhicules acceptés via « Loue ton propre véhicule » apparaîtront ici.</p>
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
                    const mediaList: string[] = Array.isArray(v.images)
                      ? v.images.map((x) => (typeof x === "string" ? x : String(x)))
                      : [];
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
                        <div className="relative h-full block">
                          <div className="relative rounded-xl overflow-hidden h-full min-h-[360px] flex flex-col border-2 border-black bg-black shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]">
                            <VehicleCardCarousel images={mediaList} badgeLabel={onlyHorsRebellion ? "Particulier" : "Rebellion"} />
                            {unavailableUntil && (
                              <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-amber-500/90 text-black text-xs font-semibold uppercase">
                                Indisponible jusqu&apos;au {formatDate(unavailableUntil)}
                              </div>
                            )}
                            <Link
                              to={detailUrl}
                              className="p-4 flex flex-col gap-1 shrink-0 bg-black cursor-pointer block hover:bg-zinc-900/50 transition-colors rounded-b-xl"
                            >
                              <p className="font-display font-semibold text-base text-white uppercase tracking-tight">
                                {v.name}
                                {v.specs?.power && ` - ${v.specs.power}`}
                                {locationLabel && ` (${locationLabel})`}
                              </p>
                              {v.pricePerDay != null && (
                                <p className="text-sm text-zinc-400">
                                  A partir de {v.pricePerDay.toLocaleString("fr-CH")} CHF (2 jours)
                                </p>
                              )}
                              <div className="pt-3">
                                <Button
                                  size="default"
                                  variant="outline"
                                  className="w-full gap-2 text-sm font-semibold uppercase border-white text-white hover:bg-white hover:text-black rounded-none transition-colors pointer-events-none"
                                  asChild
                                >
                                  <span>
                                    Louez {v.name}
                                    <ArrowRight className="w-4 h-4" />
                                  </span>
                                </Button>
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
