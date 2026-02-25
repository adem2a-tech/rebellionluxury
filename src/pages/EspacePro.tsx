/**
 * Espace pro — léger, sans calendrier.
 * Accès par code: huracandidier
 * Mes véhicules: ajout avec caractéristiques + grille tarifaire complète.
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, Lock, FileText, Users, Mail, Check, X, Car, ImagePlus, Trash2, Phone, MapPin, ExternalLink, Calendar, Pencil, ChevronUp, ChevronDown, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProAuth } from "@/contexts/ProAuthContext";
import { getAllVisitors, clearVisitors } from "@/data/visitors";
import type { VisitorEntry } from "@/data/visitors";
import { getAllRequests, getRequestsByStatus, updateRequestStatus, acceptRequestWithPricing, updateRequestSpecs, updateRequestPricing, deleteRequest } from "@/data/vehicleRequests";
import type { VehicleRequest } from "@/data/vehicleRequests";
import { getPendingLeads, getAllLeads, markLeadContacted } from "@/data/leads";
import { addAdminVehicle, getAdminVehicles, removeAdminVehicle, updateAdminVehicle, syncAdminVehiclesToServer } from "@/data/adminVehicles";
import { getBaseFleet, updateBaseVehicle } from "@/data/baseFleet";
import { getAllVehicles } from "@/data/vehicles";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { BaseFleetInput } from "@/data/baseFleet";
import type { PricingTier, VehicleSpec } from "@/data/vehicles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_PRICING: PricingTier[] = [
  { duration: "24h", km: "200 km", price: "Sur demande" },
  { duration: "48h", km: "400 km", price: "Sur demande" },
  { duration: "7 jours", km: "700 km", price: "Sur demande" },
];

const PRICING_TEMPLATES: { duration: string; km: string }[] = [
  { duration: "24h", km: "200 km" },
  { duration: "48h", km: "400 km" },
  { duration: "7 jours", km: "700 km" },
  { duration: "Vendredi au dimanche", km: "200 km" },
  { duration: "Vendredi au lundi", km: "200 km" },
  { duration: "Mois (30 jours)", km: "2'000 km" },
];

const MAX_IMAGES = 10;

function EspaceProLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { login } = useProAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(code.trim())) setError("Code incorrect.");
  };

  return (
    <div className="min-h-screen espace-pro-led flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl p-8 espace-pro-led-card border border-white/10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <Lock className="w-6 h-6 text-white/80" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-white espace-pro-led-title">
            Espace pro
          </h1>
        </div>
        <p className="text-center text-white/50 text-sm mb-6">Entrez le code d&apos;accès</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full py-3 bg-white hover:bg-white/90 text-black font-medium rounded-xl transition-colors">
            Connexion
          </Button>
        </form>
        <Button variant="ghost" size="sm" asChild className="w-full mt-4 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au site
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FlotteBaseSection() {
  const [baseFleet, setBaseFleet] = useState(() => getBaseFleet());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [power, setPower] = useState("");
  const [transmission, setTransmission] = useState("");
  const [description, setDescription] = useState("");
  const [caution, setCaution] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sport");
  const [availabilityUrl, setAvailabilityUrl] = useState("");
  const [videos, setVideos] = useState<string[]>(["", ""]);
  const [images, setImages] = useState<string[]>([]);
  const [pricing, setPricing] = useState<PricingTier[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const video1FileRef = useRef<HTMLInputElement>(null);
  const video2FileRef = useRef<HTMLInputElement>(null);

  const refreshFleet = () => setBaseFleet(getBaseFleet());

  const MAX_VIDEO_MB = 20;
  const handleVideoFile = (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Vidéo max ${MAX_VIDEO_MB} Mo`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) setVideos((p) => { const next = [...p]; next[index] = dataUrl; return next; });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      if (file.size > 800 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        if (data) setImages((prev) => [...prev, data].slice(0, MAX_IMAGES));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const moveImage = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const addPricingRow = () => setPricing((p) => [...p, { duration: "", km: "", price: "" }]);
  const updatePricingRow = (i: number, field: keyof PricingTier, value: string) => {
    setPricing((p) => p.map((t, j) => (j === i ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSlug) return;
    const fd = new FormData(e.currentTarget);
    const input: BaseFleetInput = {
      brand: String(fd.get("brand") ?? "").trim(),
      model: String(fd.get("model") ?? "").trim(),
      year: Number(fd.get("year")) || new Date().getFullYear(),
      power: String(fd.get("power") ?? "").trim(),
      transmission: String(fd.get("transmission") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      caution: String(fd.get("caution") ?? "").trim(),
      location: String(fd.get("location") ?? "").trim(),
      category: String(fd.get("category") ?? "").trim(),
      availabilityUrl: String(fd.get("availabilityUrl") ?? "").trim() || undefined,
      video: videos[0]?.trim() || undefined,
      videos: videos.map((u) => u.trim()).filter(Boolean).slice(0, 2),
      images: images.length > 0 ? images.slice(0, 10) : [],
      pricing: pricing.filter((t) => (t.duration?.trim() || t.km?.trim() || t.price?.trim())).map((t) => ({
        ...t,
        price: t.price || "Sur demande",
      })),
    };
    if (!input.brand || !input.model || !input.power || !input.transmission || !input.description) return;
    if (images.length === 0) return;
    updateBaseVehicle(editingSlug, input);
    resetForm();
    refreshFleet();
  };

  const handleEdit = (v: (typeof baseFleet)[0]) => {
    setEditingSlug(v.slug);
    setBrand(v.brand);
    setModel(v.model);
    setYear(v.year);
    setPower(v.specs.power);
    setTransmission(v.specs.transmission);
    setDescription(v.description);
    setCaution(v.specs.caution);
    setLocation(v.location);
    setCategory(v.specs.type);
    setAvailabilityUrl(v.availabilityUrl ?? "");
    setVideos(v.videos?.length ? [v.videos[0] ?? "", v.videos[1] ?? ""] : [v.video ?? "", ""]);
    setImages(v.images.length > 0 ? v.images.slice(0, 10) : []);
    setPricing(v.pricing.length > 0 ? v.pricing.map((p) => ({ ...p })) : [{ duration: "24h", km: "200 km", price: "" }]);
  };

  const resetForm = () => {
    setEditingSlug(null);
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear());
    setPower("");
    setTransmission("");
    setDescription("");
    setCaution("");
    setLocation("");
    setCategory("Sport");
    setAvailabilityUrl("");
    setVideos(["", ""]);
    setImages([]);
    setPricing([]);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors";
  const labelClass = "text-xs font-medium text-white/60 tracking-wide block mb-1.5";

  return (
    <Card className="espace-pro-led-card border border-white/10 mb-8 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white espace-pro-led-title text-base flex items-center gap-2">
          <Car className="w-5 h-5 text-white/70" /> Flotte de base ({baseFleet.length})
        </CardTitle>
        <p className="text-sm text-white/50 mt-1">Audi, McLaren, Maserati — modifiables ici</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-6">
          {baseFleet.map((v) => (
            <div key={v.slug} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/15 transition-colors">
              <div>
                <p className="font-medium text-white">{v.name}</p>
                <p className="text-sm text-white/50">{v.year} · {v.specs.power}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleEdit(v)} className="border-white/20 text-white/80 hover:bg-white/10 rounded-lg" title="Modifier">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {editingSlug && (
          <form onSubmit={handleSubmit} className="space-y-6 p-5 rounded-xl border border-white/10 bg-white/[0.03]">
            <h3 className="text-sm font-medium text-white">Modifier {baseFleet.find((v) => v.slug === editingSlug)?.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Marque *</label>
                <input name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex. Maserati" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Modèle *</label>
                <input name="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex. Quattroporte GTS" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Année *</label>
                <input name="year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || 0)} min={1900} max={new Date().getFullYear() + 1} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Puissance *</label>
                <input name="power" value={power} onChange={(e) => setPower(e.target.value)} placeholder="Ex. 530 CH" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Transmission *</label>
                <input name="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} placeholder="Ex. Automatique" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Catégorie</label>
                <input name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex. Sport" className={inputClass} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className={labelClass}>Description *</label>
                <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le véhicule..." required rows={3} className={inputClass + " resize-none"} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Caution</label>
                <input name="caution" value={caution} onChange={(e) => setCaution(e.target.value)} placeholder="Ex. 5'000 CHF" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Localisation</label>
                <input name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex. Suisse romande" className={inputClass} />
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <label className={labelClass}>Vidéo 1 (affichée à la fin du catalogue)</label>
                <div className="flex gap-2">
                  {videos[0]?.startsWith("data:") ? (
                    <div className="flex-1 flex items-center gap-2 rounded-lg bg-black/50 border border-white/20 px-3 py-2.5 text-sm text-white/90">
                      <Video className="w-4 h-4 text-amber-400/80" /> Vidéo importée
                      <Button type="button" variant="ghost" size="sm" className="ml-auto text-white/60 hover:text-white" onClick={() => setVideos((p) => ["", p[1]])}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <input name="video1" value={videos[0]} onChange={(e) => setVideos((p) => [e.target.value, p[1]])} placeholder="URL ou choisir un fichier" className={inputClass + " flex-1"} />
                  )}
                  <Button type="button" variant="outline" size="sm" className="shrink-0 border-white/20 text-white/80 hover:bg-white/10" onClick={() => video1FileRef.current?.click()}>
                    <Video className="w-4 h-4 mr-1.5" /> Fichier
                  </Button>
                </div>
                <input ref={video1FileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(0, e)} />
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <label className={labelClass}>Vidéo 2 (optionnel, max 2 vidéos)</label>
                <div className="flex gap-2">
                  {videos[1]?.startsWith("data:") ? (
                    <div className="flex-1 flex items-center gap-2 rounded-lg bg-black/50 border border-white/20 px-3 py-2.5 text-sm text-white/90">
                      <Video className="w-4 h-4 text-amber-400/80" /> Vidéo importée
                      <Button type="button" variant="ghost" size="sm" className="ml-auto text-white/60 hover:text-white" onClick={() => setVideos((p) => [p[0], ""])}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <input name="video2" value={videos[1]} onChange={(e) => setVideos((p) => [p[0], e.target.value])} placeholder="URL ou choisir un fichier" className={inputClass + " flex-1"} />
                  )}
                  <Button type="button" variant="outline" size="sm" className="shrink-0 border-white/20 text-white/80 hover:bg-white/10" onClick={() => video2FileRef.current?.click()}>
                    <Video className="w-4 h-4 mr-1.5" /> Fichier
                  </Button>
                </div>
                <input ref={video2FileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(1, e)} />
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <label className={labelClass}>Lien Boboloc (disponibilités)</label>
                <input name="availabilityUrl" type="url" value={availabilityUrl} onChange={(e) => setAvailabilityUrl(e.target.value)} placeholder="https://www.boboloc.com/..." className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Photos * (max {MAX_IMAGES}) — l’ordre est conservé</label>
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <span className="absolute bottom-0.5 left-0.5 text-[10px] font-medium text-white bg-black/60 px-1 rounded">{i + 1}</span>
                    <div className="absolute -top-1 right-6 flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-5 h-5 rounded bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 disabled:opacity-30 disabled:pointer-events-none"><ChevronUp className="w-3 h-3" /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="w-5 h-5 rounded bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 disabled:opacity-30 disabled:pointer-events-none"><ChevronDown className="w-3 h-3" /></button>
                    </div>
                    <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/40 hover:border-white/30 hover:text-white/60 transition-colors">
                    <ImagePlus className="w-6 h-6" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Grille tarifaire</label>
                <Button type="button" size="sm" variant="outline" onClick={addPricingRow} className="border-white/20 text-white/80 hover:bg-white/10 text-xs rounded-lg">+ Ligne</Button>
              </div>
              <div className="space-y-2">
                {pricing.map((t, i) => (
                  <div key={i} className="flex gap-2 flex-wrap items-center">
                    <input value={t.duration} onChange={(e) => updatePricingRow(i, "duration", e.target.value)} placeholder="Durée" className={"flex-1 min-w-[120px] " + inputClass} />
                    <input value={t.km} onChange={(e) => updatePricingRow(i, "km", e.target.value)} placeholder="Km" className={"w-24 " + inputClass} />
                    <input value={t.price} onChange={(e) => updatePricingRow(i, "price", e.target.value)} placeholder="Prix" className={"w-28 " + inputClass} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" className="bg-white hover:bg-white/90 text-black font-medium rounded-xl py-6 px-6">
                <Pencil className="w-4 h-4 mr-2" /> Enregistrer
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-white/80 hover:bg-white/10 py-6 rounded-xl">Annuler</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function MesVehiculesSection() {
  const [adminVehicles, setAdminVehicles] = useState(() => getAdminVehicles());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [power, setPower] = useState("");
  const [transmission, setTransmission] = useState("");
  const [description, setDescription] = useState("");
  const [caution, setCaution] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sport");
  const [availabilityUrl, setAvailabilityUrl] = useState("");
  const [extraKmPriceChf, setExtraKmPriceChf] = useState("5");
  const [videos, setVideos] = useState<string[]>(["", ""]);
  const [images, setImages] = useState<string[]>([]);
  const [pricing, setPricing] = useState<PricingTier[]>(() =>
    PRICING_TEMPLATES.map((t) => ({ ...t, price: "" }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const video1FileRef = useRef<HTMLInputElement>(null);
  const video2FileRef = useRef<HTMLInputElement>(null);

  const refreshVehicles = () => setAdminVehicles(getAdminVehicles());

  const MAX_VIDEO_MB_ADMIN = 20;
  const handleVideoFile = (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB_ADMIN * 1024 * 1024) {
      toast.error(`Vidéo max ${MAX_VIDEO_MB_ADMIN} Mo`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) setVideos((p) => { const next = [...p]; next[index] = dataUrl; return next; });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      if (file.size > 800 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        if (data) setImages((prev) => [...prev, data].slice(0, MAX_IMAGES));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const moveImage = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const updatePricing = (index: number, price: string) => {
    setPricing((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], price: price.trim() ? `${price.replace(/\s/g, "").replace(/'/g, "")} CHF` : "Sur demande" };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const submittedBrand = String(fd.get("brand") ?? "").trim();
    const submittedModel = String(fd.get("model") ?? "").trim();
    const submittedPower = String(fd.get("power") ?? "").trim();
    const submittedTransmission = String(fd.get("transmission") ?? "").trim();
    const submittedDescription = String(fd.get("description") ?? "").trim();
    const submittedCaution = String(fd.get("caution") ?? "").trim();
    const submittedLocation = String(fd.get("location") ?? "").trim();
    const submittedCategory = String(fd.get("category") ?? "").trim();
    const submittedYear = Number(fd.get("year")) || new Date().getFullYear();
    const submittedAvailabilityUrl = String(fd.get("availabilityUrl") ?? "").trim();
    const rawExtraKm = String(fd.get("extraKmPriceChf") ?? "").trim().replace(",", ".");
    const submittedExtraKm = rawExtraKm ? Math.max(0, parseFloat(rawExtraKm)) || 5 : 5;
    if (!submittedBrand || !submittedModel || !submittedPower || !submittedTransmission || !submittedDescription) return;
    if (images.length === 0) return;
    const tiers: PricingTier[] = pricing.map((p) => ({
      ...p,
      price: p.price || "Sur demande",
    }));
    const videosList = videos.map((u) => u.trim()).filter(Boolean).slice(0, 2);
    const imagesList = images.slice(0, 10);
    if (editingSlug) {
      updateAdminVehicle(editingSlug, {
        brand: submittedBrand,
        model: submittedModel,
        year: submittedYear,
        power: submittedPower,
        transmission: submittedTransmission,
        description: submittedDescription,
        caution: submittedCaution || "À définir",
        location: submittedLocation || "Suisse romande",
        category: submittedCategory || "Sport",
        images: imagesList,
        videos: videosList.length > 0 ? videosList : undefined,
        pricing: tiers,
        availabilityUrl: submittedAvailabilityUrl || undefined,
        extraKmPriceChf: submittedExtraKm,
      });
    } else {
      addAdminVehicle({
        brand: submittedBrand,
        model: submittedModel,
        year: submittedYear,
        power: submittedPower,
        transmission: submittedTransmission,
        description: submittedDescription,
        caution: submittedCaution || "À définir",
        location: submittedLocation || "Suisse romande",
        category: submittedCategory || "Sport",
        images: imagesList,
        videos: videosList.length > 0 ? videosList : undefined,
        pricing: tiers,
        availabilityUrl: submittedAvailabilityUrl || undefined,
        extraKmPriceChf: submittedExtraKm,
      });
    }
    resetForm();
    refreshVehicles();
    syncAdminVehiclesToServer();
  };

  const handleRemove = (slug: string) => {
    removeAdminVehicle(slug);
    refreshVehicles();
    syncAdminVehiclesToServer();
    if (editingSlug === slug) setEditingSlug(null);
  };

  const handleEdit = (v: (typeof adminVehicles)[0]) => {
    setEditingSlug(v.slug);
    setBrand(v.brand);
    setModel(v.model);
    setYear(v.year);
    setPower(v.specs.power);
    setTransmission(v.specs.transmission);
    setDescription(v.description);
    setCaution(v.specs.caution);
    setLocation(v.location);
    setCategory(v.specs.type);
    setAvailabilityUrl(v.availabilityUrl ?? "");
    setExtraKmPriceChf(v.extraKmPriceChf != null ? String(v.extraKmPriceChf) : "5");
    setVideos(v.videos?.length ? [v.videos[0] ?? "", v.videos[1] ?? ""] : ["", ""]);
    setImages(v.images.length > 0 ? v.images.slice(0, 10) : []);
    setPricing(v.pricing.length > 0 ? v.pricing.map((p) => ({ ...p })) : PRICING_TEMPLATES.map((t) => ({ ...t, price: "" })));
  };

  const resetForm = () => {
    setEditingSlug(null);
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear());
    setPower("");
    setTransmission("");
    setDescription("");
    setCaution("");
    setLocation("");
    setCategory("Sport");
    setAvailabilityUrl("");
    setExtraKmPriceChf("5");
    setVideos(["", ""]);
    setImages([]);
    setPricing(PRICING_TEMPLATES.map((t) => ({ ...t, price: "" })));
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors";
  const labelClass = "text-xs font-medium text-white/60 tracking-wide block mb-1.5";

  const handleSyncIA = () => {
    const fleet = getAllVehicles();
    const names = fleet.map((v) => v.name).join(", ") || "—";
    toast.success("L'IA est à jour", {
      description: fleet.length
        ? `Rebellion IA a accès à ${fleet.length} véhicule${fleet.length > 1 ? "s" : ""} : ${names}. Elle peut répondre sur les tarifs, disponibilités et fiches.`
        : "Ajoutez des véhicules ci-dessous pour que l'IA puisse en parler aux visiteurs.",
      duration: 5000,
    });
  };

  return (
    <Card className="espace-pro-led-card border border-white/10 mb-8 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-white espace-pro-led-title text-base flex items-center gap-2">
            <Car className="w-5 h-5 text-white/70" /> Mes véhicules ({adminVehicles.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleSyncIA} className="border-white/20 text-white/80 hover:bg-white/10 shrink-0">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Synchroniser avec l&apos;IA
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Marque *</label>
              <input name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex. Porsche" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Modèle *</label>
              <input name="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex. Macan" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Année *</label>
              <input name="year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || 0)} min={1900} max={new Date().getFullYear() + 1} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Puissance *</label>
              <input name="power" value={power} onChange={(e) => setPower(e.target.value)} placeholder="Ex. 420 CH" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Transmission *</label>
              <input name="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} placeholder="Ex. Automatique" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Catégorie</label>
              <input name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex. Sport" className={inputClass} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le véhicule..." required rows={3} className={inputClass + " resize-none"} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Caution</label>
              <input
                name="caution"
                value={caution}
                onChange={(e) => setCaution(e.target.value)}
                placeholder="Ex. 3'000 CHF"
                className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60">Localisation</label>
              <input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex. Suisse romande"
                className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-xs uppercase tracking-wider text-white/60">Vidéo 1 (affichée à la fin du catalogue, max 2)</label>
              <div className="flex gap-2">
                {videos[0]?.startsWith("data:") ? (
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-black/50 border border-white/20 px-3 py-2.5 text-sm text-white/90">
                    <Video className="w-4 h-4 text-amber-400/80" /> Vidéo importée
                    <Button type="button" variant="ghost" size="sm" className="ml-auto text-white/60 hover:text-white" onClick={() => setVideos((p) => ["", p[1]])}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <input
                    name="video1"
                    value={videos[0]}
                    onChange={(e) => setVideos((p) => [e.target.value, p[1]])}
                    placeholder="URL ou choisir un fichier (max 20 Mo)"
                    className="flex-1 w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                  />
                )}
                <Button type="button" variant="outline" size="sm" className="shrink-0 border-white/20 text-white/80 hover:bg-white/10" onClick={() => video1FileRef.current?.click()}>
                  <Video className="w-4 h-4 mr-1.5" /> Fichier
                </Button>
              </div>
              <input ref={video1FileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(0, e)} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-xs uppercase tracking-wider text-white/60">Vidéo 2 (optionnel)</label>
              <div className="flex gap-2">
                {videos[1]?.startsWith("data:") ? (
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-black/50 border border-white/20 px-3 py-2.5 text-sm text-white/90">
                    <Video className="w-4 h-4 text-amber-400/80" /> Vidéo importée
                    <Button type="button" variant="ghost" size="sm" className="ml-auto text-white/60 hover:text-white" onClick={() => setVideos((p) => [p[0], ""])}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <input
                    name="video2"
                    value={videos[1]}
                    onChange={(e) => setVideos((p) => [p[0], e.target.value])}
                    placeholder="URL ou choisir un fichier"
                    className="flex-1 w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                  />
                )}
                <Button type="button" variant="outline" size="sm" className="shrink-0 border-white/20 text-white/80 hover:bg-white/10" onClick={() => video2FileRef.current?.click()}>
                  <Video className="w-4 h-4 mr-1.5" /> Fichier
                </Button>
              </div>
              <input ref={video2FileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(1, e)} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-xs uppercase tracking-wider text-white/60">Lien disponibilités (Boboloc)</label>
              <input
                name="availabilityUrl"
                type="url"
                value={availabilityUrl}
                onChange={(e) => setAvailabilityUrl(e.target.value)}
                placeholder="Ex. https://www.boboloc.com/rebellionluxury-7245/.../carDetails"
                className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              />
              <p className="text-xs text-white/50">Collez le lien de la fiche véhicule sur Boboloc pour afficher les disponibilités en temps réel sur le site.</p>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60">Photos * (max {MAX_IMAGES}) — l’ordre est conservé</label>
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-20 h-20 object-cover rounded" />
                  <span className="absolute bottom-0.5 left-0.5 text-[10px] font-medium text-white bg-black/60 px-1 rounded">{i + 1}</span>
                  <div className="absolute -top-1 right-6 flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-5 h-5 rounded bg-amber-500/90 text-black flex items-center justify-center hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none"><ChevronUp className="w-3 h-3" /></button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="w-5 h-5 rounded bg-amber-500/90 text-black flex items-center justify-center hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none"><ChevronDown className="w-3 h-3" /></button>
                  </div>
                  <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border border-dashed border-white/30 flex items-center justify-center text-white/40 hover:border-amber-500/50 hover:text-amber-400/80 transition-colors"
                >
                  <ImagePlus className="w-6 h-6" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </div>

          {/* Grille tarifaire */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-white/60">Prix (CHF) — 24h, 48h, 7 jours</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRICING_TEMPLATES.map((tpl, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs text-white/50">{tpl.duration} ({tpl.km})</span>
                  <input
                    type="text"
                    value={(pricing[i]?.price ?? "") === "Sur demande" ? "" : (pricing[i]?.price ?? "").replace(/\s*CHF\s*/gi, "").replace(/'/g, "")}
                    onChange={(e) => updatePricing(i, e.target.value)}
                    placeholder="Ex. 500"
                    className="px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prix au km supplémentaire */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60">Prix au km supplémentaire (CHF)</label>
            <p className="text-xs text-white/50">Tarif par kilomètre au-delà du forfait. Saisissez le montant que vous voulez (ex. 5, 6.5, 4.25).</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                name="extraKmPriceChf"
                type="text"
                inputMode="decimal"
                value={extraKmPriceChf}
                onChange={(e) => setExtraKmPriceChf(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="Ex. 5 ou 6.5"
                className="w-full max-w-[7rem] px-3 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              />
              <span className="text-sm text-white/60">CHF/km</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold uppercase tracking-wider rounded-lg py-6 transition-colors">
              {editingSlug ? (
                <><Pencil className="w-4 h-4 mr-2" /> Enregistrer les modifications</>
              ) : (
                <><Car className="w-4 h-4 mr-2" /> Ajouter le véhicule</>
              )}
            </Button>
            {editingSlug && (
              <Button type="button" variant="outline" onClick={resetForm} className="border-white/30 text-white/90 py-6">
                Annuler
              </Button>
            )}
          </div>
        </form>

        {/* Liste des véhicules ajoutés */}
        {adminVehicles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-white/60">Véhicules ajoutés</h3>
            <div className="space-y-2">
              {adminVehicles.map((v) => (
                <div key={v.slug} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/30 hover:border-amber-500/20 transition-colors">
                  <div>
                    <p className="font-medium text-white">{v.name}</p>
                    <p className="text-xs text-white/50">{v.year} · {v.specs.power}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(v)} className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemove(v.slug)} className="border-red-500/40 text-red-400 hover:bg-red-500/10" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EspaceProContent() {
  const { logout } = useProAuth();
  const [requests, setRequests] = useState(() => getAllRequests());
  const [leads, setLeads] = useState(() => getAllLeads());

  const refreshRequests = () => setRequests(getAllRequests());
  const refreshLeads = () => setLeads(getAllLeads());

  const handleAccept = (id: string) => {
    acceptRequestWithPricing(id, DEFAULT_PRICING);
    refreshRequests();
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, "rejected");
    refreshRequests();
  };

  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  const handleSaveRequestEdit = (id: string, specs: VehicleSpec, pricing: PricingTier[]) => {
    updateRequestSpecs(id, specs);
    const validPricing = pricing.filter((t) => (t.duration?.trim() || t.km?.trim() || t.price?.trim()));
    updateRequestPricing(id, validPricing.length > 0 ? validPricing : DEFAULT_PRICING);
    refreshRequests();
    setEditingRequestId(null);
  };

  const handleDeleteRequest = (id: string) => {
    if (!window.confirm("Supprimer cette demande de l'historique ?")) return;
    deleteRequest(id);
    refreshRequests();
    setEditingRequestId(null);
  };

  const handleMarkContacted = (id: string) => {
    markLeadContacted(id);
    refreshLeads();
  };

  const [visitorsKey, setVisitorsKey] = useState(0);
  const visitors = getAllVisitors();
  useEffect(() => {
    const HANDOVER_KEY = "rebellion_visitors_handover_v1";
    if (!localStorage.getItem(HANDOVER_KEY)) {
      clearVisitors();
      localStorage.setItem(HANDOVER_KEY, "1");
      setVisitorsKey((k) => k + 1);
    }
  }, []);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = getRequestsByStatus("accepted");
  const rejectedRequests = getRequestsByStatus("rejected");
  const pendingLeads = leads.filter((l) => l.status === "pending");

  /** Specs par défaut pour une demande (avant édition par le pro) */
  function getDefaultSpecs(r: VehicleRequest): VehicleSpec {
    const v = r.vehicle;
    return r.editedSpecs ?? {
      caution: "À définir",
      power: v.power,
      type: "Particulier",
      transmission: v.transmission,
      boite: v.transmission,
      year: v.year,
      doors: 2,
      seats: 2,
      exteriorColor: "—",
      interiorColor: "—",
      kilometers: "—",
      warranty: "—",
    };
  }

  /** Formulaire d'édition des infos véhicule (fiche publique) pour une demande acceptée */
  function EditRequestForm({ request, onSave, onCancel }: { request: VehicleRequest; onSave: (specs: VehicleSpec, pricing: PricingTier[]) => void; onCancel: () => void }) {
    const v = request.vehicle;
    const [specs, setSpecs] = useState<VehicleSpec>(() => getDefaultSpecs(request));
    const [pricing, setPricing] = useState<PricingTier[]>(() => request.pricing?.length ? request.pricing : [...DEFAULT_PRICING]);
    const addPricingRow = () => setPricing((p) => [...p, { duration: "", km: "", price: "" }]);
    const updatePricing = (i: number, field: keyof PricingTier, value: string) => {
      setPricing((p) => p.map((t, j) => (j === i ? { ...t, [field]: value } : t)));
    };
    return (
      <div className="mt-3 p-4 rounded-xl bg-black/50 border border-amber-500/30 space-y-4">
        <h4 className="text-amber-400 text-sm font-medium">Infos affichées sur la fiche véhicule</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <Label className="text-white/70">Caution</Label>
            <Input value={specs.caution} onChange={(e) => setSpecs((s) => ({ ...s, caution: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Puissance</Label>
            <Input value={specs.power} onChange={(e) => setSpecs((s) => ({ ...s, power: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" placeholder="ex: 420 CH" />
          </div>
          <div>
            <Label className="text-white/70">Type</Label>
            <Input value={specs.type} onChange={(e) => setSpecs((s) => ({ ...s, type: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" placeholder="ex: Particulier" />
          </div>
          <div>
            <Label className="text-white/70">Transmission / Moteur</Label>
            <Input value={specs.transmission} onChange={(e) => setSpecs((s) => ({ ...s, transmission: e.target.value, boite: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Année</Label>
            <Input type="number" value={specs.year} onChange={(e) => setSpecs((s) => ({ ...s, year: parseInt(e.target.value, 10) || v.year }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Portes</Label>
            <Input type="number" value={specs.doors} onChange={(e) => setSpecs((s) => ({ ...s, doors: parseInt(e.target.value, 10) || 2 }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Sièges</Label>
            <Input type="number" value={specs.seats} onChange={(e) => setSpecs((s) => ({ ...s, seats: parseInt(e.target.value, 10) || 2 }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Couleur ext.</Label>
            <Input value={specs.exteriorColor ?? ""} onChange={(e) => setSpecs((s) => ({ ...s, exteriorColor: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/70">Couleur int.</Label>
            <Input value={specs.interiorColor ?? ""} onChange={(e) => setSpecs((s) => ({ ...s, interiorColor: e.target.value }))} className="bg-black/50 border-white/20 text-white mt-1" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-white/70">Grille tarifaire</Label>
            <Button type="button" size="sm" variant="outline" onClick={addPricingRow} className="border-amber-500/40 text-amber-400 text-xs">+ Ligne</Button>
          </div>
          <div className="space-y-2">
            {pricing.map((t, i) => (
              <div key={i} className="flex gap-2 flex-wrap items-center">
                <Input value={t.duration} onChange={(e) => updatePricing(i, "duration", e.target.value)} placeholder="Durée" className="flex-1 min-w-[100px] bg-black/50 border-white/20 text-white text-sm" />
                <Input value={t.km} onChange={(e) => updatePricing(i, "km", e.target.value)} placeholder="Km" className="w-20 bg-black/50 border-white/20 text-white text-sm" />
                <Input value={t.price} onChange={(e) => updatePricing(i, "price", e.target.value)} placeholder="Prix" className="w-28 bg-black/50 border-white/20 text-white text-sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(specs, pricing)} className="bg-amber-500 hover:bg-amber-400 text-black">Enregistrer</Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="border-white/30 text-white/90">Annuler</Button>
        </div>
      </div>
    );
  }

  /** Carte détaillée d'une demande (contact + véhicule + photos + actions ou log) */
  function RequestCardFull({ r, showActions }: { r: VehicleRequest; showActions: boolean }) {
    const d = r.depositor;
    const v = r.vehicle;
    const decidedLabel = r.decidedAt
      ? new Date(r.decidedAt).toLocaleDateString("fr-CH", { dateStyle: "medium" })
      : null;
    return (
      <div className="border border-white/10 rounded-xl p-5 bg-black/30 hover:border-amber-500/20 transition-colors space-y-4">
        {/* Photos */}
        {r.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {r.images.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg" />
            ))}
          </div>
        )}
        {/* Contact */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-amber-400/80 mb-2">Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-white/90">
            <span>{d.firstName} {d.lastName}</span>
            <a href={`mailto:${d.email}`} className="text-amber-400/90 hover:underline flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {d.email}
            </a>
            <a href={`tel:${d.phone.replace(/\s/g, "")}`} className="text-amber-400/90 hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {d.phone}
            </a>
            {d.address && (
              <span className="flex items-start gap-1 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/60" /> {d.address}
              </span>
            )}
          </div>
        </div>
        {/* Véhicule */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-amber-400/80 mb-2">Véhicule</h4>
          <div className="text-sm text-white/90 space-y-1">
            <p className="font-medium">{v.brand} {v.model} ({v.year}) · {v.power} · {v.transmission}</p>
            {v.description && <p className="text-white/70">{v.description}</p>}
            <p className="text-white/70">Prix/jour: {v.pricePerDay} · {v.location}</p>
            {v.availabilityUrl && (
              <a href={v.availabilityUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400/90 hover:underline inline-flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Voir disponibilités
              </a>
            )}
          </div>
        </div>
        {/* Statut / date décision */}
        {!showActions && (r.status === "accepted" || r.status === "rejected") && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <Calendar className="w-3.5 h-3.5" />
            {r.status === "accepted" && <span className="text-emerald-400/90">Accepté</span>}
            {r.status === "rejected" && <span className="text-red-400/90">Refusé</span>}
            {decidedLabel && <span>le {decidedLabel}</span>}
            {r.status === "accepted" && (
              <Button type="button" size="sm" variant="outline" className="ml-auto border-amber-500/40 text-amber-400 hover:bg-amber-500/10" onClick={() => setEditingRequestId(editingRequestId === r.id ? null : r.id)}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Modifier
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteRequest(r.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
            </Button>
          </div>
        )}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => handleAccept(r.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Check className="w-4 h-4 mr-1" /> Accepter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="border-red-500/40 text-red-400 hover:bg-red-500/10">
              <X className="w-4 h-4 mr-1" /> Refuser
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black espace-pro-led relative">
      {/* Header LED */}
      <header className="sticky top-0 z-20 border-b border-white/10 espace-pro-led-header bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-5xl flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white transition-colors">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
          <h1 className="font-bold uppercase tracking-[0.15em] text-white espace-pro-led-title text-lg">
            Espace pro
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fleet = getAllVehicles();
                const names = fleet.map((v) => v.name).join(", ") || "—";
                toast.success("L'IA est à jour", {
                  description: fleet.length
                    ? `Rebellion IA a accès à ${fleet.length} véhicule${fleet.length > 1 ? "s" : ""} : ${names}. Elle peut répondre sur les tarifs, disponibilités et fiches.`
                    : "Aucun véhicule en base. Ajoutez des véhicules dans « Mes véhicules » ou « Flotte de base ».",
                  duration: 5000,
                });
              }}
              className="border-white/20 text-white/90 hover:bg-white/10 shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Mettre à jour l&apos;IA
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-white/60 hover:text-white transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-5xl relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card className="espace-pro-led-card border border-white/20 bg-black/60 overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-xs uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400/80" /> Visiteurs
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-amber-400 espace-pro-led-title">{visitors.length}</p></CardContent>
          </Card>
          <Card className="espace-pro-led-card border border-white/20 bg-black/60 overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-xs uppercase tracking-wider text-white/60 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400/80" /> Demandes
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-amber-400 espace-pro-led-title">{pendingRequests.length}</p></CardContent>
          </Card>
          <Card className="espace-pro-led-card border border-white/20 bg-black/60 overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-xs uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400/80" /> Leads
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-amber-400 espace-pro-led-title">{leads.length}</p></CardContent>
          </Card>
        </div>

        {/* Qui s'est connecté — visiteurs identifiés (prénom, nom, email, téléphone) */}
        <Card className="espace-pro-led-card border border-white/20 bg-black/60 mb-8 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 espace-pro-led-title text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Qui s&apos;est connecté ({visitors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {visitors.length === 0 ? (
              <p className="text-white/50 text-sm">Aucun visiteur identifié pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/60 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-2 font-medium">Prénom</th>
                      <th className="py-3 px-2 font-medium">Nom</th>
                      <th className="py-3 px-2 font-medium">Email</th>
                      <th className="py-3 px-2 font-medium">Téléphone</th>
                      <th className="py-3 px-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...visitors]
                      .sort((a: VisitorEntry, b: VisitorEntry) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((v) => (
                        <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                          <td className="py-3 px-2 text-white/90">{v.firstName}</td>
                          <td className="py-3 px-2 text-white/90">{v.lastName}</td>
                          <td className="py-3 px-2 text-white/90">{v.email}</td>
                          <td className="py-3 px-2 text-white/90">{v.phone || "—"}</td>
                          <td className="py-3 px-2 text-white/50 text-xs">
                            {new Date(v.createdAt).toLocaleDateString("fr-CH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandes en attente */}
        <Card className="espace-pro-led-card border border-white/20 bg-black/60 mb-8 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 espace-pro-led-title text-lg">Demandes Espace Pro ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {pendingRequests.length === 0 ? (
              <p className="text-white/50 text-sm">Aucune demande en attente.</p>
            ) : (
              <div className="space-y-6">
                {pendingRequests.map((r) => (
                  <RequestCardFull key={r.id} r={r} showActions />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique : acceptées / refusées */}
        {(acceptedRequests.length > 0 || rejectedRequests.length > 0) && (
          <Card className="espace-pro-led-card border border-white/20 bg-black/60 mb-8 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 espace-pro-led-title text-lg">Historique des demandes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              {acceptedRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-emerald-400/90 mb-3">Acceptées ({acceptedRequests.length})</h3>
                  <div className="space-y-4">
                    {acceptedRequests.map((r) => (
                      <div key={r.id}>
                        <RequestCardFull r={r} showActions={false} />
                        {editingRequestId === r.id && (
                          <EditRequestForm
                            request={r}
                            onSave={(specs, pricing) => handleSaveRequestEdit(r.id, specs, pricing)}
                            onCancel={() => setEditingRequestId(null)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rejectedRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-red-400/90 mb-3">Refusées ({rejectedRequests.length})</h3>
                  <div className="space-y-4">
                    {rejectedRequests.map((r) => (
                      <RequestCardFull key={r.id} r={r} showActions={false} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leads en attente */}
        <Card className="espace-pro-led-card border border-white/20 bg-black/60 mb-8 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 espace-pro-led-title text-lg">Leads à contacter ({pendingLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLeads.length === 0 ? (
              <p className="text-white/50 text-sm">Aucun lead en attente.</p>
            ) : (
              <div className="space-y-4">
                {pendingLeads.map((l) => (
                  <div key={l.id} className="border border-white/10 rounded-xl p-4 bg-black/30 hover:border-amber-500/20 transition-colors">
                    <p className="font-medium text-white">{l.name}</p>
                    <p className="text-sm text-white/60">{l.email} · {l.phone}</p>
                    <p className="text-sm text-white/70 mt-1">{l.vehicleType}</p>
                    {l.message && <p className="text-xs text-white/50 mt-1">{l.message}</p>}
                    <Button size="sm" variant="outline" onClick={() => handleMarkContacted(l.id)} className="mt-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                      <Check className="w-4 h-4 mr-1" /> Marquer contacté
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flotte de base */}
        <FlotteBaseSection />

        {/* Mes véhicules */}
        <MesVehiculesSection />
      </div>
    </div>
  );
}

export default function EspacePro() {
  const { isProLoggedIn } = useProAuth();
  if (!isProLoggedIn) return <EspaceProLogin />;
  return <EspaceProContent />;
}
