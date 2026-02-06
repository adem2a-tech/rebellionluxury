import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import VehiclesSection from "@/components/VehiclesSection";
import { ArrowLeft } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { getAvailabilitySummary } from "@/data/vehicleReservations";

const Vehicules = () => {
  const { openChat } = useChat();
  const [searchParams] = useSearchParams();
  const horsRebellion = searchParams.get("hors-rebellion") === "1";
  return (
    <motion.div
      className="pt-24 lg:pt-28 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="px-4 lg:px-8 mb-8"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
      </motion.div>
      <VehiclesSection onlyHorsRebellion={horsRebellion} />
      {/* Résumé des indisponibilités (mises à jour en temps réel depuis l'Espace pro) */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Disponibilités :</p>
            <p className="whitespace-pre-line">{getAvailabilitySummary(null)}</p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="mt-4"
            onClick={() => openChat("Quels véhicules sont disponibles pour mes dates ?")}
          >
            Vérifier avec Rebellion IA
          </Button>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Vehicules;
