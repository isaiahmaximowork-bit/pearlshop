import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, GripVertical, Image, Star, ShoppingBag,
  ChevronUp, ChevronDown, X, ArrowLeft, Upload, Settings2, Clock
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type SectionType = "banner" | "destaque" | "produtos";

interface BannerItem {
  id: string;
  imageUrl?: string;
  link?: string;
}

interface BuilderSection {
  id: string;
  type: SectionType;
  label: string;
  banners?: BannerItem[];
}

const sectionConfig: Record<SectionType, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  banner: {
    label: "Banner",
    icon: <Image size={16} />,
    description: "Até 3 banners rotativos (5s)",
    color: "text-foreground",
  },
  destaque: {
    label: "Destaque",
    icon: <Star size={16} />,
    description: "Até 5 produtos em destaque (7s)",
    color: "text-foreground",
  },
  produtos: {
    label: "Produtos",
    icon: <ShoppingBag size={16} />,
    description: "Seção normal de produtos",
    color: "text-foreground",
  },
};

const Builder = () => {
  const [sections, setSections] = useState<BuilderSection[]>([
    { id: "1", type: "banner", label: "Banner Principal", banners: [] },
    { id: "2", type: "destaque", label: "Destaques" },
    { id: "3", type: "produtos", label: "Todos os Produtos" },
  ]);
  const [addingSection, setAddingSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
    toast.success("Seção removida");
  }, [selectedSectionId]);

  const addSection = useCallback((type: SectionType) => {
    const config = sectionConfig[type];
    const newSection: BuilderSection = {
      id: Date.now().toString(),
      type,
      label: config.label,
      ...(type === "banner" ? { banners: [] } : {}),
    };
    setSections((prev) => [...prev, newSection]);
    setAddingSection(false);
    toast.success(`Seção "${config.label}" adicionada`);
  }, []);

  const addBannerToSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || s.type !== "banner") return s;
        if ((s.banners?.length || 0) >= 3) {
          toast.error("Máximo de 3 banners por seção");
          return s;
        }
        return { ...s, banners: [...(s.banners || []), { id: Date.now().toString() }] };
      })
    );
  }, []);

  const removeBannerFromSection = useCallback((sectionId: string, bannerId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, banners: s.banners?.filter((b) => b.id !== bannerId) };
      })
    );
  }, []);

  const updateSectionLabel = useCallback((sectionId: string, label: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, label } : s)));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-80 lg:w-96 border-r border-border bg-card flex flex-col h-full shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={logo} alt="PearlShop" width={28} height={28} className="rounded-lg" />
          <h2 className="text-sm font-black tracking-tight text-foreground">
            PearlShop <span className="text-muted-foreground font-medium">— Builder</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto"
            onClick={() => window.close()}
            title="Voltar"
          >
            <ArrowLeft size={16} />
          </Button>
        </div>

        {/* If a section is selected, show config; otherwise show sections list */}
        {selectedSection ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings2 size={14} className="text-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configuração</p>
                </div>
                <button
                  onClick={() => setSelectedSectionId(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome da Seção</Label>
                  <Input
                    value={selectedSection.label}
                    onChange={(e) => updateSectionLabel(selectedSection.id, e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={sectionConfig[selectedSection.type].color}>
                    {sectionConfig[selectedSection.type].icon}
                  </span>
                  <span>{sectionConfig[selectedSection.type].label}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4">
              {selectedSection.type === "banner" && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Banners ({selectedSection.banners?.length || 0}/3)
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock size={10} />
                      <span>Rotação: 5s</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedSection.banners?.map((banner, idx) => (
                      <div key={banner.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                        <div className="w-16 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
                          {banner.imageUrl ? (
                            <img src={banner.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Upload size={12} className="text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">Banner {idx + 1}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {banner.imageUrl || "Nenhuma imagem"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeBannerFromSection(selectedSection.id, banner.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {(selectedSection.banners?.length || 0) < 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => addBannerToSection(selectedSection.id)}
                    >
                      <Plus size={14} /> Adicionar Banner
                    </Button>
                  )}
                </>
              )}

              {selectedSection.type === "destaque" && (
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
              )}

              {selectedSection.type === "produtos" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Produtos</p>
                  <p className="text-xs text-muted-foreground">
                    Esta seção exibe automaticamente todos os seus produtos afiliados.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => removeSection(selectedSection.id)}
              >
                <Trash2 size={14} /> Remover Seção
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                    onClick={() => setSelectedSectionId(section.id)}
                    className="group flex items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                    <span className={`flex-shrink-0 ${config.color}`}>{config.icon}</span>
                    <span className="text-sm font-medium text-foreground truncate flex-1">{section.label}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(index, "up"); }}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(index, "down"); }}
                        disabled={index === sections.length - 1}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

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
          </>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/30">
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
            const isSelected = selectedSectionId === section.id;
            return (
              <div
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`rounded-2xl border-2 border-dashed p-6 md:p-8 transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
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
                      <p className="text-xs text-muted-foreground">
                        {(section.banners?.length || 0) > 0
                          ? `${section.banners!.length}/3 banners adicionados`
                          : "Clique para configurar banners"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Rotação a cada 5s</p>
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
    </div>
  );
};

export default Builder;
