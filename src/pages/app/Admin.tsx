import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Trash2, Plus, Shield, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ADMIN_EMAIL = "isaiahmaximowork@gmail.com";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  tiktok_handle: string;
  created_at: string;
  email?: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar perfis: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newEmail || !newPassword) { toast.error("Preencha email e senha"); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "create", email: newEmail, password: newPassword, name: newName },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha ao criar conta");
      toast.success("Conta criada com sucesso!");
      setCreateOpen(false);
      setNewEmail(""); setNewPassword(""); setNewName("");
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta conta? Esta ação é irreversível.")) return;
    setDeletingId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "delete", userId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha ao deletar conta");
      toast.success("Conta deletada!");
      setProfiles(prev => prev.filter(p => p.user_id !== userId));
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar conta");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/app" replace />;
  }

  const filtered = profiles.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tiktok_handle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Gerenciamento de contas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-5">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total de Contas</p>
          <p className="text-3xl font-black mt-1">{profiles.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-5">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Últimas 24h</p>
          <p className="text-3xl font-black mt-1">
            {profiles.filter(p => new Date(p.created_at) > new Date(Date.now() - 86400000)).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-5">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Últimos 7 dias</p>
          <p className="text-3xl font-black mt-1">
            {profiles.filter(p => new Date(p.created_at) > new Date(Date.now() - 604800000)).length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, ID ou TikTok..."
            className="pl-9 rounded-xl" />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600">
          <Plus size={16} /> Criar Conta
        </Button>
        <Button variant="outline" onClick={fetchProfiles} className="rounded-xl">
          Atualizar
        </Button>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">User ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">TikTok</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Criado em</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{p.user_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-xs">{p.tiktok_handle || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon"
                        onClick={() => handleDeleteAccount(p.user_id)}
                        disabled={deletingId === p.user_id || p.user_id === user.id}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        {deletingId === p.user_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create account dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={18} /> Criar Nova Conta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Nome</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do usuário" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Senha</label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className="rounded-xl" />
            </div>
            <Button onClick={handleCreateAccount} disabled={creating}
              className="w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creating ? "Criando..." : "Criar Conta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
