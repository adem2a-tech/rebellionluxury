import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ImagePlus, X, Send } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addRequest, canAddRequestToday, getRemainingRequestsToday } from "@/data/vehicleRequests";
import { CONTACT } from "@/data/chatKnowledge";
import { toast } from "sonner";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 800 * 1024; // 800 KB

const formSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  address: z.string().min(1, "Adresse requise"),
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  power: z.string().min(1, "Puissance requise (ex: 420 CH)"),
  transmission: z.string().min(1, "Transmission requise"),
  description: z.string().min(10, "Expliquez en quelques mots (min. 10 caractères)"),
  pricePerDay: z.string().optional(),
  location: z.string().min(1, "Localisation requise"),
  availabilityUrl: z.union([z.string().url("Lien invalide"), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function buildWhatsAppMessage(values: FormValues, requestId: string): string {
  const lines = [
    "🚗 Nouvelle demande : Loue ton véhicule",
    "",
    `📋 ID: ${requestId}`,
    "",
    "👤 DÉPOSANT",
    `${values.firstName} ${values.lastName}`,
    `Email: ${values.email}`,
    `Tél: ${values.phone}`,
    `Adresse: ${values.address}`,
    "",
    "🚙 VÉHICULE",
    `${values.brand} ${values.model} (${values.year})`,
    `Puissance: ${values.power} | ${values.transmission}`,
    ...(values.pricePerDay ? [`Prix/jour: ${values.pricePerDay}`] : []),
    `Lieu: ${values.location}`,
    "",
    `Pourquoi rentabiliser: ${values.description.slice(0, 200)}${values.description.length > 200 ? "..." : ""}`,
    "",
    "Vérifier sur l'Espace pro pour les photos et détails.",
  ];
  return lines.join("\n");
}

const LoueTonVehicule = () => {
  const [submitted, setSubmitted] = useState<{ id: string; email: string; values: FormValues } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      power: "",
      transmission: "",
      description: "",
      pricePerDay: "",
      location: "",
      availabilityUrl: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} photos autorisées.`);
      return;
    }
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`Photo trop lourde : ${file.name} (max 800 Ko)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        if (data) setImages((prev) => [...prev, data].slice(0, MAX_IMAGES));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: FormValues) => {
    if (images.length === 0) {
      toast.error("Ajoutez au moins une photo du véhicule.");
      return;
    }
    if (!canAddRequestToday(values.email)) {
      toast.error("Limite atteinte : maximum 3 demandes par jour. Consultez vos demandes ou réessayez demain.");
      return;
    }
    const request = addRequest({
      depositor: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
      },
      vehicle: {
        brand: values.brand,
        model: values.model,
        year: values.year,
        power: values.power,
        transmission: values.transmission,
        description: values.description,
        pricePerDay: values.pricePerDay || "À définir",
        location: values.location,
        availabilityUrl: values.availabilityUrl?.trim() || undefined,
      },
      images,
    });
    if (!request) {
      toast.error("Limite atteinte : maximum 3 demandes par jour.");
      return;
    }
    setSubmitted({ id: request.id, email: values.email, values });
    setImages([]);
    form.reset();
    toast.success("Demande envoyée. Vous serez notifié par téléphone/WhatsApp. Consultez « Voir mes demandes » pour le statut.");
  };

  const sendToWhatsApp = () => {
    if (!submitted) return;
    const msg = buildWhatsAppMessage(submitted.values, submitted.id);
    const url = `https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (submitted) {
    return (
      <div className="pt-24 lg:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card/50 p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Send className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Demande envoyée</h2>
            <p className="text-muted-foreground mb-6">
              Votre demande a bien été enregistrée. Vous serez notifié par téléphone ou WhatsApp lors du traitement. Consultez vos demandes pour voir le statut (en attente, accepté, refusé).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={sendToWhatsApp} className="bg-[#25D366] hover:bg-[#25D366]/90">
                <IoLogoWhatsapp className="w-5 h-5 mr-2" />
                Envoyer le résumé sur WhatsApp
              </Button>
              <Button variant="outline" asChild>
                <Link to="/verifier-ma-demande">Voir mes demandes</Link>
              </Button>
            </div>
            <Button variant="ghost" asChild className="mt-6 block mx-auto">
              <Link to="/loue-ton-vehicule" onClick={() => setSubmitted(null)}>
                Nouvelle demande
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display text-lg font-semibold">Vos coordonnées</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  const remaining = field.value ? getRemainingRequestsToday(field.value) : 3;
                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.ch" {...field} />
                      </FormControl>
                      {field.value && (
                        <p className="text-xs text-muted-foreground">
                          {remaining > 0
                            ? `${remaining} demande(s) possible(s) aujourd'hui`
                            : "Limite atteinte (3/jour). Réessayez demain."}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+41 79 123 45 67" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Rue, NPA, Ville" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <h3 className="font-display text-lg font-semibold">Véhicule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <Input placeholder="Audi, McLaren..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <FormControl>
                        <Input placeholder="R8, 570S..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puissance</FormLabel>
                      <FormControl>
                        <Input placeholder="420 CH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission</FormLabel>
                    <FormControl>
                      <Input placeholder="Automatique, Manuelle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
<FormLabel>Pourquoi voulez-vous rentabiliser ce véhicule ?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Pourquoi vous voulez la rentabiliser" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation (ville ou adresse de mise à disposition)</FormLabel>
                    <FormControl>
                      <Input placeholder="Lausanne, Genève..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availabilityUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lien disponibilités (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://www.boboloc.com/... ou autre lien calendrier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-display text-lg font-semibold">Photos (1 à 5)</h3>
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-sm text-muted-foreground">Max 5 photos, 800 Ko chacune.</p>
            </motion.section>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                Envoyer ma demande
              </Button>
              <Button variant="outline" asChild>
                <Link to="/verifier-ma-demande">Voir mes demandes</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoueTonVehicule;
