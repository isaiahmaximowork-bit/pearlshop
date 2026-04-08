import { Bell, User, Plus } from "lucide-react";

export function AppHeader() {
  const tokens = 12480;

  return (
    <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-end gap-6">
      {/* Token counter with Gemini border */}
      <div className="gemini-pill-wrapper group cursor-pointer active:scale-95 transition-transform">
        <div className="bg-card border border-border px-4 py-2 rounded-[1.25rem] flex items-center gap-3 relative z-[2]">
          <span className="gemini-star">✦</span>
          <span className="text-sm font-black text-foreground leading-tight tracking-tight">
            {tokens.toLocaleString()}
          </span>
          <Plus size={14} className="text-primary ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-accent transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </button>

        <button className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-background shadow-lg overflow-hidden relative group">
          <User size={20} className="relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </header>
  );
}
