import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const R8_REVIEWS = [
  { name: "Thomas M.", text: "Expérience incroyable ! L'Audi R8 au top, équipe pro. Je recommande à 100 %.", date: "Il y a 2 semaines" },
  { name: "Julien P.", text: "R8 V8 au top, livraison soignée. On reviendra pour la McLaren.", date: "Il y a 2 mois" },
  { name: "Antoine D.", text: "Location sans stress, tout est bien organisé. Audi R8 magnifique.", date: "Il y a 4 semaines" },
  { name: "Marie K.", text: "Première location de supercar : des souvenirs inoubliables. Merci !", date: "Il y a 1 semaine" },
];

const MCLAREN_REVIEWS = [
  { name: "Sophie L.", text: "Location McLaren impeccable. Véhicule nickel, tout était parfait pour notre weekend.", date: "Il y a 1 mois" },
  { name: "Lucas B.", text: "Week-end en McLaren : pure folie. Le meilleur cadeau qu'on m'ait fait.", date: "Il y a 1 mois" },
  { name: "Emma V.", text: "Professionnels, réactifs, véhicules impeccables. Un must en Suisse romande.", date: "Il y a 3 semaines" },
  { name: "David R.", text: "Super service, voitures de rêve. Rebellion Luxury tient ses promesses.", date: "Il y a 3 semaines" },
];

const ALL_REVIEWS = [
  ...R8_REVIEWS.map((r) => ({ ...r, vehicle: "Audi R8 V8" as const })),
  ...MCLAREN_REVIEWS.map((r) => ({ ...r, vehicle: "McLaren 570S" as const })),
];

const LED_CARD_CLASS =
  "relative overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-6 " +
  "shadow-[0_0_12px_rgba(255,255,255,0.15),0_0_24px_rgba(255,255,255,0.1),inset_0_0_16px_rgba(255,255,255,0.03)] " +
  "hover:border-white/30 hover:shadow-[0_0_16px_rgba(255,255,255,0.2),0_0_32px_rgba(255,255,255,0.12)] " +
  "transition-all duration-300";

export function ReviewsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      <Carousel
        opts={{ align: "center", loop: true }}
        className="w-full max-w-4xl mx-auto"
        setApi={setApi}
      >
        <CarouselContent className="-ml-2 md:-ml-6">
          {ALL_REVIEWS.map((review, i) => (
            <CarouselItem key={`${review.vehicle}-${i}`} className="pl-2 md:pl-6 basis-full sm:basis-[85%] md:basis-[70%] lg:basis-[55%]">
              <motion.div
                className={LED_CARD_CLASS}
                style={{ transformStyle: "preserve-3d" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      review.vehicle.includes("R8")
                        ? "bg-white/10 text-white/90 border border-white/20"
                        : "bg-white/10 text-white/90 border border-white/20"
                    }`}
                  >
                    {review.vehicle}
                  </span>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary shrink-0" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-white/20 absolute top-8 left-4" />
                <p className="text-foreground/95 text-sm md:text-base leading-relaxed pl-6 mb-4 min-h-[4rem]">
                  {review.text}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/80">— {review.name}</span>
                  <span>{review.date}</span>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-2 md:-left-12 h-10 w-10 rounded-full border-white/20 bg-black/80 text-white hover:bg-white/20 hover:text-white hover:border-white/40" />
        <CarouselNext className="-right-2 md:-right-12 h-10 w-10 rounded-full border-white/20 bg-black/80 text-white hover:bg-white/20 hover:text-white hover:border-white/40" />
      </Carousel>
      <div className="flex justify-center gap-1.5 mt-6">
        {ALL_REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Avis ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
