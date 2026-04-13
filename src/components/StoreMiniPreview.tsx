import { ShoppingBag, Image } from "lucide-react";

interface StoreMiniPreviewProps {
  previewCache: string | null;
  storeName: string;
}

/**
 * Lightweight dynamic mini-preview of the store based on saved builder config.
 * Renders a tiny static representation — no heavy screenshots.
 */
const StoreMiniPreview = ({ previewCache, storeName }: StoreMiniPreviewProps) => {
  let sections: any[] = [];
  let headerConfig: any = null;
  let theme: any = null;

  if (previewCache) {
    try {
      const parsed = JSON.parse(previewCache);
      sections = parsed.sections || [];
      headerConfig = parsed.headerConfig || null;
      theme = parsed.theme || null;
    } catch { /* ignore */ }
  }

  const headerBg = headerConfig?.headerBgColor || "#0a0a0a";
  const logoText = headerConfig?.logoText || storeName || "Loja";
  const logoColor = headerConfig?.logoColor || headerConfig?.logoTextColor || "#ffffff";
  const announcementBg = headerConfig?.announcementBgColor || "#7c3aed";
  const announcementEnabled = headerConfig?.announcementEnabled;
  const buttonBg = theme?.buttonBgColor || "#7c3aed";
  const titleColor = theme?.titleColor || "#ffffff";
  const subtitleColor = theme?.subtitleColor || "#a1a1aa";

  const bannerSection = sections.find((s: any) => s.type === "banner");
  const bannerImage = bannerSection?.banners?.[0]?.imageUrl;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border bg-background flex flex-col" style={{ fontSize: "4px" }}>
      {/* Announcement strip */}
      {announcementEnabled && (
        <div className="w-full py-[2px]" style={{ backgroundColor: announcementBg }}>
          <div className="w-8 h-[2px] mx-auto rounded-full bg-white/30" />
        </div>
      )}

      {/* Header */}
      <div className="w-full py-[6px] flex items-center justify-center" style={{ backgroundColor: headerBg }}>
        <span className="text-[6px] font-bold truncate px-2" style={{ color: logoColor }}>{logoText}</span>
      </div>

      {/* Banner */}
      <div className="w-full aspect-[3/1] bg-muted/50 overflow-hidden">
        {bannerImage ? (
          <img src={bannerImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={12} className="text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Products grid placeholder */}
      <div className="flex-1 p-[6px] space-y-[4px]">
        <div className="w-12 h-[3px] rounded-full" style={{ backgroundColor: titleColor, opacity: 0.6 }} />
        <div className="grid grid-cols-3 gap-[3px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[3px] overflow-hidden border border-border/50 bg-card">
              <div className="aspect-square bg-muted/40 flex items-center justify-center">
                <ShoppingBag size={6} className="text-muted-foreground/20" />
              </div>
              <div className="p-[2px] space-y-[1px]">
                <div className="w-full h-[2px] rounded-full bg-muted-foreground/20" />
                <div className="w-2/3 h-[2px] rounded-full" style={{ backgroundColor: subtitleColor, opacity: 0.4 }} />
                <div className="w-full h-[4px] rounded-[2px]" style={{ backgroundColor: buttonBg, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreMiniPreview;
