import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Trash2, GripVertical, Image, Star, ShoppingBag,
  X, ArrowLeft, Save, Settings2, Monitor, Tablet, Smartphone,
  Layers, Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import type {
  SectionType, BuilderSection, BannerItem, BannerTextConfig, TextPosition, FontFamily,
} from "@/components/builder/types";
import {
  defaultTextConfig, sectionLabels, sectionDescriptions, fontOptions,
} from "@/components/builder/types";
import BannerConfig from "@/components/builder/BannerConfig";
import DestaqueConfig from "@/components/builder/DestaqueConfig";

interface StoreTheme {
  titleFont: FontFamily;
  subtitleFont: FontFamily;
  titleColor: string;
  subtitleColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  iconColor: string;
}

const defaultTheme: StoreTheme = {
  titleFont: "Arial",
  subtitleFont: "Arial",
  titleColor: "#ffffff",
  subtitleColor: "#a1a1aa",
  buttonBgColor: "#7c3aed",
  buttonTextColor: "#ffffff",
  iconColor: "#a1a1aa",
};

interface CatalogProduct {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  source_platform: string;
  status: string;
  created_at: string;
  raw_payload: Record<string, unknown> | null;
}

const sectionIcons: Record<SectionType, React.ReactNode> = {
  banner: <Image size={16} />,
  destaque: <Star size={16} />,
  produtos: <ShoppingBag size={16} />,
};

type DeviceMode = "desktop" | "tablet" | "mobile";
type LeftTab = "sections" | "settings";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

// Helper: get text position classes
const getPositionClasses = (position?: TextPosition) => {
  switch (position) {
    case "center": return "items-center justify-center text-center";
    case "center-left": return "items-center justify-start text-left pl-8";
    case "center-right": return "items-center justify-end text-right pr-8";
    case "top-left": return "items-start justify-start text-left pt-6 pl-8";
    case "top-right": return "items-start justify-end text-right pt-6 pr-8";
    case "bottom-left": return "items-end justify-start text-left pb-6 pl-8";
    case "bottom-right": return "items-end justify-end text-right pb-6 pr-8";
    default: return "items-center justify-center text-center";
  }
};

// Helper: get mask gradient style
const getMaskStyle = (mask?: BannerTextConfig["mask"]) => {
  if (!mask?.enabled) return undefined;
  const alpha = mask.intensity / 100;
  const color = `rgba(0,0,0,${alpha})`;
  const transparent = "rgba(0,0,0,0)";
  switch (mask.type) {
    case "full": return { background: color };
    case "bottom": return { background: `linear-gradient(to top, ${color}, ${transparent})` };
    case "top": return { background: `linear-gradient(to bottom, ${color}, ${transparent})` };
    case "left": return { background: `linear-gradient(to right, ${color}, ${transparent})` };
    case "right": return { background: `linear-gradient(to left, ${color}, ${transparent})` };
    default: return { background: color };
  }
};

// Banner carousel with touch swipe for mobile
const BannerPreview = ({ banners, deviceMode }: { banners: BannerItem[]; deviceMode: DeviceMode }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Reset index if banners change
  useEffect(() => {
    if (activeIndex >= banners.length) setActiveIndex(0);
  }, [banners.length, activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < banners.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
    touchStartX.current = null;
  };

  const activeBanner = banners[activeIndex];
  if (!activeBanner) return null;
  const tc = activeBanner.textConfig;

  return (
    <div
      ref={containerRef}
      className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {activeBanner.imageUrl ? (
        <>
          <img src={activeBanner.imageUrl} alt="" className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500" />
          {tc?.mask?.enabled && (
            <div className="absolute inset-0 z-10" style={getMaskStyle(tc.mask)} />
          )}
          {(tc?.title || tc?.subtitle) && (
            <div className={`absolute inset-0 flex flex-col z-20 ${getPositionClasses(tc?.position)}`}>
              {tc?.title && (
                <p
                  className="text-lg md:text-2xl drop-shadow-lg"
                  style={{
                    color: tc.titleColor,
                    fontFamily: `'${tc.fontFamily}', sans-serif`,
                    fontWeight: tc.fontBold ? 700 : 400,
                    fontStyle: tc.fontItalic ? "italic" : "normal",
                  }}
                >
                  {tc.title}
                </p>
              )}
              {tc?.subtitle && (
                <p
                  className="text-sm md:text-base drop-shadow-lg mt-1"
                  style={{
                    color: tc.subtitleColor,
                    fontFamily: `'${tc.fontFamily}', sans-serif`,
                    fontWeight: tc.fontBold ? 600 : 400,
                    fontStyle: tc.fontItalic ? "italic" : "normal",
                  }}
                >
                  {tc.subtitle}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <Image size={32} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Clique para configurar banners</p>
        </div>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow nav for desktop */}
      {banners.length > 1 && deviceMode !== "mobile" && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + banners.length) % banners.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % banners.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};

const Builder = () => {
  const [sections, setSections] = useState<BuilderSection[]>([
    { id: "1", type: "banner", title: "", subtitle: "", banners: [] },
    { id: "2", type: "destaque", title: "Destaques", subtitle: "" },
    { id: "3", type: "produtos", title: "Produtos", subtitle: "" },
  ]);
  const [addingSection, setAddingSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [leftTab, setLeftTab] = useState<LeftTab>("sections");
  const [theme, setTheme] = useState<StoreTheme>({ ...defaultTheme });
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("catalog_products")
        .select("*")
        .limit(20);
      if (data) setCatalogProducts(data as CatalogProduct[]);
    };
    fetchProducts();
  }, []);

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;
  const hasRightPanel = !!selectedSection;

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
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
    if (dragIndex === null) {
      setDropIndicator(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetLine = e.clientY < midY ? index : index + 1;
    // Allow any position, even adjacent — the drop handler will handle no-ops
    setDropIndicator(targetLine);
  }, [dragIndex]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dropIndicator === null) return;

    // No-op if dropping in same position
    if (dropIndicator === dragIndex || dropIndicator === dragIndex + 1) {
      setDragIndex(null);
      setDropIndicator(null);
      return;
    }

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
    const defaultTitles: Record<SectionType, string> = {
      banner: "",
      destaque: "Destaques",
      produtos: "Produtos",
    };
    const newSection: BuilderSection = {
      id: Date.now().toString(),
      type,
      title: defaultTitles[type],
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

  const getProductPrice = (product: CatalogProduct) => {
    const payload = product.raw_payload;
    const skus = payload?.skus as Array<{ price?: { sale_price?: string; tax_exclusive_price?: string; currency?: string } }> | undefined;
    if (!skus?.length) return null;
    const sku = skus[0]?.price;
    const price = sku?.sale_price || sku?.tax_exclusive_price;
    if (!price) return null;
    return `R$${parseFloat(price).toFixed(2)}`;
  };

  const updateSectionBorder = useCallback((sectionId: string, showBorder: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, showBorder } : s)));
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
      {/* Left Sidebar */}
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

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setLeftTab("sections")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
              leftTab === "sections"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers size={14} /> Seções
          </button>
          <button
            onClick={() => setLeftTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
              leftTab === "settings"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={14} /> Configurações
          </button>
        </div>

        {leftTab === "sections" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seções</p>
                <span className="text-xs text-muted-foreground">{sections.length}</span>
              </div>

              {sections.map((section, index) => {
                const isSelected = selectedSectionId === section.id;
                return (
                  <div key={section.id}>
                    {dropIndicator === index && dragIndex !== null && (
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
                    {index === sections.length - 1 && dropIndicator === sections.length && dragIndex !== null && (
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
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Configurações Gerais</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome da Loja</Label>
                  <Input placeholder="Minha Loja" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <Input placeholder="Uma breve descrição da sua loja" className="h-9" />
                </div>
              </div>
            </div>

            {/* Fontes */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Fontes</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fonte do Título</Label>
                  <select
                    value={theme.titleFont}
                    onChange={(e) => setTheme((t) => ({ ...t, titleFont: e.target.value as FontFamily }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fonte do Subtítulo</Label>
                  <select
                    value={theme.subtitleFont}
                    onChange={(e) => setTheme((t) => ({ ...t, subtitleFont: e.target.value as FontFamily }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Cores */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Cores</p>
              <div className="space-y-3">
                {([
                  { key: "titleColor" as const, label: "Cor do Título" },
                  { key: "subtitleColor" as const, label: "Cor do Subtítulo" },
                  { key: "buttonBgColor" as const, label: "Fundo do Botão" },
                  { key: "buttonTextColor" as const, label: "Texto do Botão" },
                  { key: "iconColor" as const, label: "Cor dos Ícones" },
                ]).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme[key]}
                        onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                        className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground w-16">{theme[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {([
              { mode: "desktop" as DeviceMode, icon: Monitor, label: "Desktop" },
              { mode: "tablet" as DeviceMode, icon: Tablet, label: "Tablet" },
              { mode: "mobile" as DeviceMode, icon: Smartphone, label: "Mobile" },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setDeviceMode(mode)}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div className="flex-1 flex justify-end">
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save size={14} /> Salvar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/30 flex justify-center">
          <div
            className="space-y-4 transition-all duration-300"
            style={{ width: deviceWidths[deviceMode], maxWidth: "100%" }}
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
                  className={`rounded-2xl transition-all cursor-pointer overflow-hidden ${
                    section.showBorder
                      ? `border-2 border-dashed ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`
                      : isSelected ? "ring-2 ring-primary/30 bg-primary/5" : "hover:bg-muted/20"
                  }`}
                >
                  {(section.title || section.subtitle) && (
                    <div className="px-6 pt-4 pb-0 md:px-8 md:pt-5">
                      {section.title && (
                        <h3 className="font-bold text-lg leading-tight" style={{ color: theme.titleColor, fontFamily: `'${theme.titleFont}', sans-serif` }}>
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm mt-0.5" style={{ color: theme.subtitleColor, fontFamily: `'${theme.subtitleFont}', sans-serif` }}>
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4">
                    {section.type === "banner" && (
                      section.banners && section.banners.length > 0 ? (
                        <BannerPreview banners={section.banners} deviceMode={deviceMode} />
                      ) : (
                        <div className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center">
                          <div className="text-center">
                            <Image size={32} className="text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Clique para configurar banners</p>
                          </div>
                        </div>
                      )
                    )}

                    {section.type === "destaque" && (
                      <div className={`grid gap-3 ${deviceMode === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
                        {(catalogProducts.length > 0 ? catalogProducts.slice(0, 3) : [null, null, null]).map((product, i) => (
                          <div key={product?.id || i} className="aspect-[3/4] rounded-xl bg-muted/50 border border-border flex flex-col items-center justify-center overflow-hidden">
                            {product?.image_url ? (
                              <>
                          <div className="flex-1 w-full overflow-hidden">
                                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-2 w-full">
                                  <p className="text-xs text-foreground font-medium text-center truncate">{product.product_name}</p>
                                  {getProductPrice(product) && (
                                    <p className="text-xs font-bold text-center mt-0.5" style={{ color: theme.titleColor }}>{getProductPrice(product)}</p>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    className="mt-1.5 w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
                                    style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}
                                  >
                                    Comprar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">Produto {i + 1}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === "produtos" && (
                      <div className={`grid gap-3 ${deviceMode === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                        {(catalogProducts.length > 0 ? catalogProducts : [null, null, null, null]).map((product, i) => (
                          <div key={product?.id || i} className="rounded-xl bg-muted/50 border border-border flex flex-col overflow-hidden">
                            {product?.image_url ? (
                              <>
                                <div className="aspect-square w-full overflow-hidden">
                                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-2">
                                  <p className="text-xs text-foreground font-medium text-center truncate">{product.product_name}</p>
                                  {getProductPrice(product) && (
                                    <p className="text-xs font-bold text-center mt-0.5" style={{ color: theme.titleColor }}>{getProductPrice(product)}</p>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    className="mt-1.5 w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
                                    style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}
                                  >
                                    Comprar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="aspect-square flex items-center justify-center">
                                <p className="text-[10px] text-muted-foreground">Produto</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs text-muted-foreground">Bordas da Seção</Label>
                <Switch
                  checked={!!selectedSection.showBorder}
                  onCheckedChange={(v) => updateSectionBorder(selectedSection.id, v)}
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

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}
      />
    </div>
  );
};

export default Builder;
