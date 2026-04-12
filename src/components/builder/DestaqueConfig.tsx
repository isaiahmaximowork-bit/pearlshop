import { Clock } from "lucide-react";
import type { BuilderSection } from "./types";

interface DestaqueConfigProps {
  section: BuilderSection;
}

const DestaqueConfig = ({ section }: DestaqueConfigProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Produto em Destaque</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>Rotação: 7s</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Exibe um produto grande por vez, rotacionando automaticamente entre os 5 primeiros do catálogo.
      </p>
    </div>
  );
};

export default DestaqueConfig;
