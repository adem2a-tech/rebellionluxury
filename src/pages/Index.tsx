import { useChat } from "@/contexts/ChatContext";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { VideoFlotteCard } from "@/components/VideoFlotteCard";
import { Sparkles, Quote, Mail, Phone, MapPin, Instagram, ExternalLink } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { CONTACT } from "@/data/chatKnowledge";
import { LocationMap } from "@/components/ui/expand-map";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";

const Index = () => {
  const { openChat } = useChat();

  return (
    <>
      <Hero />
      {/* Parler à Rebellion IA — sur le côté */}
      <section className="py-4 border-b border-border/50 led-section">
        <div className="container mx-auto px-4 lg:px-8 flex justify-start">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button variant="hero" size="lg" onClick={() => openChat()}>
              <Sparkles className="w-5 h-5" />
              Parler à Rebellion IA
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Teaser véhicules : deux vidéos côte à côte + CTA vers /vehicules */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Notre Flotte
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Nos <span className="text-gradient-orange">plus</span> aimés
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Découvrez notre sélection de supercars et filtrez selon vos critères.
            </p>
          </motion.div>

          {/* Deux vidéos côte à côte — bords LED, type + description */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <VideoFlotteCard
              title="McLaren P1"
              videoSrc="/mclaren-p1-video.mp4"
              ariaLabel="McLaren P1"
              vehicleType="Supercar"
              description="Portes papillons, moteur central et lignes agressives. La quintessence du luxe sportif britannique."
            />
            <VideoFlotteCard
              title="Audi R8"
              videoSrc="/audi-r8-video.mp4"
              ariaLabel="Audi R8"
              vehicleType="Supercar"
              description="V8 atmosphérique, tenue de route exemplaire. L'élégance allemande au service de la performance."
            />
          </motion.div>

          {/* Carrousel avis 3D LED — R8 & McLaren */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Avis clients
            </span>
            <h3 className="font-display text-xl font-bold mb-2">Ce qu&apos;ils disent de nos véhicules</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-lg mx-auto">
              Avis dédiés à l&apos;Audi R8 et à la McLaren 570S.
            </p>
            <ReviewsCarousel />
            <a
              href={CONTACT.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-6"
            >
              <Quote className="w-4 h-4" />
              Voir tous les avis sur Google
            </a>
          </motion.div>

          {/* Contact : email, téléphone, adresse, réseaux — vrais liens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-12 border-t border-border led-section"
          >
            <h3 className="font-display text-lg font-semibold mb-2 text-foreground">Nous contacter</h3>
            <p className="text-muted-foreground text-sm mb-6">Réservez ou posez vos questions — nous répondons rapidement.</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-white/5 transition-all text-muted-foreground hover:text-primary"
              >
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{CONTACT.email}</span>
              </a>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-white/5 transition-all text-muted-foreground hover:text-primary"
              >
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{CONTACT.phone}</span>
              </a>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[#25d366]/30 hover:border-[#25d366] hover:bg-[#25d366]/10 transition-all text-muted-foreground hover:text-[#25d366]"
              >
                <IoLogoWhatsapp className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-white/5 transition-all text-muted-foreground hover:text-primary"
              >
                <Instagram className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a
                href={CONTACT.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-white/5 transition-all text-muted-foreground hover:text-primary"
              >
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{CONTACT.location}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </a>
            </div>
          </motion.div>

          {/* Lieux en 3D avec carte — Suisse, Evionnaz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mt-16 flex flex-col items-center"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4 led-badge">
              Localisation
            </span>
            <h3 className="font-display text-xl font-bold mb-2">Où nous trouver</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
              Rebellion Luxury — récupérez votre supercar à Evionnaz (Valais). Cliquez sur la carte pour l&apos;agrandir.
            </p>
            <div className="relative z-10 flex flex-col items-center">
              <LocationMap
                location="Suisse, Evionnaz"
                coordinates="46.18° N, 7.02° E — Valais, Suisse romande"
                className="mt-2"
              />
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
};

export default Index;
