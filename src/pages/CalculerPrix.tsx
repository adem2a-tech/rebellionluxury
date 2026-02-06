import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PriceCalculator from "@/components/PriceCalculator";

const CalculerPrix = () => {
  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Calculez le prix</h1>
          <p className="text-muted-foreground">
            Estimation pour la location (véhicule, durée, km) et le transport (Evionnaz → client → Evionnaz à 2 CHF/km).
          </p>
        </motion.div>

        <PriceCalculator />
      </div>
    </div>
  );
};

export default CalculerPrix;
