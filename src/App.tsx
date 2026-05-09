import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound.tsx";
import Index from "./pages/Index.tsx";

import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import AppHome from "./pages/app/Home.tsx";
import MeusProdutos from "./pages/app/MeusProdutos.tsx";
import Produtos from "./pages/app/Produtos.tsx";
import Conexoes from "./pages/app/Conexoes.tsx";
import Opcoes from "./pages/app/Opcoes.tsx";
import Builder from "./pages/app/Builder.tsx";
import StoreSettings from "./pages/app/StoreSettings.tsx";
import EditarPerfil from "./pages/app/EditarPerfil.tsx";
import Studio from "./pages/app/Studio.tsx";
import Admin from "./pages/app/Admin.tsx";
import Historico from "./pages/app/Historico.tsx";
import UgcBuilder from "./pages/app/UgcBuilder.tsx";
import Turbinar from "./pages/app/Turbinar.tsx";
import StorePage from "./pages/StorePage.tsx";
import AvisoLegal from "./pages/AvisoLegal.tsx";
import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h1>
            <p className="text-muted-foreground mb-6">Tente recarregar a página ou limpe o cache do seu navegador.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/loja/:slug" element={<StorePage />} />
            <Route path="/aviso-legal" element={<AvisoLegal />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<AppHome />} />
              <Route path="meus-produtos" element={<MeusProdutos />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="opcoes" element={<Opcoes />} />
              <Route path="conexoes" element={<Conexoes />} />
              <Route path="minha-loja" element={<StoreSettings />} />
              <Route path="perfil" element={<EditarPerfil />} />
              <Route path="studio" element={<Studio />} />
              <Route path="historico" element={<Historico />} />
              <Route path="ugc-builder" element={<UgcBuilder />} />
              <Route path="turbinar" element={<Turbinar />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="/app/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
