import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AlertCircle } from "lucide-react";
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
import { logError } from "@/lib/safari-compat";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null, errorInfo: React.ErrorInfo | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
    logError(error.message, 'ErrorBoundary', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020105',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          overflow: 'auto'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ 
              marginBottom: '32px',
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444'
            }}>
              <AlertCircle size={48} />
            </div>
            
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.05em' }}>
              Ops! Algo deu errado.
            </h1>
            
            <p style={{ color: '#a1a1aa', marginBottom: '32px', fontSize: '16px' }}>
              Ocorreu um erro inesperado. Tente recarregar o estúdio.
            </p>

            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '16px 32px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)'
              }}
            >
              Recarregar Estúdio
            </button>

            {/* Hidden Debug Info - visible on click or specific action if needed */}
            <details style={{ marginTop: '48px', textAlign: 'left', cursor: 'pointer' }}>
              <summary style={{ color: '#3f3f46', fontSize: '12px' }}>Informações técnicas (Debug)</summary>
              <pre style={{ 
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#111',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#71717a',
                overflow: 'auto',
                border: '1px solid #27272a'
              }}>
                {this.state.error?.toString()}
                {"\n\n"}
                {this.state.error?.stack}
              </pre>
            </details>
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
