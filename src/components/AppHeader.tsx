import { Bell, Plus, Pencil, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import banana from '@/assets/avatars/banana.jpg';
import grape from '@/assets/avatars/grape.jpg';
import orange from '@/assets/avatars/orange.jpg';
import peach from '@/assets/avatars/peach.jpg';
import pineapple from '@/assets/avatars/pineapple.jpg';
import strawberry from '@/assets/avatars/strawberry.jpg';
import watermelon from '@/assets/avatars/watermelon.jpg';
import apple from '@/assets/avatars/apple.jpg';

const avatarMap: Record<string, string> = {
  banana, grape, orange, peach, pineapple, strawberry, watermelon, apple,
};

export function AppHeader() {
  const tokens = 12480;
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_id')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const avatarSrc = avatarMap[profile?.avatar_id || 'strawberry'] || strawberry;

  return (
    <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-end gap-6">
      <div className="gemini-pill-wrapper group cursor-pointer active:scale-95 transition-all duration-500 ease-in-out hover:scale-[1.25]">
        <div className="bg-card border border-border px-4 py-2 rounded-[1.25rem] flex items-center gap-3 relative z-[2] transition-all duration-300 group-hover:border-[1.5px]">
          <span className="gemini-star">✦</span>
          <span className="text-sm font-black text-foreground leading-tight tracking-tight">
            {tokens.toLocaleString()}
          </span>
          <div className="w-5 h-5 rounded-full flex items-center justify-center ml-1 transition-all duration-300 group-hover:bg-primary">
            <Plus size={12} className="text-primary opacity-40 group-hover:opacity-100 group-hover:text-primary-foreground transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-accent transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-border hover:ring-primary transition-all">
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/perfil")}>
              <Pencil size={16} />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
              <LogOut size={16} />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
