import { useState } from "react";
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const TIKTOK_SERVICE_ID = "7494557571014297434";
const TIKTOK_AUTH_BASE = "https://services.tiktokshop.com/open/authorize";

const Conexoes = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if TikTok Shop is connected by checking for tokens
  const { data: connectionStatus, isLoading, refetch } = useQuery({
    queryKey: ["tiktok-connection-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tiktok_shop_tokens")
        .select("access_token_expires_at, created_at")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { connected: false, expiresAt: null, connectedAt: null };
      }

      const isExpired = new Date(data.access_token_expires_at) < new Date();
      return {
        connected: !isExpired,
        expired: isExpired,
        expiresAt: data.access_token_expires_at,
        connectedAt: data.created_at,
      };
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);

    const authUrl = `${TIKTOK_AUTH_BASE}?service_id=${TIKTOK_SERVICE_ID}&state=pearlshop`;

    window.open(authUrl, "_blank", "width=600,height=700");
    setIsConnecting(false);

    // Poll for connection status after a delay
    const interval = setInterval(() => refetch(), 5000);
    setTimeout(() => clearInterval(interval), 60000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conexões</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas integrações com plataformas externas.
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* TikTok Shop Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.79a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
              </svg>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">TikTok Shop</CardTitle>
              <CardDescription>
                Conecte sua conta do TikTok Shop para acessar produtos e gerenciar afiliações.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando conexão...</span>
              </div>
            ) : connectionStatus?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Conectado</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Conectado em: {formatDate(connectionStatus.connectedAt)}</p>
                  <p>Token expira em: {formatDate(connectionStatus.expiresAt)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleConnect}>
                  Reconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {connectionStatus?.expired ? "Token expirado" : "Não conectado"}
                  </span>
                </div>
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Conectar TikTok Shop
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conexoes;
