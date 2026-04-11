import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import type { BuilderSection } from "./types";

interface DestaqueConfigProps {
  section: BuilderSection;
}

const DestaqueConfig = ({ section }: DestaqueConfigProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Produtos em Destaque</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>Rotação: 7s</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Selecione até 5 produtos para exibir em destaque.</p>
      <Button variant="outline" size="sm" className="w-full gap-2">
        <Plus size={14} /> Selecionar Produtos
      </Button>
    </div>
  );
};

export default DestaqueConfig;
