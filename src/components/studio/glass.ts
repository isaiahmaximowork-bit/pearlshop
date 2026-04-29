// Shared glassmorphism class strings for the Studio module
export const glassCard =
  "backdrop-blur-xl bg-card/60 border border-border/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]";

export const glassSelectable = (selected: boolean) =>
  `backdrop-blur-xl rounded-2xl border transition-all duration-300 cursor-pointer ${
    selected
      ? "bg-primary/10 border-primary shadow-[0_8px_32px_hsl(var(--primary)/0.25)] ring-2 ring-primary/40"
      : "bg-card/60 border-border/60 hover:border-primary/40 hover:bg-card/80 shadow-sm"
  }`;
