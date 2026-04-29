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
import Historico from "./pages/app/Historico.tsx";
import StorePage from "./pages/StorePage.tsx";
import AvisoLegal from "./pages/AvisoLegal.tsx";
const queryClient = new QueryClient();

const App = () => (
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
            </Route>
            <Route path="/app/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
