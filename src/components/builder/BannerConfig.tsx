import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Trash2, Upload, Clock, Search, Image, Bold, Italic, X, Loader2
} from "lucide-react";
import { toast } from "sonner";
import type {
  BuilderSection, BannerItem, BannerTextConfig,
  TextPosition, MaskType, FontFamily,
} from "./types";
import {
  defaultTextConfig, fontOptions, textPositionOptions, maskTypeOptions,
} from "./types";

// Categories of images for quick browsing
const IMAGE_CATEGORIES: Record<string, string[]> = {
  "Loja": [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    "https://images.unsplash.com/photo-1528698827591-e19cef791f48?w=800&q=80",
  ],
  "Moda": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
  ],
  "Tecnologia": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=800&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80",
  ],
  "Comida": [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  ],
  "Natureza": [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1518173946687-a1e7506f55c0?w=800&q=80",
  ],
  "Promoção": [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80",
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80",
  ],
  "Beleza": [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=80",
  ],
  "Fitness": [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80",
  ],
};

const ALL_IMAGES = Object.values(IMAGE_CATEGORIES).flat();

interface BannerConfigProps {
  section: BuilderSection;
  onAddBanner: (sectionId: string) => void;
  onRemoveBanner: (sectionId: string, bannerId: string) => void;
  onUpdateBanner: (sectionId: string, bannerId: string, updates: Partial<BannerItem>) => void;
  onUpdateBannerText: (sectionId: string, bannerId: string, updates: Partial<BannerTextConfig>) => void;
}

const BannerConfig = ({
  section, onAddBanner, onRemoveBanner, onUpdateBanner, onUpdateBannerText,
}: BannerConfigProps) => {
  const [expandedBannerId, setExpandedBannerId] = useState<string | null>(
    section.banners?.[0]?.id || null
  );
  const [showImagePicker, setShowImagePicker] = useState<string | null>(null);
  const [imageSearch, setImageSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter images based on search and category
  const filteredImages = (() => {
    if (selectedCategory && IMAGE_CATEGORIES[selectedCategory]) {
      return IMAGE_CATEGORIES[selectedCategory];
    }
    if (!imageSearch.trim()) return ALL_IMAGES;
    const term = imageSearch.toLowerCase();
    // Match category names
    const matchedCategories = Object.keys(IMAGE_CATEGORIES).filter(cat =>
      cat.toLowerCase().includes(term)
    );
    if (matchedCategories.length > 0) {
      return matchedCategories.flatMap(cat => IMAGE_CATEGORIES[cat]);
    }
    // Fallback: return all
    return ALL_IMAGES;
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Banners ({section.banners?.length || 0}/3)
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>Rotação: 5s</span>
        </div>
      </div>

      <div className="space-y-2">
        {section.banners?.map((banner, idx) => {
          const isExpanded = expandedBannerId === banner.id;
          const tc = banner.textConfig;

          return (
            <div key={banner.id} className="rounded-xl border border-border bg-background overflow-hidden">
              {/* Banner Header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedBannerId(isExpanded ? null : banner.id)}
              >
                <div className="w-14 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={12} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Banner {idx + 1}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {banner.imageUrl ? "Imagem definida" : "Sem imagem"}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveBanner(section.id, banner.id); }}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Expanded Config */}
              {isExpanded && (
                <div className="p-3 pt-0 space-y-4 border-t border-border">
                  {/* Image Selection */}
                  <div className="space-y-2 pt-3">
                    <Label className="text-xs text-muted-foreground">Imagem</Label>
                    {banner.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden aspect-[16/7] border border-border">
                        <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => onUpdateBanner(section.id, banner.id, { imageUrl: undefined })}
                          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setShowImagePicker(showImagePicker === banner.id ? null : banner.id)}
                    >
                      <Image size={14} /> {banner.imageUrl ? "Trocar Imagem" : "Escolher Imagem"}
                    </Button>

                    {showImagePicker === banner.id && (
                      <div className="space-y-2 p-2 rounded-lg border border-border bg-muted/30">
                        <div className="relative">
                          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por categoria..."
                            value={imageSearch}
                            onChange={(e) => { setImageSearch(e.target.value); setSelectedCategory(null); }}
                            className="h-8 text-xs pl-7"
                          />
                        </div>
                        {/* Category chips */}
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(IMAGE_CATEGORIES).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedCategory(selectedCategory === cat ? null : cat);
                                setImageSearch("");
                              }}
                              className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                                selectedCategory === cat
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                          {filteredImages.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                onUpdateBanner(section.id, banner.id, { imageUrl: url });
                                setShowImagePicker(null);
                                setImageSearch("");
                                setSelectedCategory(null);
                              }}
                              className="aspect-video rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Ou cole uma URL</Label>
                          <Input
                            placeholder="https://..."
                            className="h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement).value;
                                if (val) {
                                  onUpdateBanner(section.id, banner.id, { imageUrl: val });
                                  setShowImagePicker(null);
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text Config */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Textos do Banner</p>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Título</Label>
                      <Input
                        value={tc.title}
                        onChange={(e) => onUpdateBannerText(section.id, banner.id, { title: e.target.value })}
                        placeholder="Título do banner"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Subtítulo</Label>
                      <Input
                        value={tc.subtitle}
                        onChange={(e) => onUpdateBannerText(section.id, banner.id, { subtitle: e.target.value })}
                        placeholder="Subtítulo do banner"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Text Position */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Posição do Texto</Label>
                    <Select
                      value={tc.position}
                      onValueChange={(v) => onUpdateBannerText(section.id, banner.id, { position: v as TextPosition })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {textPositionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Fonte</Label>
                    <Select
                      value={tc.fontFamily}
                      onValueChange={(v) => onUpdateBannerText(section.id, banner.id, { fontFamily: v as FontFamily })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs" style={{ fontFamily: opt.value }}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => onUpdateBannerText(section.id, banner.id, { fontBold: !tc.fontBold })}
                        className={`p-1.5 rounded border transition-colors ${
                          tc.fontBold
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => onUpdateBannerText(section.id, banner.id, { fontItalic: !tc.fontItalic })}
                        className={`p-1.5 rounded border transition-colors ${
                          tc.fontItalic
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <Italic size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mask */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Máscara</Label>
                      <Switch
                        checked={tc.mask.enabled}
                        disabled={!tc.title && !tc.subtitle}
                        onCheckedChange={(checked) =>
                          onUpdateBannerText(section.id, banner.id, {
                            mask: { ...tc.mask, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {!tc.title && !tc.subtitle && (
                      <p className="text-[10px] text-muted-foreground/60">
                        Adicione um texto para ativar a máscara
                      </p>
                    )}

                    {tc.mask.enabled && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground">Tipo</Label>
                          <Select
                            value={tc.mask.type}
                            onValueChange={(v) =>
                              onUpdateBannerText(section.id, banner.id, {
                                mask: { ...tc.mask, type: v as MaskType },
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {maskTypeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] text-muted-foreground">Intensidade</Label>
                            <span className="text-[10px] text-muted-foreground">{tc.mask.intensity}%</span>
                          </div>
                          <Slider
                            value={[tc.mask.intensity]}
                            onValueChange={([v]) =>
                              onUpdateBannerText(section.id, banner.id, {
                                mask: { ...tc.mask, intensity: v },
                              })
                            }
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(section.banners?.length || 0) < 3 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => onAddBanner(section.id)}
        >
          <Plus size={14} /> Adicionar Banner
        </Button>
      )}
    </div>
  );
};

export default BannerConfig;
