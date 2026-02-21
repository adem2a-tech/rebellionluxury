import { useState } from "react";
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

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/98 backdrop-blur-xl border-b border-white/[0.08]"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-6 lg:gap-10">
          {/* Logo + Nom — style luxe */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group"
            aria-label="Rebellion Luxury - Accueil"
          >
            <div className="rounded-full overflow-hidden h-11 w-11 lg:h-12 lg:w-12 shrink-0 border border-white/25 ring-1 ring-white/10 flex items-center justify-center bg-white/[0.06] transition-all duration-300 group-hover:border-white/40 group-hover:ring-white/20">
              <img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="w-[82%] h-[82%] object-contain"
              />
            </div>
            <span className="font-luxury text-lg lg:text-xl font-semibold tracking-[0.28em] text-white/95 uppercase group-hover:text-white transition-colors duration-300">
              <span className="font-bold tracking-[0.32em]">Rebellion</span>
              <span className="font-medium text-white/90 tracking-[0.2em] ml-0.5">Luxury</span>
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

          {/* Compte + CTA — finition premium */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <UserAccountDropdown />
            <div className="h-5 w-px bg-white/10" aria-hidden />
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenChat()}
              className="font-luxury font-semibold text-sm tracking-[0.2em] uppercase h-10 px-5 rounded-md bg-white text-black border border-white/90 hover:bg-white/95 hover:border-white hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300"
            >
              Louer un véhicule
            </Button>
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


        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="px-4 py-3 border-b border-white/10">
                <UserAccountDropdown className="w-full justify-start" />
              </div>
              <nav className="flex flex-col gap-0 py-4">
                {navItems.flatMap((item) => {
                  const majorTabClass = "block px-4 py-3 min-h-[44px] flex items-center text-sm font-semibold uppercase tracking-wider text-[#ffffff] hover:text-[#ffffff] hover:bg-muted/50 active:bg-muted touch-manipulation";
                  const subTabClass = "block px-6 py-3 min-h-[44px] flex items-center text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted touch-manipulation";
                  const separator = <div key={`sep-${item.label}`} className="mx-4 my-1 border-b border-white/10" aria-hidden />;
                  if ("subItems" in item && item.subItems) {
                    return [
                      <Link key={item.label} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={majorTabClass}>
                        {item.label}
                      </Link>,
                      ...item.subItems.map((sub) => (
                        <Link key={sub.label} to={sub.href} onClick={() => setIsMobileMenuOpen(false)} className={subTabClass}>
                          {sub.label}
                        </Link>
                      )),
                      separator,
                    ];
                  }
                  return [
                    <Link key={item.label} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={majorTabClass}>
                      {item.label}
                    </Link>,
                    separator,
                  ];
                })}
                <div className="px-4 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-primary font-bold uppercase tracking-wider"
                    onClick={() => {
                      onOpenChat();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Louer un véhicule
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
