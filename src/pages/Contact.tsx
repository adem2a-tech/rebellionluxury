import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Instagram, ExternalLink } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { SiTiktok, SiFacebook } from "react-icons/si";
import { CONTACT } from "@/data/chatKnowledge";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 cursor-pointer " +
  "shadow-[0_0_12px_rgba(255,255,255,0.1),0_0_24px_rgba(255,255,255,0.06),inset_0_0_20px_rgba(255,255,255,0.02)] " +
  "hover:shadow-[0_0_20px_rgba(255,255,255,0.2),0_0_40px_rgba(255,255,255,0.12),inset_0_0_24px_rgba(255,255,255,0.04)] " +
  "hover:-translate-y-2 hover:scale-[1.02]";

const Contact = () => {
  const direct = [
    { label: "Email", href: `mailto:${CONTACT.email}`, icon: Mail, text: CONTACT.email, glow: "border-white/25 hover:border-white/50" },
    { label: "Téléphone", href: `tel:${CONTACT.phoneRaw}`, icon: Phone, text: CONTACT.phone, glow: "border-white/25 hover:border-white/50" },
    {
      label: "WhatsApp",
      href: CONTACT.whatsappUrl,
      icon: IoLogoWhatsapp,
      text: "Écrire sur WhatsApp",
      external: true,
      glow: "border-[#25d366]/40 hover:border-[#25d366] hover:shadow-[0_0_24px_rgba(37,211,102,0.3)]",
      iconColor: "text-[#25d366]",
    },
  ];

  const socials = [
    {
      label: "Instagram",
      href: CONTACT.instagramUrl,
      icon: Instagram,
      text: "@rebellion.luxury",
      external: true,
      glow: "border-white/25 hover:border-white/50 hover:shadow-[0_0_24px_rgba(225,48,108,0.15)]",
      iconColor: "text-white",
    },
    {
      label: "Facebook",
      href: CONTACT.facebookUrl,
      icon: SiFacebook,
      text: "Rebellion luxury",
      external: true,
      glow: "border-white/25 hover:border-white/50 hover:shadow-[0_0_24px_rgba(24,119,242,0.15)]",
      iconColor: "text-white",
    },
    {
      label: "TikTok",
      href: CONTACT.tiktokUrl,
      icon: SiTiktok,
      text: "@rebellion.luxury",
      external: true,
      glow: "border-white/25 hover:border-white/50 hover:shadow-[0_0_24px_rgba(0,242,234,0.15)]",
      iconColor: "text-white",
    },
  ];

  const location = {
    label: "Localisation",
    href: CONTACT.googleMapsUrl,
    icon: MapPin,
    text: CONTACT.location,
    external: true,
    glow: "border-white/25 hover:border-white/50",
  };

  const renderCard = (
    item: { label: string; href: string; icon: React.ElementType; text: string; external?: boolean; glow: string; iconColor?: string },
    i: number,
    delay = 0
  ) => {
    const Icon = item.icon;
    return (
      <motion.a
        key={item.label}
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={`${CARD_BASE} bg-black/70 backdrop-blur-sm border ${item.glow}`}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        initial={{ opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ y: -8, rotateY: 2, transition: { duration: 0.25 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              item.label === "WhatsApp" ? "bg-[#25d366]/20" : "bg-white/10"
            }`}
          >
            <Icon className={`w-6 h-6 ${item.iconColor ?? "text-primary"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</span>
            <p className="font-semibold text-foreground truncate">{item.text}</p>
          </div>
          {item.external && (
            <ExternalLink className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          )}
        </div>
      </motion.a>
    );
  };

  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-1/3 -right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-[100px] pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
          style={{ perspective: "1200px" }}
        >
          {/* Titre 3D LED */}
          <div className="mb-10">
            <motion.span
              className="inline-block px-4 py-2 rounded-full border border-white/25 bg-white/5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-6"
              style={{
                boxShadow:
                  "0 0 12px rgba(255,255,255,0.15), inset 0 0 12px rgba(255,255,255,0.05)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Contact
            </motion.span>
            <motion.h1
              className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3"
              style={{
                textShadow:
                  "0 0 20px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.08), 0 2px 0 rgba(0,0,0,0.3)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              Nous contacter
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Réservez, posez vos questions ou suivez-nous — nous répondons rapidement.
            </motion.p>
          </div>

          {/* Contact direct */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Contact direct
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {direct.map((item, i) => renderCard(item, i, 0.3))}
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Réseaux sociaux
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {socials.map((item, i) => renderCard(item, i, 0.5))}
            </div>
          </div>

          {/* Localisation */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Où nous trouver
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {renderCard(location, 0, 0.6)}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Contact;
