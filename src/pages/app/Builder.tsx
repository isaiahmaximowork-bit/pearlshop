import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { FooterConfig } from "@/components/StoreFooter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Trash2, GripVertical, Image, Star, ShoppingBag,
  X, ArrowLeft, Save, Settings2, Monitor, Tablet, Smartphone,
  Layers, Settings, ChevronLeft, ChevronRight, Bold, Italic,
  Search, Upload, Type, PanelTop, Eye, ExternalLink, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
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

// ─── Header Config Types ───
type LogoMode = "text" | "image";
type LogoPosition = "center" | "left";

interface AnnouncementMessage {
  id: string;
  text: string;
}

interface HeaderConfig {
  logoMode: LogoMode;
  logoText: string;
  logoTextColor: string;
  logoImageUrl: string;
  logoPosition: LogoPosition;
  announcementEnabled: boolean;
  announcementMessages: AnnouncementMessage[];
  announcementBgColor: string;
  announcementTextColor: string;
  headerBgColor: string;
  logoColor: string;
}

const defaultHeaderConfig: HeaderConfig = {
  logoMode: "text",
  logoText: "",
  logoTextColor: "#ffffff",
  logoImageUrl: "",
  logoPosition: "center",
  announcementEnabled: false,
  announcementMessages: [{ id: "1", text: "" }],
  announcementBgColor: "#7c3aed",
  announcementTextColor: "#ffffff",
  headerBgColor: "",
  logoColor: "",
};

interface StoreTheme {
  titleFont: FontFamily;
  subtitleFont: FontFamily;
  titleColor: string;
  subtitleColor: string;
  titleBold: boolean;
  titleItalic: boolean;
  subtitleBold: boolean;
  subtitleItalic: boolean;
  buttonBgColor: string;
  buttonTextColor: string;
  iconColor: string;
  priceColor: string;
}

const defaultTheme: StoreTheme = {
  titleFont: "Arial",
  subtitleFont: "Arial",
  titleColor: "#ffffff",
  subtitleColor: "#a1a1aa",
  titleBold: true,
  titleItalic: false,
  subtitleBold: false,
  subtitleItalic: false,
  buttonBgColor: "#7c3aed",
  buttonTextColor: "#ffffff",
  iconColor: "#a1a1aa",
  priceColor: "#ffffff",
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
  price: number | null;
  original_price: number | null;
  currency: string | null;
  is_on_sale: boolean | null;
  is_verified: boolean;
  description?: string | null;
  images?: string[] | null;
  size_chart_url?: string | null;
  variants?: string | null;
  affiliate_link?: string | null;
  promo_info?: string | null;
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
  // flex-col: justify = vertical (main axis), items = horizontal (cross axis)
  switch (position) {
    case "center": return "items-center justify-center text-center";
    case "center-left": return "items-start justify-center text-left pl-8";
    case "center-right": return "items-end justify-center text-right pr-8";
    case "top-left": return "items-start justify-start text-left pt-6 pl-8";
    case "top-right": return "items-end justify-start text-right pt-6 pr-8";
    case "bottom-left": return "items-start justify-end text-left pb-6 pl-8";
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

const getProductPriceInfo = (product: CatalogProduct) => {
  if (product.price != null) {
    return {
      salePrice: product.price,
      originalPrice: product.is_on_sale ? product.original_price : null,
      hasDiscount: !!product.is_on_sale,
    };
  }
  const payload = product.raw_payload as Record<string, unknown> | null;
  if (!payload) return null;
  const skuList = Array.isArray(payload.skus) ? (payload.skus as Array<Record<string, unknown>>) : [];
  const firstSku = skuList[0];
  const skuPrice = (firstSku?.price as Record<string, unknown> | undefined) ?? firstSku;
  if (!skuPrice) return null;
  const sale = Number(skuPrice.sale_price ?? skuPrice.tax_exclusive_price) || null;
  if (!sale) return null;
  return { salePrice: sale, originalPrice: null, hasDiscount: false };
};

// ─── Banner Preview with SLIDE transition ───
const BannerPreview = ({ banners, deviceMode, iconColor }: { banners: BannerItem[]; deviceMode: DeviceMode; iconColor: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

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
      if (diff > 0 && activeIndex < banners.length - 1) setActiveIndex(activeIndex + 1);
      else if (diff < 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
    }
    touchStartX.current = null;
  };

  const activeBanner = banners[activeIndex];
  if (!activeBanner) return null;

  return (
    <div
      ref={containerRef}
      className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding container */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${banners.length * 100}%`, transform: `translateX(-${activeIndex * (100 / banners.length)}%)` }}
      >
        {banners.map((banner) => {
          const tc = banner.textConfig;
          return (
            <div key={banner.id} className="relative h-full flex-shrink-0" style={{ width: `${100 / banners.length}%` }}>
              {banner.imageUrl ? (
                <>
                  <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  {tc?.mask?.enabled && (
                    <div className="absolute inset-0 z-10" style={getMaskStyle(tc.mask)} />
                  )}
                  {(tc?.title || tc?.subtitle) && (
                    <div className={`absolute inset-0 flex flex-col z-20 ${getPositionClasses(tc?.position)}`}>
                      {tc?.title && (
                        <p className="text-lg md:text-2xl drop-shadow-lg" style={{ color: tc.titleColor, fontFamily: `'${tc.fontFamily}', sans-serif`, fontWeight: tc.fontBold ? 700 : 400, fontStyle: tc.fontItalic ? "italic" : "normal" }}>
                          {tc.title}
                        </p>
                      )}
                      {tc?.subtitle && (
                        <p className="text-sm md:text-base drop-shadow-lg mt-1" style={{ color: tc.subtitleColor, fontFamily: `'${tc.fontFamily}', sans-serif`, fontWeight: tc.fontBold ? 600 : 400, fontStyle: tc.fontItalic ? "italic" : "normal" }}>
                          {tc.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Image size={32} className="text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Banner vazio</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots with iconColor */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === activeIndex ? iconColor : `${iconColor}66`,
                transform: i === activeIndex ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}

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

// ─── Destaque Preview (extracted as proper component to avoid hooks-in-callback) ───
const DestaquePreview = ({
  products, deviceMode, theme, onSelectProduct,
}: {
  products: CatalogProduct[];
  deviceMode: DeviceMode;
  theme: StoreTheme;
  onSelectProduct: (p: CatalogProduct) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [products.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < products.length - 1) setActiveIndex(activeIndex + 1);
      else if (diff < 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
    }
    touchStartX.current = null;
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/50 border border-border min-h-[300px]">
        <p className="text-sm text-muted-foreground">Nenhum produto em destaque</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl bg-muted/50 border border-border overflow-hidden"
      style={{ minHeight: deviceMode === "mobile" ? 360 : 280, maxHeight: deviceMode === "mobile" ? undefined : 340 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding container */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{
          width: `${products.length * 100}%`,
          transform: `translateX(-${activeIndex * (100 / products.length)}%)`,
          minHeight: deviceMode === "mobile" ? 360 : 280,
        }}
      >
        {products.map((product) => {
          const info = getProductPriceInfo(product);
          return (
            <div key={product.id} className="flex flex-col flex-shrink-0" style={{ width: `${100 / products.length}%` }}>
              <div className="flex-1 w-full overflow-hidden" style={{ minHeight: deviceMode === "mobile" ? 240 : 180, maxHeight: deviceMode === "mobile" ? undefined : 220 }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ShoppingBag size={32} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p
                  className="text-sm truncate"
                  style={{
                    color: theme.titleColor,
                    fontFamily: `'${theme.titleFont}', sans-serif`,
                    fontWeight: theme.titleBold ? 700 : 400,
                    fontStyle: theme.titleItalic ? "italic" : "normal",
                  }}
                >
                  {product.product_name}
                </p>
                {info && (
                  <div className="flex items-center gap-2">
                    {info.hasDiscount && (
                      <span className="text-xs line-through text-muted-foreground">R${info.originalPrice!.toFixed(2)}</span>
                    )}
                    <span
                      className="text-lg"
                      style={{
                        color: info.hasDiscount ? 'hsl(var(--destructive))' : theme.priceColor,
                        fontFamily: `'${theme.subtitleFont}', sans-serif`,
                        fontWeight: theme.subtitleBold ? 900 : 700,
                        fontStyle: theme.subtitleItalic ? "italic" : "normal",
                      }}
                    >
                      R${(info.salePrice || info.originalPrice)!.toFixed(2)}
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
                  style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}
                >
                  Comprar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots — moved further from button with bottom-6 */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === activeIndex ? theme.iconColor : `${theme.iconColor}66`,
                transform: i === activeIndex ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
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
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState(false);
  const [theme, setTheme] = useState<StoreTheme>({ ...defaultTheme });
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({ ...defaultHeaderConfig });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPassword, setPreviewPassword] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [store, setStore] = useState<{ id: string; slug: string; is_public: boolean; access_code: string; store_name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    bgColor: '#1a1a1a', textColor: '#ffffff', logoColor: '#ffffff',
    instagramUrl: '', tiktokUrl: '', youtubeUrl: '', supportEmail: '',
  });
  const { user } = useAuth();

  // Fetch user's store + load saved builder config
  useEffect(() => {
    if (!user) return;
    const fetchStore = async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, slug, is_public, access_code, store_name, preview_cache")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (data) {
        setStore({ id: data.id, slug: data.slug, is_public: data.is_public, access_code: data.access_code, store_name: data.store_name });

        // Load saved config from preview_cache
        if (data.preview_cache) {
          try {
            const saved = JSON.parse(data.preview_cache);
            if (saved.sections) setSections(saved.sections);
            if (saved.theme) setTheme(saved.theme);
            if (saved.headerConfig) setHeaderConfig(saved.headerConfig);
          } catch {
            // ignore invalid JSON
          }
        }

        // Fallback: set logo text from store name if not saved
        setHeaderConfig((h) => {
          if (!h.logoText) return { ...h, logoText: data.store_name || "" };
          return h;
        });
      }
    };
    fetchStore();
  }, [user]);

  // Rotate announcement messages
  useEffect(() => {
    const msgs = headerConfig.announcementMessages.filter((m) => m.text.trim());
    if (!headerConfig.announcementEnabled || msgs.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % msgs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [headerConfig.announcementEnabled, headerConfig.announcementMessages]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return catalogProducts
      .filter((p) => p.product_name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, catalogProducts]);

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

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;
  const hasRightPanel = !!selectedSection;

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "0.4";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "1";
    setDragIndex(null);
    setDropIndicator(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null) { setDropIndicator(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropIndicator(e.clientY < midY ? index : index + 1);
  }, [dragIndex]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dropIndicator === null) return;
    if (dropIndicator === dragIndex || dropIndicator === dragIndex + 1) {
      setDragIndex(null); setDropIndicator(null); return;
    }
    setSections((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      const insertAt = dropIndicator > dragIndex ? dropIndicator - 1 : dropIndicator;
      arr.splice(insertAt, 0, moved);
      return arr;
    });
    setDragIndex(null); setDropIndicator(null);
  }, [dragIndex, dropIndicator]);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
    toast.success("Seção removida");
  }, [selectedSectionId]);

  const addSection = useCallback((type: SectionType) => {
    const defaultTitles: Record<SectionType, string> = { banner: "", destaque: "Destaques", produtos: "Produtos" };
    const newSection: BuilderSection = {
      id: Date.now().toString(), type, title: defaultTitles[type], subtitle: "",
      ...(type === "banner" ? { banners: [] } : {}),
    };
    setSections((prev) => [...prev, newSection]);
    setAddingSection(false);
    toast.success(`"${sectionLabels[type]}" adicionada`);
  }, []);

  const updateSectionField = useCallback((sectionId: string, field: "title" | "subtitle", value: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)));
  }, []);

  const updateSectionBorder = useCallback((sectionId: string, showBorder: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, showBorder } : s)));
  }, []);

  const addBannerToSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || s.type !== "banner") return s;
        if ((s.banners?.length || 0) >= 3) { toast.error("Máximo de 3 banners por seção"); return s; }
        return { ...s, banners: [...(s.banners || []), { id: Date.now().toString(), textConfig: { ...defaultTextConfig } }] };
      })
    );
  }, []);

  const removeBannerFromSection = useCallback((sectionId: string, bannerId: string) => {
    setSections((prev) => prev.map((s) => s.id !== sectionId ? s : { ...s, banners: s.banners?.filter((b) => b.id !== bannerId) }));
  }, []);

  const updateBanner = useCallback((sectionId: string, bannerId: string, updates: Partial<BannerItem>) => {
    setSections((prev) => prev.map((s) => s.id !== sectionId ? s : { ...s, banners: s.banners?.map((b) => (b.id === bannerId ? { ...b, ...updates } : b)) }));
  }, []);

  const updateBannerText = useCallback((sectionId: string, bannerId: string, updates: Partial<BannerTextConfig>) => {
    setSections((prev) => prev.map((s) => s.id !== sectionId ? s : { ...s, banners: s.banners?.map((b) => b.id === bannerId ? { ...b, textConfig: { ...b.textConfig, ...updates } } : b) }));
  }, []);

  const handleSave = async () => {
    if (!store || !user) {
      toast.error("Nenhuma loja encontrada.");
      return;
    }
    setSaving(true);
    try {
      const builderData = JSON.stringify({ sections, theme, headerConfig });
      const { error } = await supabase
        .from("stores")
        .update({ preview_cache: builderData })
        .eq("id", store.id)
        .eq("user_id", user.id); // multi-tenant: only update own store
      if (error) throw error;
      toast.success("Loja salva com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err.message || "tente novamente"));
    } finally {
      setSaving(false);
    }
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

        {/* Tab switcher — Seções and Config */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setLeftTab("sections")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${leftTab === "sections" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Layers size={14} /> Seções
          </button>
          <button
            onClick={() => setLeftTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${leftTab === "settings" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Settings size={14} /> Configurações
          </button>
        </div>

        {leftTab === "sections" ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* ─── HEADER (collapsible) ─── */}
            <div className="border-b border-border">
              <button
                onClick={() => setHeaderExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PanelTop size={14} className="text-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Header</p>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${headerExpanded ? "rotate-180" : ""}`} />
              </button>

              {headerExpanded && (
                <div className="px-4 pb-4 space-y-5">
                  {/* LOGO */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Logo</p>
                    <div className="space-y-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setHeaderConfig((h) => ({ ...h, logoMode: "text" }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${headerConfig.logoMode === "text" ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                        >
                          <Type size={12} /> Texto
                        </button>
                        <button
                          onClick={() => setHeaderConfig((h) => ({ ...h, logoMode: "image" }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${headerConfig.logoMode === "image" ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                        >
                          <Upload size={12} /> Imagem
                        </button>
                      </div>

                      {headerConfig.logoMode === "text" ? (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome da Loja</Label>
                            <Input
                              value={headerConfig.logoText}
                              onChange={(e) => setHeaderConfig((h) => ({ ...h, logoText: e.target.value }))}
                              placeholder={store?.store_name || "Minha Loja"}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Cor do Texto</Label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={headerConfig.logoTextColor} onChange={(e) => setHeaderConfig((h) => ({ ...h, logoTextColor: e.target.value }))} className="w-7 h-7 rounded border border-border cursor-pointer p-0.5" />
                              <span className="text-[10px] font-mono text-muted-foreground">{headerConfig.logoTextColor}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">URL da Imagem (PNG, até 5MB)</Label>
                          <Input value={headerConfig.logoImageUrl} onChange={(e) => setHeaderConfig((h) => ({ ...h, logoImageUrl: e.target.value }))} placeholder="https://exemplo.com/logo.png" className="h-8 text-xs" />
                          {headerConfig.logoImageUrl && (
                            <div className="mt-1.5 p-1.5 border border-border rounded-lg flex items-center justify-center bg-muted/30">
                              <img src={headerConfig.logoImageUrl} alt="Logo" className="max-h-8 max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Posição</Label>
                        <div className="flex gap-1">
                          {(["left", "center"] as LogoPosition[]).map((pos) => (
                            <button key={pos} onClick={() => setHeaderConfig((h) => ({ ...h, logoPosition: pos }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${headerConfig.logoPosition === pos ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}>
                              {pos === "left" ? "Esquerda" : "Centro"}
                            </button>
                          ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Cor de Fundo da Header</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={headerConfig.headerBgColor || "#1c1c1e"} onChange={(e) => setHeaderConfig((h) => ({ ...h, headerBgColor: e.target.value }))} className="w-7 h-7 rounded border border-border cursor-pointer p-0.5" />
                          <span className="text-[10px] font-mono text-muted-foreground">{headerConfig.headerBgColor || "padrão"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Cor da Logo</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={headerConfig.logoColor || headerConfig.logoTextColor} onChange={(e) => setHeaderConfig((h) => ({ ...h, logoColor: e.target.value }))} className="w-7 h-7 rounded border border-border cursor-pointer p-0.5" />
                          <span className="text-[10px] font-mono text-muted-foreground">{headerConfig.logoColor || "padrão"}</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* FAIXA DE ANÚNCIO */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Faixa de Anúncio</p>
                      <Switch checked={headerConfig.announcementEnabled} onCheckedChange={(v) => setHeaderConfig((h) => ({ ...h, announcementEnabled: v }))} />
                    </div>
                    {headerConfig.announcementEnabled && (
                      <div className="space-y-2.5">
                        <div className="space-y-1.5">
                          {headerConfig.announcementMessages.map((msg, i) => (
                            <div key={msg.id} className="flex gap-1">
                              <Input value={msg.text} onChange={(e) => setHeaderConfig((h) => ({ ...h, announcementMessages: h.announcementMessages.map((m) => m.id === msg.id ? { ...m, text: e.target.value } : m) }))} placeholder={`Mensagem ${i + 1}`} className="h-8 text-xs flex-1" />
                              {headerConfig.announcementMessages.length > 1 && (
                                <button onClick={() => setHeaderConfig((h) => ({ ...h, announcementMessages: h.announcementMessages.filter((m) => m.id !== msg.id) }))} className="p-1.5 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                              )}
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full gap-1 text-[10px] h-7" onClick={() => setHeaderConfig((h) => ({ ...h, announcementMessages: [...h.announcementMessages, { id: Date.now().toString(), text: "" }] }))}>
                            <Plus size={10} /> Mensagem
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Cor da Faixa</Label>
                          <input type="color" value={headerConfig.announcementBgColor} onChange={(e) => setHeaderConfig((h) => ({ ...h, announcementBgColor: e.target.value }))} className="w-7 h-7 rounded border border-border cursor-pointer p-0.5" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Cor do Texto</Label>
                          <input type="color" value={headerConfig.announcementTextColor} onChange={(e) => setHeaderConfig((h) => ({ ...h, announcementTextColor: e.target.value }))} className="w-7 h-7 rounded border border-border cursor-pointer p-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground">🔍 A lupa de pesquisa aparece automaticamente no header.</p>
                </div>
              )}
            </div>

            {/* ─── SEÇÕES (collapsible) ─── */}
            <div className="flex-1 flex flex-col">
              <button
                onClick={() => setSectionsExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seções</p>
                  <span className="text-[10px] text-muted-foreground">({sections.length})</span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${sectionsExpanded ? "rotate-180" : ""}`} />
              </button>

              {sectionsExpanded && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-0">
                    {sections.map((section, index) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <div key={section.id}>
                          {index === 0 && dropIndicator === 0 && dragIndex !== null && (
                            <div className="h-0.5 bg-primary rounded-full mx-2 my-1 transition-all" />
                          )}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={handleDrop}
                            onClick={() => setSelectedSectionId(section.id)}
                            className={`group flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:bg-muted/50"}`}
                          >
                            <div className="cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                              <GripVertical size={14} />
                            </div>
                            <span className="text-foreground">{sectionIcons[section.type]}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{section.title || sectionLabels[section.type]}</p>
                              <p className="text-[10px] text-muted-foreground">{sectionDescriptions[section.type]}</p>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remover">
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
                          <button onClick={() => setAddingSection(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
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
              )}
            </div>
          </div>
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
                {/* Title font (product names) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fonte do Título (nome dos produtos)</Label>
                  <select
                    value={theme.titleFont}
                    onChange={(e) => setTheme((t) => ({ ...t, titleFont: e.target.value as FontFamily }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => setTheme((t) => ({ ...t, titleBold: !t.titleBold }))}
                      className={`p-1.5 rounded border transition-colors ${theme.titleBold ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                      title="Negrito"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => setTheme((t) => ({ ...t, titleItalic: !t.titleItalic }))}
                      className={`p-1.5 rounded border transition-colors ${theme.titleItalic ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                      title="Itálico"
                    >
                      <Italic size={14} />
                    </button>
                  </div>
                </div>
                {/* Subtitle font (prices) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fonte do Subtítulo (preços)</Label>
                  <select
                    value={theme.subtitleFont}
                    onChange={(e) => setTheme((t) => ({ ...t, subtitleFont: e.target.value as FontFamily }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => setTheme((t) => ({ ...t, subtitleBold: !t.subtitleBold }))}
                      className={`p-1.5 rounded border transition-colors ${theme.subtitleBold ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                      title="Negrito"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => setTheme((t) => ({ ...t, subtitleItalic: !t.subtitleItalic }))}
                      className={`p-1.5 rounded border transition-colors ${theme.subtitleItalic ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-foreground"}`}
                      title="Itálico"
                    >
                      <Italic size={14} />
                    </button>
                  </div>
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
                  { key: "priceColor" as const, label: "Cor do Preço" },
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
                className={`p-1.5 rounded-md transition-colors ${deviceMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div className="flex-1 flex justify-end gap-2">
            <Button onClick={handleSave} size="sm" className="gap-2" disabled={saving}>
              <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              onClick={() => {
                if (!store) {
                  toast.error("Nenhuma loja encontrada. Crie uma loja primeiro.");
                  return;
                }
                // User is logged in (builder is protected route), go directly
                window.open(`/loja/${store.slug}`, "_blank");
              }}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Eye size={14} /> Pré-visualizar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/30 flex justify-center">
          <div className="space-y-4 transition-all duration-300" style={{ width: deviceWidths[deviceMode], maxWidth: "100%" }}>
            {/* ─── Header Preview ─── */}
            {/* Announcement Bar */}
            {(() => {
              const msgs = headerConfig.announcementMessages.filter((m) => m.text.trim());
              if (!headerConfig.announcementEnabled || msgs.length === 0) return null;
              // Duplicate messages for seamless loop
              const loopMsgs = [...msgs, ...msgs];
              return (
                <div
                  className="w-full py-2 overflow-hidden"
                  style={{ backgroundColor: headerConfig.announcementBgColor }}
                >
                  <div
                    className="flex whitespace-nowrap"
                    style={{
                      animation: `marquee ${msgs.length * 6}s linear infinite`,
                    }}
                  >
                    {loopMsgs.map((msg, i) => (
                      <span
                        key={i}
                        className="inline-block px-8 text-xs font-medium"
                        style={{ color: headerConfig.announcementTextColor }}
                      >
                        {msg.text}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Header Bar */}
            <div className="w-full rounded-xl border border-border px-4 py-3 flex items-center gap-3 relative" style={{ backgroundColor: headerConfig.headerBgColor || undefined }}>
              {headerConfig.logoPosition === "left" ? (
                <>
                  <div className="flex-shrink-0">
                    {headerConfig.logoMode === "image" && headerConfig.logoImageUrl ? (
                      <img src={headerConfig.logoImageUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <span className="text-base font-bold" style={{ color: headerConfig.logoColor || headerConfig.logoTextColor }}>
                        {headerConfig.logoText || "Minha Loja"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1" />
                  <div className="relative">
                    <button
                      onClick={() => setSearchOpen(!searchOpen)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground transition-colors"
                      style={{ color: theme.iconColor }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setSearchOpen(!searchOpen)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground transition-colors"
                      style={{ color: theme.iconColor }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  <div className="flex-1 flex justify-center">
                    {headerConfig.logoMode === "image" && headerConfig.logoImageUrl ? (
                      <img src={headerConfig.logoImageUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <span className="text-base font-bold" style={{ color: headerConfig.logoColor || headerConfig.logoTextColor }}>
                        {headerConfig.logoText || "Minha Loja"}
                      </span>
                    )}
                  </div>
                  <div className="w-8" />
                </>
              )}

              {/* Search dropdown */}
              {searchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-3 space-y-2">
                  <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar produtos..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {searchQuery.trim() && (
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map((product) => {
                          const info = getProductPriceInfo(product);
                          const q = searchQuery.toLowerCase();
                          const name = product.product_name;
                          const matchIdx = name.toLowerCase().indexOf(q);
                          return (
                            <button
                              key={product.id}
                              onClick={() => { setSelectedProduct(product); setSearchOpen(false); setSearchQuery(""); }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {product.image_url ? (
                                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag size={14} className="text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {matchIdx >= 0 ? (
                                    <>
                                      {name.slice(0, matchIdx)}
                                      <span className="bg-primary/20 text-primary font-bold">{name.slice(matchIdx, matchIdx + q.length)}</span>
                                      {name.slice(matchIdx + q.length)}
                                    </>
                                  ) : name}
                                </p>
                                {info && (
                                  <p className="text-[10px] text-muted-foreground">R${(info.salePrice || info.originalPrice)!.toFixed(2)}</p>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhum produto encontrado</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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
                        <h3
                          className="text-lg leading-tight"
                          style={{
                            color: theme.titleColor,
                            fontFamily: `'${theme.titleFont}', sans-serif`,
                            fontWeight: theme.titleBold ? 700 : 400,
                            fontStyle: theme.titleItalic ? "italic" : "normal",
                          }}
                        >
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p
                          className="text-sm mt-0.5"
                          style={{
                            color: theme.subtitleColor,
                            fontFamily: `'${theme.subtitleFont}', sans-serif`,
                            fontWeight: theme.subtitleBold ? 600 : 400,
                            fontStyle: theme.subtitleItalic ? "italic" : "normal",
                          }}
                        >
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4">
                    {section.type === "banner" && (
                      section.banners && section.banners.length > 0 ? (
                        <BannerPreview banners={section.banners} deviceMode={deviceMode} iconColor={theme.iconColor} />
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
                      <DestaquePreview
                        products={catalogProducts.slice(0, 5)}
                        deviceMode={deviceMode}
                        theme={theme}
                        onSelectProduct={setSelectedProduct}
                      />
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
                                  <p
                                    className="text-xs text-center truncate"
                                    style={{
                                      color: theme.titleColor,
                                      fontFamily: `'${theme.titleFont}', sans-serif`,
                                      fontWeight: theme.titleBold ? 700 : 500,
                                      fontStyle: theme.titleItalic ? "italic" : "normal",
                                    }}
                                  >
                                    {product.product_name}
                                  </p>
                                  {(() => {
                                    const info = getProductPriceInfo(product);
                                    if (!info) return null;
                                    return (
                                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                        {info.hasDiscount && (
                                          <span className="text-[10px] line-through text-muted-foreground">R${info.originalPrice!.toFixed(2)}</span>
                                        )}
                                        <span
                                          className="text-xs"
                                          style={{
                                            color: info.hasDiscount ? 'hsl(var(--destructive))' : theme.priceColor,
                                            fontFamily: `'${theme.subtitleFont}', sans-serif`,
                                            fontWeight: theme.subtitleBold ? 800 : 700,
                                            fontStyle: theme.subtitleItalic ? "italic" : "normal",
                                          }}
                                        >
                                          R${(info.salePrice || info.originalPrice)!.toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  })()}
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{sectionLabels[selectedSection.type]}</p>
              </div>
              <button onClick={() => setSelectedSectionId(null)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Título da Seção</Label>
                <Input value={selectedSection.title} onChange={(e) => updateSectionField(selectedSection.id, "title", e.target.value)} placeholder="Ex: Novidades da Semana" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subtítulo da Seção</Label>
                <Input value={selectedSection.subtitle} onChange={(e) => updateSectionField(selectedSection.id, "subtitle", e.target.value)} placeholder="Ex: Confira os lançamentos" className="h-9" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs text-muted-foreground">Bordas da Seção</Label>
                <Switch checked={!!selectedSection.showBorder} onCheckedChange={(v) => updateSectionBorder(selectedSection.id, v)} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedSection.type === "banner" && (
              <BannerConfig section={selectedSection} onAddBanner={addBannerToSection} onRemoveBanner={removeBannerFromSection} onUpdateBanner={updateBanner} onUpdateBannerText={updateBannerText} />
            )}
            {selectedSection.type === "destaque" && (
              <DestaqueConfig section={selectedSection} />
            )}
          </div>

          <div className="p-4 border-t border-border">
            <Button variant="outline" size="sm" className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => removeSection(selectedSection.id)}>
              <Trash2 size={14} /> Remover Seção
            </Button>
          </div>
        </div>
      )}

      <ProductDetailModal product={selectedProduct} open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }} />

      {/* Preview Password Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Pré-visualizar Loja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua loja é privada. Insira o código de acesso para pré-visualizar.
            </p>
            <Input
              type="text"
              value={previewPassword}
              onChange={(e) => { setPreviewPassword(e.target.value); setPreviewError(""); }}
              placeholder="Código de acesso"
              className="h-10"
            />
            {previewError && <p className="text-xs text-destructive">{previewError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>Cancelar</Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (store && previewPassword === store.access_code) {
                    window.open(`/loja/${store.slug}?code=${previewPassword}`, "_blank");
                    setPreviewOpen(false);
                  } else {
                    setPreviewError("Código de acesso incorreto.");
                  }
                }}
              >
                <ExternalLink size={14} /> Abrir Loja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Builder;
