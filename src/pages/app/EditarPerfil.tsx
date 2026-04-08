import { useState } from "react";
import { Camera, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TikTokIcon } from "@/components/TikTokIcon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EditarPerfil = () => {
  const [name, setName] = useState("Meu Usuário");

  const { data: tokens } = useQuery({
    queryKey: ["tiktok-tokens"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tiktok_shop_tokens")
        .select("seller_name, app_key");
      return data ?? [];
    },
  });

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Editar Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Atualize suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group cursor-pointer">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                <User size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Alterar foto</p>
            <p className="text-xs text-muted-foreground">JPG, PNG. Máximo 2MB.</p>
          </div>
        </CardContent>
      </Card>

      {/* Nome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <Button size="sm">Salvar</Button>
        </CardContent>
      </Card>

      {/* Conexões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Conexões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokens && tokens.length > 0 ? (
            tokens.map((token) => (
              <div key={token.app_key} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-accent/30">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0">
                  <TikTokIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">TikTok Shop</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {token.seller_name || "Conta conectada"}
                  </p>
                </div>
                <span className="ml-auto text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  Conectado
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conexão encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarPerfil;
