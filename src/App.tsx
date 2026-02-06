import { useState, useEffect, Component, lazy, Suspense, type ReactNode } from "react";
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

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

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
  const { phase, setPhase, isIdentified } = useUser();
  const [justFinishedTransition, setJustFinishedTransition] = useState(false);

  if (!isIdentified || phase === "identification") {
    return <IdentificationScreen />;
  }

  if (phase === "transition") {
    return (
      <TransitionScreen
        onComplete={() => {
          setPhase("app");
          setJustFinishedTransition(true);
        }}
      />
    );
  }

  return (
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
  );
}

const App = () => (
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
              </ReservationProvider>
            </VehicleRequestsProvider>
          </ProAuthProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
