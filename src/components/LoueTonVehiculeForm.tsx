/**
 * Formulaire "Loue ton véhicule" — réutilisable sur LoueTonVehicule et Contact.
 */

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, X, Send, ChevronUp, ChevronDown } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { addRequest, canAddRequestToday, getRemainingRequestsToday } from "@/data/vehicleRequests";
import { CONTACT } from "@/data/chatKnowledge";
import { toast } from "sonner";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 800 * 1024;

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

export type LoueTonVehiculeFormValues = z.infer<typeof formSchema>;

function buildWhatsAppMessage(values: LoueTonVehiculeFormValues, requestId: string): string {
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

interface LoueTonVehiculeFormProps {
  /** Mode compact pour intégration dans une autre page (ex: Contact) */
  embedded?: boolean;
}

export function LoueTonVehiculeForm({ embedded = false }: LoueTonVehiculeFormProps) {
  const [submitted, setSubmitted] = useState<{ id: string; email: string; values: LoueTonVehiculeFormValues } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<LoueTonVehiculeFormValues>({
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

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const moveImage = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const onSubmit = (values: LoueTonVehiculeFormValues) => {
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
    toast.success("Demande envoyée. Vous serez notifié par téléphone/WhatsApp.");
  };

  const sendToWhatsApp = () => {
    if (!submitted) return;
    const msg = buildWhatsAppMessage(submitted.values, submitted.id);
    const url = `https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (submitted) {
    return (
      <div className={`rounded-2xl border border-border bg-card/50 p-6 ${embedded ? "" : "text-center"}`}>
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6" style={embedded ? { marginLeft: 0 } : { margin: "0 auto 1.5rem" }}>
          <Send className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Demande envoyée</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Votre demande a bien été enregistrée. Vous serez notifié par téléphone ou WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={sendToWhatsApp} size={embedded ? "sm" : "default"} className="bg-[#25D366] hover:bg-[#25D366]/90">
            <IoLogoWhatsapp className="w-5 h-5 mr-2" />
            Envoyer le résumé sur WhatsApp
          </Button>
          <Button variant="outline" size={embedded ? "sm" : "default"} asChild>
            <Link to="/verifier-ma-demande">Voir mes demandes</Link>
          </Button>
        </div>
        {!embedded && (
          <Button variant="ghost" asChild className="mt-6">
            <Link to="/loue-ton-vehicule" onClick={() => setSubmitted(null)}>Nouvelle demande</Link>
          </Button>
        )}
        {embedded && (
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSubmitted(null)}>
            Nouvelle demande
          </Button>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-display text-sm font-semibold text-foreground">Vos coordonnées</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl><Input placeholder="Prénom" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="email" render={({ field }) => {
            const remaining = field.value ? getRemainingRequestsToday(field.value) : 3;
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="email@exemple.ch" {...field} /></FormControl>
                {field.value && <p className="text-xs text-muted-foreground">{remaining > 0 ? `${remaining} demande(s) possible(s) aujourd'hui` : "Limite atteinte (3/jour)."}</p>}
                <FormMessage />
              </FormItem>
            );
          }} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl><Input placeholder="+41 79 123 45 67" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl><Input placeholder="Rue, NPA, Ville" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-sm font-semibold text-foreground">Véhicule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="brand" render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <FormControl><Input placeholder="Audi, McLaren..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl><Input placeholder="R8, 570S..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="year" render={({ field }) => (
              <FormItem>
                <FormLabel>Année</FormLabel>
                <FormControl><Input type="number" placeholder="2020" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="power" render={({ field }) => (
              <FormItem>
                <FormLabel>Puissance</FormLabel>
                <FormControl><Input placeholder="420 CH" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="transmission" render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission</FormLabel>
              <FormControl><Input placeholder="Automatique, Manuelle" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Pourquoi voulez-vous rentabiliser ce véhicule ?</FormLabel>
              <FormControl><Textarea placeholder="Expliquez en quelques mots" rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Localisation</FormLabel>
              <FormControl><Input placeholder="Lausanne, Genève..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="availabilityUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Lien disponibilités (optionnel)</FormLabel>
              <FormControl><Input type="url" placeholder="https://www.boboloc.com/..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-sm font-semibold text-foreground">Photos (1 à 10) — l’ordre que vous mettez est conservé</h4>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white/90 bg-black/60 px-1 rounded">{i + 1}</span>
                <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-0.5 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none" title="Monter"><ChevronUp className="w-3 h-3" /></button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="p-0.5 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none" title="Descendre"><ChevronDown className="w-3 h-3" /></button>
                </div>
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 left-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80"><X className="w-3 h-3" /></button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground text-xs">
                <ImagePlus className="w-5 h-5" />
                Ajouter
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit">Envoyer ma demande</Button>
          <Button variant="outline" asChild>
            <Link to="/verifier-ma-demande">Voir mes demandes</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
