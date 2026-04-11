import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, GripVertical, Image, Star, ShoppingBag, 
  ChevronUp, ChevronDown, X, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SectionType = "banner" | "destaque" | "produtos";

interface BuilderSection {
  id: string;
  type: SectionType;
  label: string;
}

const sectionConfig: Record<SectionType, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  banner: {
    label: "Banner",
    icon: <Image size={16} />,
    description: "Até 3 banners rotativos (5s)",
    color: "text-blue-400",
  },
  destaque: {
    label: "Destaque",
    icon: <Star size={16} />,
    description: "Até 5 produtos em destaque (7s)",
    color: "text-amber-400",
  },
  produtos: {
    label: "Produtos",
    icon: <ShoppingBag size={16} />,
    description: "Seção normal de produtos",
    color: "text-emerald-400",
  },
};

const Builder = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<BuilderSection[]>([
    { id: "1", type: "banner", label: "Banner Principal" },
    { id: "2", type: "destaque", label: "Destaques" },
    { id: "3", type: "produtos", label: "Todos os Produtos" },
  ]);
  const [addingSection, setAddingSection] = useState(false);

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const newSections = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return newSections;
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    toast.success("Seção removida");
  }, []);

  const addSection = useCallback((type: SectionType) => {
    const config = sectionConfig[type];
    setSections((prev) => [
      ...prev,
      { id: Date.now().toString(), type, label: config.label },
    ]);
    setAddingSection(false);
    toast.success(`Seção "${config.label}" adicionada`);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Main Preview Area */}
      <div className="flex-1 bg-muted/30 overflow-y-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma seção adicionada</p>
              <p className="text-sm text-muted-foreground/60">Adicione seções pela barra lateral</p>
            </div>
          )}

          {sections.map((section) => {
            const config = sectionConfig[section.type];
            return (
              <div
                key={section.id}
                className="rounded-2xl border-2 border-dashed border-border bg-card p-6 md:p-8 transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={config.color}>{config.icon}</span>
                  <span className="font-bold text-foreground text-sm">{section.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{config.description}</span>
                </div>

                {section.type === "banner" && (
                  <div className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center">
                    <div className="text-center">
                      <Image size={32} className="text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Arraste ou clique para adicionar banners</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Até 3 banners • Rotação a cada 5s</p>
                    </div>
                  </div>
                )}

                {section.type === "destaque" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-[3/4] rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                        <div className="text-center">
                          <Star size={20} className="text-muted-foreground/30 mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground">Produto {i}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.type === "produtos" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                        <div className="text-center">
                          <ShoppingBag size={16} className="text-muted-foreground/30 mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground">Produto</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 lg:w-80 border-l border-border bg-card flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground">
                PearlShop <span className="text-muted-foreground font-medium">— Builder</span>
              </h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/app/builder")}>
              <ArrowLeft size={16} />
            </Button>
          </div>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seções</p>
            <span className="text-xs text-muted-foreground">{sections.length}</span>
          </div>

          {sections.map((section, index) => {
            const config = sectionConfig[section.type];
            return (
              <div
                key={section.id}
                className="group flex items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-primary/30 transition-all"
              >
                <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                <span className={`flex-shrink-0 ${config.color}`}>{config.icon}</span>
                <span className="text-sm font-medium text-foreground truncate flex-1">{section.label}</span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={() => moveSection(index, "down")}
                    disabled={index === sections.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Section */}
        <div className="p-4 border-t border-border">
          {addingSection ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adicionar Seção</p>
                <button onClick={() => setAddingSection(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              {(Object.keys(sectionConfig) as SectionType[]).map((type) => {
                const config = sectionConfig[type];
                return (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
                  >
                    <span className={config.color}>{config.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-[10px] text-muted-foreground">{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Button onClick={() => setAddingSection(true)} variant="outline" className="w-full gap-2">
              <Plus size={14} /> Adicionar Seção
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Builder;
