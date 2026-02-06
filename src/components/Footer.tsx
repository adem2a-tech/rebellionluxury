import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CONTACT, CREATOR } from "@/data/chatKnowledge";

const Footer = () => {
  return (
    <footer id="contact" className="py-16 lg:py-20 border-t border-border relative overflow-hidden led-section">
      {/* Background glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[150px] rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex flex-col gap-1 mb-4">
              <motion.img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="h-12 lg:h-14 w-auto object-contain rounded-sm shadow-md max-w-[180px]"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: "preserve-3d" }}
              />
              <span className="text-muted-foreground text-sm">Suisse, Evionnaz</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Location de véhicules de luxe en Suisse romande. Vivez l'expérience
              de conduire les plus belles supercars.
            </p>
            <div className="flex gap-4">
              <motion.a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Instagram Rebellion Luxury"
                whileHover={{ scale: 1.15, y: -4, rotateZ: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={CONTACT.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Facebook Rebellion Luxury"
                whileHover={{ scale: 1.15, y: -4, rotateZ: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-[#25d366] hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="WhatsApp Rebellion Luxury"
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <IoLogoWhatsapp className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <h4 className="font-display font-semibold mb-4">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: "Accueil", href: "#hero" },
                { label: "Véhicules", href: "/vehicules" },
                { label: "Rentabilité", href: "/rentabilite" },
                { label: "Transport", href: "/transport" },
                { label: "Pourquoi l'IA ?", href: "#why-ai" },
                { label: "Contact", href: "/contact" },
              ].map((link, i) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="inline-block text-muted-foreground hover:text-primary transition-colors text-sm"
                    whileHover={{ x: 6, color: "hsl(var(--primary))" }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <h4 className="font-display font-semibold mb-4">Nos véhicules</h4>
            <ul className="space-y-3">
              {["Audi R8 V8", "McLaren 570S"].map((name, i) => (
                <li key={name}>
                  <motion.a
                    href="/vehicules"
                    className="inline-block text-muted-foreground hover:text-primary transition-colors text-sm"
                    whileHover={{ x: 6, color: "hsl(var(--primary))" }}
                    transition={{ duration: 0.2 }}
                  >
                    {name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <motion.a
                  href={CONTACT.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{CONTACT.location}</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href={`tel:${CONTACT.phoneRaw}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{CONTACT.phone}</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{CONTACT.email}</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-[#25d366] transition-colors text-sm"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoLogoWhatsapp className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </motion.a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* FAQ & Crédits */}
        <motion.div
          className="pt-8 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="max-w-xl mx-auto">
            <AccordionItem value="creator" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-primary py-4">
                Qui a créé ce site ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4">
                <span className="font-semibold text-foreground">{CREATOR.name}</span> a conçu et développé ce site.
                {" "}
                <a
                  href={CREATOR.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25d366] hover:underline"
                >
                  <IoLogoWhatsapp className="w-4 h-4 shrink-0" />
                  Contacter par WhatsApp
                </a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <p className="text-muted-foreground text-sm text-center mt-6">
            © {new Date().getFullYear()} Rebellion Luxury. Tous droits réservés.
            {" · "}
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
