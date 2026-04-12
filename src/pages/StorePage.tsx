import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, X, ShoppingBag, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import type { TextPosition, FontFamily, BannerTextConfig, BannerItem, BuilderSection } from "@/components/builder/types";

// ─── Types (mirror Builder) ───
type LogoMode = "text" | "image";
type LogoPosition = "center" | "left";

interface AnnouncementMessage { id: string; text: string; }

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

interface CatalogProduct {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  source_platform: string;
  status: string;
  created_at: string;
  currency: string | null;
  raw_payload: Record<string, unknown> | null;
  price: number | null;
  original_price: number | null;
  is_on_sale: boolean | null;
}

const defaultTheme: StoreTheme = {
  titleFont: "Arial", subtitleFont: "Arial", titleColor: "#ffffff", subtitleColor: "#a1a1aa",
  titleBold: true, titleItalic: false, subtitleBold: false, subtitleItalic: false,
  buttonBgColor: "#7c3aed", buttonTextColor: "#ffffff", iconColor: "#a1a1aa", priceColor: "#ffffff",
};

const defaultHeaderConfig: HeaderConfig = {
  logoMode: "text", logoText: "", logoTextColor: "#ffffff", logoImageUrl: "",
  logoPosition: "center", announcementEnabled: false,
  announcementMessages: [{ id: "1", text: "" }],
  announcementBgColor: "#7c3aed", announcementTextColor: "#ffffff",
  headerBgColor: "", logoColor: "",
};

// ─── Helpers ───
const getPositionClasses = (position?: TextPosition) => {
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
    default: return undefined;
  }
};

const getProductPriceInfo = (product: CatalogProduct) => {
  if (product.price != null) {
    return { salePrice: product.price, originalPrice: product.is_on_sale ? product.original_price : null, hasDiscount: !!product.is_on_sale };
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

// ─── Banner Component ───
const StoreBannerPreview = ({ banners, iconColor }: { banners: BannerItem[]; iconColor: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setActiveIndex((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[activeIndex];
  if (!activeBanner) return null;

  return (
    <div className="w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden relative"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0 && activeIndex < banners.length - 1) setActiveIndex(activeIndex + 1);
          else if (diff < 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
        }
        touchStartX.current = null;
      }}
    >
      <div className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${banners.length * 100}%`, transform: `translateX(-${activeIndex * (100 / banners.length)}%)` }}
      >
        {banners.map((banner) => {
          const tc = banner.textConfig;
          return (
            <div key={banner.id} className="relative h-full flex-shrink-0" style={{ width: `${100 / banners.length}%` }}>
              {banner.imageUrl ? (
                <>
                  <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  {tc?.mask?.enabled && <div className="absolute inset-0 z-10" style={getMaskStyle(tc.mask)} />}
                  {(tc?.title || tc?.subtitle) && (
                    <div className={`absolute inset-0 flex flex-col z-20 ${getPositionClasses(tc?.position)}`}>
                      {tc?.title && (
                        <p className="text-xl md:text-3xl drop-shadow-lg" style={{ color: tc.titleColor, fontFamily: `'${tc.fontFamily}', sans-serif`, fontWeight: tc.fontBold ? 700 : 400, fontStyle: tc.fontItalic ? "italic" : "normal" }}>
                          {tc.title}
                        </p>
                      )}
                      {tc?.subtitle && (
                        <p className="text-sm md:text-lg drop-shadow-lg mt-1" style={{ color: tc.subtitleColor, fontFamily: `'${tc.fontFamily}', sans-serif`, fontWeight: tc.fontBold ? 600 : 400, fontStyle: tc.fontItalic ? "italic" : "normal" }}>
                          {tc.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Image size={48} className="text-muted-foreground/20" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)} className="w-2.5 h-2.5 rounded-full transition-all"
                style={{ backgroundColor: i === activeIndex ? iconColor : `${iconColor}66`, transform: i === activeIndex ? "scale(1.25)" : "scale(1)" }}
              />
            ))}
          </div>
          <button onClick={() => setActiveIndex((activeIndex - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 hidden md:flex">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setActiveIndex((activeIndex + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 hidden md:flex">
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
};

// ─── Destaque Component ───
const StoreDestaquePreview = ({ products, theme, onSelect }: { products: CatalogProduct[]; theme: StoreTheme; onSelect: (p: CatalogProduct) => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => setActiveIndex((p) => (p + 1) % products.length), 7000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex transition-transform duration-500 ease-in-out"
        style={{ width: `${products.length * 100}%`, transform: `translateX(-${activeIndex * (100 / products.length)}%)` }}>
        {products.map((product) => {
          const info = getProductPriceInfo(product);
          return (
            <div key={product.id} className="flex flex-col flex-shrink-0" style={{ width: `${100 / products.length}%` }}>
              <div className="w-full aspect-square overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted"><ShoppingBag size={32} className="text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm truncate" style={{ color: theme.titleColor, fontFamily: `'${theme.titleFont}', sans-serif`, fontWeight: theme.titleBold ? 700 : 400 }}>{product.product_name}</p>
                {info && (
                  <div className="flex items-center gap-2">
                    {info.hasDiscount && <span className="text-xs line-through text-muted-foreground">R${info.originalPrice!.toFixed(2)}</span>}
                    <span className="text-lg" style={{ color: info.hasDiscount ? '#ef4444' : theme.priceColor, fontWeight: 700 }}>R${(info.salePrice || info.originalPrice)!.toFixed(2)}</span>
                  </div>
                )}
                <button onClick={() => onSelect(product)} className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
                  style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}>Comprar</button>
              </div>
            </div>
          );
        })}
      </div>
      {products.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {products.map((_, i) => (
            <button key={i} onClick={() => setActiveIndex(i)} className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === activeIndex ? theme.iconColor : `${theme.iconColor}66`, transform: i === activeIndex ? "scale(1.25)" : "scale(1)" }} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Store Page ───
const StorePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [theme, setTheme] = useState<StoreTheme>({ ...defaultTheme });
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({ ...defaultHeaderConfig });
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [storeData, setStoreData] = useState<{ id: string; user_id: string; is_public: boolean; access_code: string; store_name: string; preview_cache: string | null } | null>(null);

  // Fetch store
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("id, user_id, is_public, access_code, store_name, preview_cache")
        .eq("slug", slug)
        .limit(1)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStoreData(data);
      setStoreName(data.store_name);

      // Check access: public, or logged-in owner, or code in URL
      const codeFromUrl = searchParams.get("code");
      const isOwner = user?.id === data.user_id;

      if (!data.is_public && !isOwner && codeFromUrl !== data.access_code) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Parse builder config
      if (data.preview_cache) {
        try {
          const saved = JSON.parse(data.preview_cache);
          if (saved.sections) setSections(saved.sections);
          if (saved.theme) setTheme(saved.theme);
          if (saved.headerConfig) {
            const hc = { ...defaultHeaderConfig, ...saved.headerConfig };
            if (!hc.logoText) hc.logoText = data.store_name || "";
            setHeaderConfig(hc);
          }
        } catch { /* ignore */ }
      }

      if (!headerConfig.logoText) {
        setHeaderConfig((h) => ({ ...h, logoText: data.store_name || "" }));
      }

      // Fetch products
      const { data: products } = await supabase
        .from("catalog_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (products) setCatalogProducts(products as unknown as CatalogProduct[]);

      setLoading(false);
    };
    load();
  }, [slug, user]);

  const handleCodeSubmit = () => {
    if (storeData && codeInput === storeData.access_code) {
      setAccessDenied(false);
      // Reload with code
      window.location.href = `/loja/${slug}?code=${codeInput}`;
    } else {
      setCodeError("Código de acesso incorreto.");
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return catalogProducts.filter((p) => p.product_name.toLowerCase().includes(q)).slice(0, 10);
  }, [searchQuery, catalogProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Loja não encontrada</h1>
        <p className="text-muted-foreground">Verifique o endereço e tente novamente.</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Loja Privada</h1>
        <p className="text-sm text-muted-foreground mb-6">Insira o código de acesso para visualizar esta loja.</p>
        <div className="w-full max-w-xs space-y-3">
          <Input
            type="text"
            value={codeInput}
            onChange={(e) => { setCodeInput(e.target.value); setCodeError(""); }}
            placeholder="Código de acesso"
            className="h-10"
            onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
          />
          {codeError && <p className="text-xs text-destructive">{codeError}</p>}
          <Button onClick={handleCodeSubmit} className="w-full">Acessar Loja</Button>
        </div>
      </div>
    );
  }

  // ─── Render Store ───
  const msgs = headerConfig.announcementMessages.filter((m) => m.text.trim());
  const loopMsgs = [...msgs, ...msgs];

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Announcement Bar */}
      {headerConfig.announcementEnabled && msgs.length > 0 && (
        <div className="w-full py-2 overflow-hidden" style={{ backgroundColor: headerConfig.announcementBgColor }}>
          <div className="flex whitespace-nowrap" style={{ animation: `marquee ${msgs.length * 6}s linear infinite` }}>
            {loopMsgs.map((msg, i) => (
              <span key={i} className="inline-block px-8 text-xs font-medium" style={{ color: headerConfig.announcementTextColor }}>{msg.text}</span>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full px-4 py-3 flex items-center gap-3 relative border-b border-border bg-card">
        {headerConfig.logoPosition === "left" ? (
          <>
            <div className="flex-shrink-0">
              {headerConfig.logoMode === "image" && headerConfig.logoImageUrl ? (
                <img src={headerConfig.logoImageUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <span className="text-base font-bold" style={{ color: headerConfig.logoTextColor }}>{headerConfig.logoText || storeName || "Loja"}</span>
              )}
            </div>
            <div className="flex-1" />
            <button onClick={() => setSearchOpen(!searchOpen)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Search size={16} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setSearchOpen(!searchOpen)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Search size={16} />
            </button>
            <div className="flex-1 flex justify-center">
              {headerConfig.logoMode === "image" && headerConfig.logoImageUrl ? (
                <img src={headerConfig.logoImageUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <span className="text-base font-bold" style={{ color: headerConfig.logoTextColor }}>{headerConfig.logoText || storeName || "Loja"}</span>
              )}
            </div>
            <div className="w-8" />
          </>
        )}

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border shadow-lg z-50 p-3 space-y-2">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
              <Search size={14} className="text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground" autoFocus />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>}
            </div>
            {searchQuery.trim() && (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchResults.length > 0 ? searchResults.map((product) => {
                  const info = getProductPriceInfo(product);
                  const q = searchQuery.toLowerCase();
                  const name = product.product_name;
                  const matchIdx = name.toLowerCase().indexOf(q);
                  return (
                    <button key={product.id} onClick={() => { setSelectedProduct(product); setSearchOpen(false); setSearchQuery(""); }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> :
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={14} className="text-muted-foreground/40" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {matchIdx >= 0 ? (
                            <>{name.slice(0, matchIdx)}<span className="bg-primary/20 text-primary font-bold">{name.slice(matchIdx, matchIdx + q.length)}</span>{name.slice(matchIdx + q.length)}</>
                          ) : name}
                        </p>
                        {info && <p className="text-[10px] text-muted-foreground">R${(info.salePrice || info.originalPrice)!.toFixed(2)}</p>}
                      </div>
                    </button>
                  );
                }) : <p className="text-xs text-muted-foreground text-center py-4">Nenhum produto encontrado</p>}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sections */}
      <main className="max-w-6xl mx-auto">
        {sections.map((section) => (
          <div key={section.id}>
            {(section.title || section.subtitle) && (
              <div className="px-4 md:px-8 pt-6 pb-2">
                {section.title && (
                  <h2 className="text-lg leading-tight" style={{ color: theme.titleColor, fontFamily: `'${theme.titleFont}', sans-serif`, fontWeight: theme.titleBold ? 700 : 400, fontStyle: theme.titleItalic ? "italic" : "normal" }}>
                    {section.title}
                  </h2>
                )}
                {section.subtitle && (
                  <p className="text-sm mt-0.5" style={{ color: theme.subtitleColor, fontFamily: `'${theme.subtitleFont}', sans-serif`, fontWeight: theme.subtitleBold ? 600 : 400, fontStyle: theme.subtitleItalic ? "italic" : "normal" }}>
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="px-4 md:px-8 pb-4">
              {section.type === "banner" && section.banners && section.banners.length > 0 && (
                <StoreBannerPreview banners={section.banners} iconColor={theme.iconColor} />
              )}

              {section.type === "destaque" && (
                <StoreDestaquePreview products={catalogProducts.slice(0, 5)} theme={theme} onSelect={setSelectedProduct} />
              )}

              {section.type === "produtos" && (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {catalogProducts.map((product) => {
                    const info = getProductPriceInfo(product);
                    return (
                      <div key={product.id} className="rounded-xl bg-card border border-border flex flex-col overflow-hidden">
                        <div className="aspect-square w-full overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted"><ShoppingBag size={24} className="text-muted-foreground/20" /></div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-center truncate" style={{ color: theme.titleColor, fontFamily: `'${theme.titleFont}', sans-serif`, fontWeight: theme.titleBold ? 700 : 500 }}>
                            {product.product_name}
                          </p>
                          {info && (
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                              {info.hasDiscount && <span className="text-[10px] line-through text-muted-foreground">R${info.originalPrice!.toFixed(2)}</span>}
                              <span className="text-xs" style={{ color: info.hasDiscount ? '#ef4444' : theme.priceColor, fontWeight: 700 }}>
                                R${(info.salePrice || info.originalPrice)!.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <button onClick={() => setSelectedProduct(product)}
                            className="mt-1.5 w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
                            style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}>
                            Comprar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      <ProductDetailModal product={selectedProduct} open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }} />
    </div>
  );
};

export default StorePage;
