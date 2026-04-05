import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfUse from "./pages/TermsOfUse.tsx";
import SecurityPage from "./pages/SecurityPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import AppHome from "./pages/app/Home.tsx";
import MeusProdutos from "./pages/app/MeusProdutos.tsx";
import Produtos from "./pages/app/Produtos.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="/seguranca" element={<SecurityPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppHome />} />
            <Route path="meus-produtos" element={<MeusProdutos />} />
            <Route path="produtos" element={<Produtos />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
