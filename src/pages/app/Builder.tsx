import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, GripVertical, Image, Star, ShoppingBag,
  X, ArrowLeft, Save, Settings2, Monitor, Tablet, Smartphone
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import type {
  SectionType, BuilderSection, BannerItem, BannerTextConfig,
} from "@/components/builder/types";
import {
  defaultTextConfig, sectionLabels, sectionDescriptions,
} from "@/components/builder/types";
import BannerConfig from "@/components/builder/BannerConfig";
import DestaqueConfig from "@/components/builder/DestaqueConfig";

const sectionIcons: Record<SectionType, React.ReactNode> = {
  banner: <Image size={16} />,
  destaque: <Star size={16} />,
  produtos: <ShoppingBag size={16} />,
};

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const Builder = () => {
  const [sections, setSections] = useState<BuilderSection[]>([
    { id: "1", type: "banner", title: "", subtitle: "", banners: [] },
    { id: "2", type: "destaque", title: "", subtitle: "" },
    { id: "3", type: "produtos", title: "", subtitle: "" },
  ]);
  const [addingSection, setAddingSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;
  const hasRightPanel = selectedSection && (selectedSection.type === "banner" || selectedSection.type === "destaque");

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDragIndex(null);
    setDropIndicator(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null || dragIndex === index) {
      setDropIndicator(null);
      return;
    }
    // Determine if above or below midpoint
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetLine = e.clientY < midY ? index : index + 1;
    if (targetLine !== dragIndex && targetLine !== dragIndex + 1) {
      setDropIndicator(targetLine);
    } else {
      setDropIndicator(null);
    }
  }, [dragIndex]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dropIndicator === null) return;

    setSections((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      const insertAt = dropIndicator > dragIndex ? dropIndicator - 1 : dropIndicator;
      arr.splice(insertAt, 0, moved);
      return arr;
    });
    setDragIndex(null);
    setDropIndicator(null);
  }, [dragIndex, dropIndicator]);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
    toast.success("Seção removida");
  }, [selectedSectionId]);

  const addSection = useCallback((type: SectionType) => {
    const newSection: BuilderSection = {
      id: Date.now().toString(),
      type,
      title: "",
      subtitle: "",
      ...(type === "banner" ? { banners: [] } : {}),
    };
    setSections((prev) => [...prev, newSection]);
    setAddingSection(false);
    toast.success(`"${sectionLabels[type]}" adicionada`);
  }, []);

  const updateSectionField = useCallback((sectionId: string, field: "title" | "subtitle", value: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)));
  }, []);

  const addBannerToSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || s.type !== "banner") return s;
        if ((s.banners?.length || 0) >= 3) {
          toast.error("Máximo de 3 banners por seção");
          return s;
        }
        return {
          ...s,
          banners: [...(s.banners || []), { id: Date.now().toString(), textConfig: { ...defaultTextConfig } }],
        };
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

  const updateBanner = useCallback((sectionId: string, bannerId: string, updates: Partial<BannerItem>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          banners: s.banners?.map((b) => (b.id === bannerId ? { ...b, ...updates } : b)),
        };
      })
    );
  }, []);

  const updateBannerText = useCallback((sectionId: string, bannerId: string, updates: Partial<BannerTextConfig>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          banners: s.banners?.map((b) =>
            b.id === bannerId ? { ...b, textConfig: { ...b.textConfig, ...updates } } : b
          ),
        };
      })
    );
  }, []);

  const handleSave = () => {
    toast.success("Loja salva com sucesso!");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar — Sections List */}
      <div className="w-72 lg:w-80 border-r border-border bg-card flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={logo} alt="PearlShop" width={28} height={28} className="rounded-lg" />
          <h2 className="text-sm font-black tracking-tight text-foreground">
            PearlShop <span className="text-muted-foreground font-medium">— Builder</span>
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => window.close()} title="Voltar">
            <ArrowLeft size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seções</p>
            <span className="text-xs text-muted-foreground">{sections.length}</span>
          </div>

          {sections.map((section, index) => {
            const isSelected = selectedSectionId === section.id;
            return (
              <div key={section.id}>
                {/* Drop indicator line */}
                {dropIndicator === index && (
                  <div className="h-0.5 bg-primary rounded-full mx-2 my-1 transition-all" />
                )}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`group flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer mb-2 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"
                  } ${dragIndex === index ? "opacity-40" : ""}`}
                >
                  <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                  <span className="flex-shrink-0 text-foreground">{sectionIcons[section.type]}</span>
                  <span className="text-sm font-medium text-foreground truncate flex-1">{sectionLabels[section.type]}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {/* Drop indicator for last position */}
                {index === sections.length - 1 && dropIndicator === sections.length && (
                  <div className="h-0.5 bg-primary rounded-full mx-2 my-1 transition-all" />
                )}
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
              {(["banner", "destaque", "produtos"] as SectionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
                >
                  <span className="text-foreground">{sectionIcons[type]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{sectionLabels[type]}</p>
                    <p className="text-[10px] text-muted-foreground">{sectionDescriptions[type]}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Button onClick={() => setAddingSection(true)} variant="outline" className="w-full gap-2">
              <Plus size={14} /> Adicionar Seção
            </Button>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0">
          {/* Left spacer */}
          <div className="flex-1" />

          {/* Device toggles - center */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDeviceMode("tablet")}
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>

          {/* Save button - right */}
          <div className="flex-1 flex justify-end">
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save size={14} /> Salvar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/30 flex justify-center">
          <div
            className="space-y-4 transition-all duration-300"
            style={{
              width: deviceWidths[deviceMode],
              maxWidth: "100%",
            }}
          >
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhuma seção adicionada</p>
                <p className="text-sm text-muted-foreground/60">Adicione seções pela barra lateral</p>
              </div>
            )}

            {sections.map((section) => {
              const isSelected = selectedSectionId === section.id;
              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`rounded-2xl border-2 border-dashed p-6 md:p-8 transition-all cursor-pointer ${
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {/* Section title & subtitle from config */}
                  {(section.title || section.subtitle) && (
                    <div className="mb-4">
                      {section.title && (
                        <h3 className="font-bold text-foreground text-lg">{section.title}</h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                      )}
                    </div>
                  )}

                  {/* Section label (small) - no icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-muted-foreground">{sectionLabels[section.type]}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sectionDescriptions[section.type]}</span>
                  </div>

                  {section.type === "banner" && (
                    <div className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center overflow-hidden relative">
                      {section.banners?.[0]?.imageUrl ? (
                        <>
                          <img src={section.banners[0].imageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
                          {section.banners[0].textConfig.title && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <p
                                className="text-white text-lg md:text-2xl drop-shadow-lg"
                                style={{
                                  fontFamily: section.banners[0].textConfig.fontFamily,
                                  fontWeight: section.banners[0].textConfig.fontBold ? 700 : 400,
                                  fontStyle: section.banners[0].textConfig.fontItalic ? "italic" : "normal",
                                }}
                              >
                                {section.banners[0].textConfig.title}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <Image size={32} className="text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {(section.banners?.length || 0) > 0
                              ? `${section.banners!.length}/3 banners adicionados`
                              : "Clique para configurar banners"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === "destaque" && (
                    <div className={`grid gap-3 ${deviceMode === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[3/4] rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                          <p className="text-[10px] text-muted-foreground">Produto {i}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === "produtos" && (
                    <div className={`grid gap-3 ${deviceMode === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                          <p className="text-[10px] text-muted-foreground">Produto</p>
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

      {/* Right Sidebar — Section Configuration */}
      {hasRightPanel && selectedSection && (
        <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 size={14} className="text-foreground" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {sectionLabels[selectedSection.type]}
                </p>
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
                <Label className="text-xs text-muted-foreground">Título da Seção</Label>
                <Input
                  value={selectedSection.title}
                  onChange={(e) => updateSectionField(selectedSection.id, "title", e.target.value)}
                  placeholder="Ex: Novidades da Semana"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subtítulo da Seção</Label>
                <Input
                  value={selectedSection.subtitle}
                  onChange={(e) => updateSectionField(selectedSection.id, "subtitle", e.target.value)}
                  placeholder="Ex: Confira os lançamentos"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedSection.type === "banner" && (
              <BannerConfig
                section={selectedSection}
                onAddBanner={addBannerToSection}
                onRemoveBanner={removeBannerFromSection}
                onUpdateBanner={updateBanner}
                onUpdateBannerText={updateBannerText}
              />
            )}
            {selectedSection.type === "destaque" && (
              <DestaqueConfig section={selectedSection} />
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
      )}
    </div>
  );
};

export default Builder;
