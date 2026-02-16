import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const CONDITIONS = [
  {
    text: "Location minimum 24h — prix sur demande",
  },
  {
    text: "Location minimum 48h — offert si vous avez déjà loué chez nous",
  },
  {
    text: "Acompte obligatoire",
  },
];

const TRANSPORT_PRICE_PER_KM = 2; // CHF
const POINT_A = "Evionnaz (siège Rebellion Luxury)";
const POINT_B = "Livraison au client (adresse de votre choix)";
const POINT_C = "Retour à Evionnaz";

const Transport = () => {
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
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            Transport
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Livraison à <span className="text-gradient-orange">domicile</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
            Vous voulez vous faire livrer ? Nous livrons votre véhicule à l&apos;adresse de votre choix en Suisse romande. Tarif au kilomètre, transparent et professionnel.
          </p>

          {/* Tarif transport : 2.-/km, A Evionnaz → B client → C Evionnaz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 mb-12"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold mb-4">
              Tarif du transport
            </h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">{TRANSPORT_PRICE_PER_KM} CHF / km</strong> — calculé sur le trajet complet :
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">A</span>
                <span>{POINT_A}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">B</span>
                <span>{POINT_B}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">C</span>
                <span>{POINT_C}</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Prix du transport = (A → B → C) × {TRANSPORT_PRICE_PER_KM} CHF/km. Demandez une estimation via Rebellion IA ou WhatsApp.
            </p>
          </motion.div>

          {/* Images côte à côte */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl overflow-hidden border border-border bg-card/50"
            >
              <img
                src="/transport-jeep.png"
                alt="Jeep et véhicules Rebellion Luxury sur remorque"
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-border bg-card/50"
            >
              <img
                src="/transport-lausanne.png"
                alt="Jeep Rebellion Luxury en livraison sur autoroute"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>

          {/* Conditions, livraison à domicile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 md:p-8 border border-border"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6">
              Conditions, livraison à domicile
            </h2>
            <ul className="space-y-4">
              {CONDITIONS.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3 text-foreground"
                >
                  <span className="shrink-0 mt-0.5 text-primary" aria-hidden>
                    <Check className="h-5 w-5" />
                  </span>
                  <span className="text-muted-foreground">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Encart Livraison Lausanne / Service Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <Check className="h-4 w-4" />
              Livraison sur Lausanne
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <Check className="h-4 w-4" />
              Service Premium
            </span>
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

export default Transport;
