import { useState, useEffect, Component, lazy, Suspense, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import IdentificationScreen from "@/components/IdentificationScreen";
import TransitionScreen from "@/components/TransitionScreen";
import SiteLayout from "@/components/SiteLayout";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import APropos from "./pages/APropos";
import Reseaux from "./pages/Reseaux";
import Transport from "./pages/Transport";
import Vehicules from "./pages/Vehicules";
import VehiculeDetail from "./pages/VehiculeDetail";
import Rentabilite from "./pages/Rentabilite";
import LoueTonVehicule from "./pages/LoueTonVehicule";
import VerifierMaDemande from "./pages/VerifierMaDemande";
import CalculerPrix from "./pages/CalculerPrix";
import Contact from "./pages/Contact";
import EspacePro from "./pages/EspacePro";
import NotFound from "./pages/NotFound";
import { ProAuthProvider } from "./contexts/ProAuthContext";
import { VehicleRequestsProvider } from "./contexts/VehicleRequestsContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";

/** Mettre à false quand le client répond pour réactiver le site */
const MAINTENANCE_REMISE = true;

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const AI_FEATURES = [
  "Répond à toutes les questions sur les caractéristiques des véhicules (puissance, options, finitions…)",
  "Aide à comparer les modèles et à choisir selon l’usage",
  "Note les demandes et les infos des visiteurs pour le suivi",
  "Assiste en direct les gens qui visitent le site",
];

function MaintenanceRemiseScreen() {
  return (
    <div
      className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="w-10 h-10 border-2 border-amber-400/60 border-t-amber-400 rounded-full animate-spin mb-6" />
      <h1 className="text-xl sm:text-2xl font-medium text-zinc-100 mb-2 text-center">
        Le site est prêt — vraiment au top.
      </h1>
      <p className="text-zinc-400 max-w-md mb-6 text-center text-sm">
        Aucune réponse de la part de Rebellion Luxury. Merci de me contacter au plus vite — pas d’accès au site tant que tu ne m’as pas contacté.
      </p>
      <div className="text-left max-w-md w-full mb-6">
        <p className="text-amber-400/90 text-sm font-medium mb-3">Ce que le site propose :</p>
        <ul className="space-y-2">
          <li className="text-zinc-400 text-sm flex items-center gap-2">
            <span className="text-amber-400 shrink-0">✓</span>
            Interface fluide revue
          </li>
          <li className="text-zinc-400 text-sm">
            <span className="text-amber-400 shrink-0">✓</span>{" "}
            <span className="font-medium text-zinc-300">IA de fou</span>
            <ul className="mt-2 ml-4 space-y-1.5 border-l border-zinc-700 pl-3">
              {AI_FEATURES.map((aiFeature) => (
                <li key={aiFeature} className="text-zinc-400 text-sm">
                  {aiFeature}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <p className="text-zinc-500 text-sm mb-2">Contacter :</p>
      <a
        href="tel:+33669081072"
        className="text-amber-400 hover:text-amber-300 text-lg font-medium tracking-wide transition-colors"
      >
        07 69 08 10 72
      </a>
    </div>
  );
}

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            color: "#e5e5e5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Une erreur s&apos;est produite</h1>
          <p style={{ color: "#a3a3a3", marginBottom: 16, maxWidth: 400 }}>{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { phase, setPhase, isIdentified, loadedFromStorage } = useUser();
  const [justFinishedTransition, setJustFinishedTransition] = useState(false);

  if (!isIdentified || phase === "identification") {
    return <IdentificationScreen key="identification" />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "transition" && (
          <TransitionScreen
            key="transition"
            onComplete={() => {
              setPhase("app");
              setJustFinishedTransition(true);
            }}
            isReturning={loadedFromStorage}
          />
        )}
      </AnimatePresence>
      {phase === "app" && (
    <BrowserRouter>
      <Routes>
        <Route
          path="admin/*"
          element={
            <AdminAuthProvider>
              <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400">Chargement...</div>}>
                <AdminDashboard />
              </Suspense>
            </AdminAuthProvider>
          }
        />
        <Route path="espace-pro" element={<EspacePro />} />
        <Route element={<SiteLayout justFinishedTransition={justFinishedTransition} />}>
          <Route index element={<Index />} />
          <Route path="vehicules" element={<Vehicules />} />
          <Route path="vehicules/:slug" element={<VehiculeDetail />} />
          <Route path="rentabilite" element={<Rentabilite />} />
          <Route path="a-propos" element={<APropos />} />
          <Route path="reseaux" element={<Reseaux />} />
          <Route path="transport" element={<Transport />} />
          <Route path="loue-ton-vehicule" element={<LoueTonVehicule />} />
          <Route path="verifier-ma-demande" element={<VerifierMaDemande />} />
          <Route path="calculer-prix" element={<CalculerPrix />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
      )}
    </>
  );
}

const App = () => {
  if (MAINTENANCE_REMISE) {
    return <MaintenanceRemiseScreen />;
  }
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserProvider>
            <ProAuthProvider>
              <VehicleRequestsProvider>
                <ReservationProvider>
                  <AppContent />
                  <CookieConsent />
                </ReservationProvider>
              </VehicleRequestsProvider>
            </ProAuthProvider>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
