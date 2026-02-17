import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoueTonVehiculeForm } from "@/components/LoueTonVehiculeForm";

const LoueTonVehicule = () => {
  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            Loue ton véhicule
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Service de conciergerie automobile <span className="text-primary">premium</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-3">
            Vous souhaitez rentabiliser votre véhicule ou le mettre en location en attendant sa vente ?
            Nous vous proposons une solution clé en main, haut de gamme et sans contrainte.
          </p>
          <p className="text-muted-foreground text-lg mb-6">
            Nous réalisons une <strong className="text-foreground">estimation personnalisée</strong> des revenus mensuels et annuels de votre véhicule afin que vous sachiez précisément combien il peut vous rapporter.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Consultez vos demandes et leur statut (en attente, accepté, refusé) — vous serez notifié par téléphone ou WhatsApp. Maximum 3 demandes par jour.
          </p>
          <Button variant="link" asChild className="px-0 text-primary">
            <Link to="/verifier-ma-demande">Voir mes demandes</Link>
          </Button>

          <div className="rounded-xl border border-border bg-muted/30 p-4 mt-6">
            <h3 className="font-display text-sm font-semibold text-foreground mb-2">Véhicules hors Rebellion</h3>
            <p className="text-muted-foreground text-sm">
              Les véhicules affichés sous cette catégorie sont proposés par des particuliers qui louent leur voiture via notre site. Une fois votre demande acceptée, votre annonce apparaît sur le catalogue. Toute la gestion (fiche détaillée, tarifs, disponibilités, historique) se fait depuis l&apos;<strong className="text-foreground">Espace Pro</strong> : consulter, modifier les infos, supprimer une annonce ou gérer l&apos;historique des demandes.
            </p>
          </div>
        </motion.div>

        {/* Nos services & avantages */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card/50 p-6 mb-8"
        >
          <h2 className="font-display text-lg font-bold mb-4">Nos services & avantages</h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-muted-foreground text-sm mb-6">
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Aucun besoin de chercher des locataires</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Revenus passifs mensuels</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Gestion complète de la location</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Possibilité de gestion de la vente du véhicule (si souhaité)</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Sélection rigoureuse des meilleurs profils de locataires</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Gestion des sinistres et du suivi administratif</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Nettoyage professionnel intérieur & extérieur après chaque location</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Shooting photo professionnel offert</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Création de contenu vidéo professionnel</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Forte visibilité sur nos réseaux sociaux et plateformes partenaires</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Mise en avant lors d&apos;événements exclusifs</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Image premium sous la marque Rebellion Luxury</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Accès à des offres privilégiées via nos partenaires</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Gardiennage sécurisé de votre véhicule en showroom (selon disponibilité – liste d&apos;attente possible)</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Suivi transparent des performances et des revenus</li>
          </ul>
          <h2 className="font-display text-base font-bold mb-2">Conditions d&apos;éligibilité</h2>
          <ul className="space-y-1 text-muted-foreground text-sm mb-4">
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Véhicule homologué, expertisé et en parfait état administratif</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Assurance, documents et conformité en règle</li>
          </ul>
          <h2 className="font-display text-base font-bold mb-2">Comment procéder ?</h2>
          <ol className="space-y-1 text-muted-foreground text-sm">
            <li className="flex gap-2"><span className="font-bold text-primary shrink-0">1.</span> Envoyez-nous des photos de votre véhicule (avant, arrière, côtés, intérieur, tableau de bord, etc.)</li>
            <li className="flex gap-2"><span className="font-bold text-primary shrink-0">2.</span> Nous analysons votre dossier</li>
            <li className="flex gap-2"><span className="font-bold text-primary shrink-0">3.</span> Nous vous recontactons rapidement par WhatsApp ou téléphone</li>
          </ol>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card/50 p-6"
        >
          <LoueTonVehiculeForm />
        </motion.section>
      </div>
    </div>
  );
};

export default LoueTonVehicule;
