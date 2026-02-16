import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LocationMap } from "@/components/ui/expand-map";
import { CONTACT } from "@/data/chatKnowledge";
import { ArrowLeft, Sparkles, Shield, Zap, MapPin, Check } from "lucide-react";

const REEL_IDS = ["DSX0cu2jBnF", "DSadvC-CGbc", "DTk8GtQiohD"];
const EMBED_BASE = "https://www.instagram.com/reel";

const APropos = () => {
  return (
    <div className="pt-24 lg:pt-28 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-12"
        >
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6 led-badge">
            Notre histoire
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            L&apos;expérience <span className="text-gradient-orange">Rebellion</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Rebellion Luxury est une entreprise de location de véhicules haut de gamme située en Valais, spécialisée dans les supercars, les véhicules sportifs et les SUV de luxe.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Bien plus qu&apos;une simple location, nous offrons une expérience exclusive avec une flotte rigoureusement sélectionnée.
            Tous nos véhicules sont entièrement assurés, avec la mécanique et l&apos;entretien inclus, pour une tranquillité d&apos;esprit totale.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Nous proposons également un service de transport de véhicules sur plateau-remorque pour nos clients, partout en Suisse romande.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Enfin, Rebellion Luxury met à disposition un service de conciergerie automobile destiné aux propriétaires souhaitant rentabiliser leur véhicule et générer un revenu mensuel, sans contraintes.
          </p>
          <p className="text-lg font-semibold text-foreground mb-10">
            Estimation gratuite et sans engagement
          </p>

          <div className="grid gap-8 md:grid-cols-3 mt-16">
            {[
              {
                icon: Shield,
                title: "Qualité & sécurité",
                text: "Chaque véhicule est contrôlé et assuré. Caution et conditions claires pour une location sereine.",
              },
              {
                icon: Zap,
                title: "Expérience premium",
                text: "De l'Audi R8 à la McLaren 570S, vivez la conduite luxe sur les routes de Suisse romande.",
              },
              {
                icon: MapPin,
                title: "Suisse, Evionnaz",
                text: "Notre base à Evionnaz vous permet de récupérer votre supercar au cœur de la région.",
              },
            ].map((block, i) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                className="glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_hsl(0_0%_100%/0.15)]"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <block.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">{block.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{block.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Localisation — où louer nos véhicules (Suisse) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-20 flex flex-col items-center"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Localisation
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">
              Où louer nos véhicules
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
              Rebellion Luxury — Suisse romande. Récupérez votre supercar à Evionnaz (Valais).
            </p>
            <div className="relative z-10 flex flex-col items-center">
              <LocationMap
                location="Suisse, Evionnaz"
                coordinates="46.18° N, 7.02° E — Valais, Suisse romande"
                mapsUrl={CONTACT.googleMapsUrl}
                className="mt-2"
              />
            </div>
          </motion.div>

          {/* Section Conditions */}
          <motion.div
            id="conditions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-20 max-w-3xl mx-auto scroll-mt-28"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Conditions
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              Conditions de location
            </h2>
            <div className="rounded-2xl overflow-hidden border border-border bg-card/50 mb-6 min-h-[200px] bg-muted/30">
              <img
                src="/conditions.png"
                alt="Conditions Rebellion Luxury — pièce d'identité, permis, justificatif de domicile, acompte, caution"
                className="w-full h-auto max-h-[70vh] object-contain block"
                loading="eager"
              />
            </div>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Pièce d'identité valable",
                "Permis de conduire",
                "Justificatif de domicile",
                "Acompte obligatoire pour réserver le véhicule",
                "Caution, obligatoire",
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Section Collaborations — Reels Instagram swipeables */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Collaborations
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              Nos reels
            </h2>
            <div className="rounded-2xl border border-border bg-card/50 p-4 md:p-6">
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {REEL_IDS.map((id, index) => (
                    <CarouselItem key={id} className="pl-2 md:pl-4">
                      <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-muted/50">
                        <iframe
                          src={`${EMBED_BASE}/${id}/embed/`}
                          title={`Reel Instagram collaboration ${index + 1}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4 -translate-y-1/2" />
                <CarouselNext className="right-2 md:right-4 -translate-y-1/2" />
              </Carousel>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Glissez pour changer de reel (souris ou doigt).
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-16 text-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/vehicules">
                <Sparkles className="w-5 h-5" />
                Découvrir nos véhicules
              </Link>
            </Button>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default APropos;
