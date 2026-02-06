import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRequestsByEmail } from "@/data/vehicleRequests";
import type { VehicleRequest } from "@/data/vehicleRequests";

const VerifierMaDemande = () => {
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const [requests, setRequests] = useState<VehicleRequest[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const found = getRequestsByEmail(trimmed);
    setRequests(found);
    setSearched(true);
  };

  const getStatusLabel = (status: VehicleRequest["status"]) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: VehicleRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (req: VehicleRequest) => {
    switch (req.status) {
      case "pending":
        return "En attente d'examen. Vous serez notifié par téléphone ou WhatsApp lors du traitement.";
      case "accepted":
        return "Acceptée ! Votre véhicule est en ligne. Vous serez contacté pour les prochaines étapes.";
      case "rejected":
        return "Refusée. Le patron peut vous contacter pour plus d'informations.";
      default:
        return "";
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-xl">
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
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Voir mes demandes</h1>
          <p className="text-muted-foreground">
            Entrez votre email pour consulter toutes vos demandes et leur statut (en attente, accepté, refusé). Vous serez notifié par téléphone ou WhatsApp lors du traitement.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="space-y-4 mb-10"
        >
          <div className="space-y-2">
            <Label htmlFor="check-email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="check-email"
                type="email"
                placeholder="votre@email.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.form>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
                <p className="text-muted-foreground">
                  Aucune demande trouvée pour cet email. Vérifiez l&apos;adresse ou soumettez une nouvelle demande (max 3/jour).
                </p>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/loue-ton-vehicule">Loue ton véhicule</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{requests.length} demande(s) trouvée(s)</p>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-border bg-card/50 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">{getStatusIcon(req.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-semibold">
                            {req.vehicle.brand} {req.vehicle.model}
                          </span>
                          <span
                            className={`text-sm font-medium px-2 py-0.5 rounded ${
                              req.status === "accepted"
                                ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                : req.status === "rejected"
                                  ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {getStatusLabel(req.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Soumis le {new Date(req.submittedAt).toLocaleDateString("fr-CH")}
                        </p>
                        <p className="text-sm">{getStatusMessage(req)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild>
                  <Link to="/loue-ton-vehicule">Nouvelle demande</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerifierMaDemande;
