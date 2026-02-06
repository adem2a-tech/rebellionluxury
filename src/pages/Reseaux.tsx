import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Instagram, ExternalLink, Music2 } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { CONTACT } from "@/data/chatKnowledge";

const socialLinks = [
  {
    name: "Instagram",
    href: CONTACT.instagramUrl,
    icon: Instagram,
    gradientFrom: "#f09433",
    gradientTo: "#e6683c",
    description: "Suivez nos supercars et l'actualité Rebellion Luxury.",
  },
  {
    name: "WhatsApp",
    href: CONTACT.whatsappUrl,
    icon: IoLogoWhatsapp,
    gradientFrom: "#25d366",
    gradientTo: "#128c7e",
    description: "Contactez-nous pour réserver ou poser vos questions.",
  },
  {
    name: "TikTok",
    href: CONTACT.tiktokUrl,
    icon: Music2,
    gradientFrom: "#25f4ee",
    gradientTo: "#fe2c55",
    description: "Vidéos, reels et l'univers Rebellion Luxury.",
  },
];

const Reseaux = () => {
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
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            Suivez-nous
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Mes <span className="text-gradient-orange">réseaux</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            Retrouvez Rebellion Luxury sur les réseaux sociaux : actualités, photos de nos véhicules et offres.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-8"
          >
            <video
              src="/reseaux-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-6xl mx-auto rounded-2xl shadow-xl object-cover mb-6 min-h-[400px] h-[70vh] max-h-[70vh]"
              aria-label="Vidéo Rebellion Luxury"
            />
            <motion.a
              href={CONTACT.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tiktok-link-led inline-flex items-center gap-3 font-display hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg px-5 py-3 text-xl"
              aria-label="Voir le compte TikTok Rebellion Luxury"
            >
              <Music2 className="w-6 h-6 shrink-0" />
              Check mon compte TikTok
            </motion.a>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                className="group glass-card rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_hsl(0_0%_100%/0.2)]"
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${social.gradientFrom}, ${social.gradientTo})`,
                  }}
                >
                  <social.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{social.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{social.description}</p>
                <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                  Visiter la page
                  <ExternalLink className="w-4 h-4" />
                </span>
              </motion.a>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-sm mt-10"
          >
            Les liens s'ouvrent dans un nouvel onglet. Remplacez les URLs par vos vrais profils Instagram et WhatsApp.
          </motion.p>
        </motion.section>
      </div>
    </div>
  );
};

export default Reseaux;
