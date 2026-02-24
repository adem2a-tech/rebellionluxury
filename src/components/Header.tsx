import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import UserAccountDropdown from "./UserAccountDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onOpenChat: (initialMessage?: string) => void;
}

const vehiculesSubItems = [
  { label: "Catalogue", href: "/vehicules" },
  { label: "Calculez le prix", href: "/calculer-prix" },
];

const aProposSubItems = [
  { label: "Rentabilité", href: "/rentabilite" },
  { label: "Transport", href: "/transport" },
  { label: "Réseaux", href: "/reseaux" },
];

const loueTonVehiculeSubItems = [
  { label: "Louer", href: "/loue-ton-vehicule" },
  { label: "Voir mes demandes", href: "/verifier-ma-demande" },
];

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Véhicules", href: "/vehicules", subItems: vehiculesSubItems },
  { label: "Loue ton propre véhicule", href: "/loue-ton-vehicule", subItems: loueTonVehiculeSubItems },
  { label: "À propos", href: "/a-propos", subItems: aProposSubItems },
  { label: "Espace pro", href: "/espace-pro" },
  { label: "Contact", href: "/contact" },
];

const Header = ({ onOpenChat }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Overlay mobile : clic dehors pour fermer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/98 backdrop-blur-xl border-b border-white/[0.08]"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4 lg:gap-6">
          {/* Logo + Nom — style luxe */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Rebellion Luxury - Accueil"
          >
            <div className="logo-round overflow-hidden h-10 w-10 lg:h-12 lg:w-12 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-luxury text-sm lg:text-base font-semibold tracking-[0.24em] text-white/95 uppercase group-hover:text-white transition-colors duration-300">
              <span className="font-bold tracking-[0.28em]">Rebellion</span>
              <span className="font-medium text-white/90 tracking-[0.18em] ml-0.5">Luxury</span>
            </span>
          </Link>

          {/* Desktop Nav — menu haut de gamme */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                ("subItems" in item && item.subItems.some((s) => location.pathname === s.href));
              const navLinkClass = `relative px-4 py-3 text-[11px] font-medium uppercase tracking-[0.22em] transition-all duration-300 flex items-center gap-1.5 rounded-md ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`;
              const underlineClass = "absolute bottom-0 left-4 right-4 h-px bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left";
              if ("subItems" in item && item.subItems) {
                return (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <button className={`${navLinkClass} group hover:bg-white/[0.04]`}>
                        <span className="whitespace-nowrap">{item.label}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className={isActive ? "absolute bottom-0 left-4 right-4 h-px bg-white/50" : underlineClass} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="flex flex-row gap-0.5 p-2 min-w-0 w-auto border border-white/10 bg-black/95 backdrop-blur-xl rounded-lg shadow-2xl shadow-black/50"
                    >
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] rounded-md whitespace-nowrap transition-all duration-200 ${
                            location.pathname === sub.href
                              ? "text-white bg-white/10"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Link key={item.label} to={item.href} className={`${navLinkClass} group hover:bg-white/[0.04]`}>
                  <span className="whitespace-nowrap">{item.label}</span>
                  <span className={isActive ? "absolute bottom-0 left-4 right-4 h-px bg-white/50" : underlineClass} />
                </Link>
              );
            })}
          </nav>

          {/* Compte utilisateur */}
          <div className="hidden lg:flex items-center shrink-0">
            <UserAccountDropdown />
          </div>

          {/* Mobile menu button — 44px min touch target */}
          <button
            type="button"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-foreground rounded-lg hover:bg-muted active:bg-muted/80 touch-manipulation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>


        {/* Mobile Menu — fluide, police haut de gamme, beau */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:hidden overflow-hidden border-t border-white/[0.06] bg-black"
            >
              <nav
                className="flex flex-col gap-1 py-4 pb-5 px-3 antialiased overflow-y-auto overflow-x-hidden"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  maxHeight: "min(calc(100vh - 4rem), 85vh)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] pl-4 pr-4 flex items-center rounded-2xl text-[17px] font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] transition-all duration-300 ease-out border-l-2 border-white/40">
                  Accueil
                </Link>

                <div className="pt-3 pb-1.5 px-4 flex items-center gap-2.5">
                  <span className="text-white/35 text-sm">—</span>
                  <span className="text-[13px] font-semibold uppercase tracking-wider text-white/50">Véhicules</span>
                </div>
                <Link to="/vehicules" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Catalogue
                </Link>
                <Link to="/calculer-prix" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Calculez le prix
                </Link>

                <div className="pt-4 pb-1.5 px-4 flex items-center gap-2.5">
                  <span className="text-white/35 text-sm">—</span>
                  <span className="text-[13px] font-semibold uppercase tracking-wider text-white/50">Loue ton véhicule</span>
                </div>
                <Link to="/loue-ton-vehicule" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Louer
                </Link>
                <Link to="/verifier-ma-demande" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Voir mes demandes
                </Link>

                <Link to="/a-propos" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] pl-4 pr-4 flex items-center rounded-2xl text-[17px] font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] transition-all duration-300 ease-out border-l-2 border-white/40">
                  À propos
                </Link>
                <Link to="/rentabilite" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Rentabilité
                </Link>
                <Link to="/transport" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Transport
                </Link>
                <Link to="/reseaux" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] px-4 flex items-center rounded-2xl text-[17px] font-medium text-white/95 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-300 ease-out">
                  Réseaux
                </Link>

                <div className="my-4 mx-2 h-px bg-white/[0.06]" aria-hidden />

                {/* Contact + Espace pro en bas à gauche */}
                <div className="flex flex-col gap-1.5 w-full items-start">
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] pl-4 pr-4 flex items-center rounded-2xl text-[17px] font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] transition-all duration-300 ease-out border-l-2 border-white/40">
                    Contact
                  </Link>
                  <Link to="/espace-pro" onClick={() => setIsMobileMenuOpen(false)} className="min-h-[52px] pl-4 pr-4 flex items-center rounded-2xl text-[17px] font-medium text-white/80 hover:bg-white/[0.06] hover:text-white/95 active:bg-white/[0.08] transition-all duration-300 ease-out">
                    Espace pro
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => { onOpenChat(); setIsMobileMenuOpen(false); }}
                  className="min-h-[56px] w-full flex items-center justify-center gap-3 rounded-2xl bg-white text-black font-semibold text-[17px] hover:bg-white/95 active:scale-[0.98] transition-all duration-300 ease-out shadow-[0_2px_16px_rgba(255,255,255,0.12)] mt-4"
                >
                  Louer un véhicule
                  <span className="logo-round w-6 h-6 shrink-0 flex items-center justify-center overflow-hidden"><img src="/rebellion-luxury-logo.png" alt="" className="w-full h-full object-cover opacity-90" /></span>
                </button>

                <div className="mt-4 min-h-[48px] flex items-center px-4">
                  <UserAccountDropdown className="w-full justify-start text-white/60 hover:text-white text-[15px] transition-colors duration-300" />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
    </>
  );
};

export default Header;
