import { useEffect, useState } from "react";
import { User, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TikTokIcon from "@/components/TikTokIcon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import apple from "@/assets/avatars/apple.jpg";
import watermelon from "@/assets/avatars/watermelon.jpg";
import banana from "@/assets/avatars/banana.jpg";
import strawberry from "@/assets/avatars/strawberry.jpg";
import orange from "@/assets/avatars/orange.jpg";
import grape from "@/assets/avatars/grape.jpg";
import pineapple from "@/assets/avatars/pineapple.jpg";
import peach from "@/assets/avatars/peach.jpg";

const avatarOptions = [
  { id: "watermelon", src: watermelon, label: "Melancia" },
  { id: "banana", src: banana, label: "Banana" },
  { id: "strawberry", src: strawberry, label: "Morango" },
  { id: "orange", src: orange, label: "Laranja" },
  { id: "grape", src: grape, label: "Uva" },
  { id: "pineapple", src: pineapple, label: "Abacaxi" },
  { id: "peach", src: peach, label: "Pêssego" },
  { id: "apple", src: apple, label: "Maçã" },
];

const EditarPerfil = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("strawberry");
  const [isSaving, setIsSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_id, tiktok_handle")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tokens } = useQuery({
    queryKey: ["tiktok-tokens"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tiktok_shop_tokens")
        .select("seller_name, app_key");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;

    const fallbackName = typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : user.email?.split("@")[0] ?? "";
    const fallbackAvatarId = typeof user.user_metadata?.avatar_id === "string"
      ? user.user_metadata.avatar_id
      : "strawberry";

    setName(profile?.name || fallbackName);
    setSelectedAvatarId(profile?.avatar_id || fallbackAvatarId);
  }, [profile, user]);

  const selectedAvatar = avatarOptions.find((option) => option.id === selectedAvatarId)?.src ?? strawberry;

  const handleSave = async () => {
    if (!user) {
      toast.error("Faça login novamente para salvar seu perfil.");
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Digite seu nome para salvar.");
      return;
    }

    setIsSaving(true);

    const profilePayload = {
      name: trimmedName,
      avatar_id: selectedAvatarId,
      tiktok_handle:
        profile?.tiktok_handle ||
        (typeof user.user_metadata?.tiktok_handle === "string" ? user.user_metadata.tiktok_handle : ""),
    };

    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("user_id", user.id)
      .select("id");

    if (updateError) {
      setIsSaving(false);
      toast.error(updateError.message);
      return;
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        ...profilePayload,
      });

      if (insertError) {
        setIsSaving(false);
        toast.error(insertError.message);
        return;
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["profile-settings", user.id] }),
    ]);

    setIsSaving(false);
    toast.success("Perfil salvo com sucesso!");
  };

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
        <CardContent className="space-y-5">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-2 border-primary shadow-lg">
              <AvatarImage src={selectedAvatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                <User size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedAvatarId ? "Avatar selecionado" : "Escolha um avatar"}
              </p>
              <p className="text-xs text-muted-foreground">Clique em uma fruta abaixo</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {avatarOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelectedAvatarId(opt.id)}
                className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all duration-200 hover:scale-110 ${
                  selectedAvatarId === opt.id
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={opt.src}
                  alt={opt.label}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
                {selectedAvatarId === opt.id && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Check size={18} className="text-primary-foreground drop-shadow" />
                  </div>
                )}
              </button>
            ))}
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
          <Button size="sm" onClick={handleSave} disabled={isSaving || !user}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
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
                  <TikTokIcon size={20} />
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
