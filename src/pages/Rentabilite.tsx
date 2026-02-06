import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import type { Testimonial } from "@/components/ui/circular-testimonials";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { addLead } from "@/data/leads";

const RENTABILITE_TESTIMONIALS: Testimonial[] = [
  {
    src: "/rentabilite-1.png",
    name: "Rentabilisez votre véhicule",
    designation: "Conciergerie automobile",
    quote: "Rentabilisez votre véhicule en toute sérénité. Rebellion Luxury prend en charge la gestion, l'entretien et la mise en location de votre supercar.",
  },
  {
    src: "/rentabilite-2.png",
    name: "Numéro 1 en Valais",
    designation: "Rebellion Luxury",
    quote: "Notre conciergerie automobile est reconnue en Valais et en Suisse romande pour un service premium et une flotte d'exception.",
  },
  {
    src: "/rentabilite-3.png",
    name: "Restez connectés",
    designation: "Instagram & réseaux",
    quote: "Suivez-nous sur Instagram pour découvrir nos véhicules, les actualités et les expériences clients. Contact direct pour réserver.",
  },
  {
    src: "/rentabilite-4.png",
    name: "Un service sélectif",
    designation: "Pour propriétaires exigeants",
    quote: "Nous proposons un service sélectif et personnalisé. Chaque véhicule est entretenu selon les plus hauts standards.",
  },
  {
    src: "/rentabilite-5.png",
    name: "100 % premium",
    designation: "Service haut de gamme",
    quote: "Un service 100 % premium : de la prise en charge à la restitution, nous garantissons une expérience luxe à chaque étape.",
  },
  {
    src: "/rentabilite-6.png",
    name: "Conciergerie professionnelle",
    designation: "Rebellion Luxury",
    quote: "Une conciergerie automobile professionnelle dédiée à la location de supercars. Faites confiance aux experts pour rentabiliser votre véhicule.",
  },
];

type RentabiliteFormValues = {
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  message: string;
};

const Rentabilite = () => {
  const form = useForm<RentabiliteFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vehicleType: "",
      message: "",
    },
  });

  const onSubmit = (data: RentabiliteFormValues) => {
    addLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      vehicleType: data.vehicleType,
      message: data.message,
    });
    form.reset();
    toast.success(
      "Demande envoyée. Nous vous recontactons rapidement par téléphone ou email pour étudier la rentabilisation de votre véhicule."
    );
  };

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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="max-w-5xl mx-auto"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            Rentabilité
          </span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Service de conciergerie automobile <span className="text-gradient-orange">premium</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Vous souhaitez rentabiliser votre véhicule ou le mettre en location en attendant sa vente ?
            Nous vous proposons une solution clé en main, haut de gamme et sans contrainte.
          </p>
          <p className="text-muted-foreground text-lg mb-10">
            Nous réalisons une <strong className="text-foreground">estimation personnalisée</strong> des revenus mensuels et annuels de votre véhicule afin que vous sachiez précisément combien il peut vous rapporter.
          </p>

          {/* Nos services & avantages */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 mb-10">
            <h2 className="font-display text-xl font-bold mb-6">Nos services & avantages</h2>
            <ul className="grid gap-3 sm:grid-cols-2 text-muted-foreground text-sm md:text-base">
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
          </div>

          {/* Conditions d'éligibilité */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 mb-10">
            <h2 className="font-display text-xl font-bold mb-4">Conditions d&apos;éligibilité</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Véhicule homologué, expertisé et en parfait état administratif</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Assurance, documents et conformité en règle</li>
            </ul>
          </div>

          {/* Comment procéder */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 mb-10">
            <h2 className="font-display text-xl font-bold mb-6">Comment procéder ?</h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex gap-3"><span className="font-bold text-primary shrink-0">1.</span> Envoyez-nous des photos de votre véhicule (avant, arrière, côtés, intérieur, tableau de bord, etc.)</li>
              <li className="flex gap-3"><span className="font-bold text-primary shrink-0">2.</span> Nous analysons votre dossier</li>
              <li className="flex gap-3"><span className="font-bold text-primary shrink-0">3.</span> Nous vous recontactons rapidement par WhatsApp ou téléphone</li>
            </ol>
          </div>

          {/* Sans engagement */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 mb-12 text-center">
            <h2 className="font-display text-xl font-bold mb-2">Sans engagement & 100 % gratuit</h2>
            <p className="text-muted-foreground mb-2">Aucun frais fixe. Nous sommes rémunérés uniquement sur la performance.</p>
            <p className="font-semibold text-foreground">Si vous gagnez, nous gagnons ensemble</p>
          </div>

          {/* Carousel témoignages */}
          <div className="rounded-2xl border border-border bg-card/50 flex flex-wrap items-center justify-center">
            <CircularTestimonials
              testimonials={RENTABILITE_TESTIMONIALS}
              autoplay={true}
              colors={{
                name: "hsl(var(--foreground))",
                designation: "hsl(var(--muted-foreground))",
                testimony: "hsl(var(--muted-foreground))",
                arrowBackground: "hsl(var(--card))",
                arrowForeground: "hsl(var(--foreground))",
                arrowHoverBackground: "hsl(var(--primary))",
              }}
              fontSizes={{
                name: "1.5rem",
                designation: "0.925rem",
                quote: "1.125rem",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Flèches ou clavier pour naviguer. Défilement automatique toutes les 5 secondes.
          </p>

          {/* Formulaire : rentabiliser son véhicule */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Formulaire
            </h2>
            <p className="text-muted-foreground mb-8">
              Envoyez-nous vos coordonnées et quelques infos sur votre véhicule. Nous vous recontactons rapidement.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-border bg-card/50 p-6 md:p-8">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Nom requis" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ required: "Email requis", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.ch" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+41 79 123 45 67" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de véhicule (marque / modèle)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Audi R8, McLaren 570S" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Précisez votre situation ou vos questions..." rows={4} {...field} className="bg-background resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-semibold uppercase tracking-wider">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer ma demande
                </Button>
              </form>
            </Form>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Rentabilite;
