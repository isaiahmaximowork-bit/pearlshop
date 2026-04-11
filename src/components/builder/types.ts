export type SectionType = "banner" | "destaque" | "produtos";

export type TextPosition =
  | "center"
  | "center-left"
  | "center-right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type MaskType = "full" | "bottom" | "top" | "left" | "right";

export type FontFamily = "Poppins" | "Arial" | "Montserrat" | "Playfair Display" | "Roboto";

export interface BannerTextConfig {
  title: string;
  subtitle: string;
  position: TextPosition;
  fontFamily: FontFamily;
  fontBold: boolean;
  fontItalic: boolean;
  mask: {
    enabled: boolean;
    type: MaskType;
    intensity: number; // 0-100
  };
}

export interface BannerItem {
  id: string;
  imageUrl?: string;
  link?: string;
  textConfig: BannerTextConfig;
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  banners?: BannerItem[];
}

export const defaultTextConfig: BannerTextConfig = {
  title: "",
  subtitle: "",
  position: "center",
  fontFamily: "Arial",
  fontBold: false,
  fontItalic: false,
  mask: {
    enabled: false,
    type: "bottom",
    intensity: 50,
  },
};

export const sectionLabels: Record<SectionType, string> = {
  banner: "Seção Banner",
  destaque: "Seção Destaques",
  produtos: "Seção Produtos",
};

export const sectionDescriptions: Record<SectionType, string> = {
  banner: "Até 3 banners rotativos (5s)",
  destaque: "Até 5 produtos em destaque (7s)",
  produtos: "Seção normal de produtos",
};

export const fontOptions: { value: FontFamily; label: string }[] = [
  { value: "Poppins", label: "Poppins" },
  { value: "Arial", label: "Arial" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
];

export const textPositionOptions: { value: TextPosition; label: string }[] = [
  { value: "center", label: "Centro" },
  { value: "center-left", label: "Centro Esquerdo" },
  { value: "center-right", label: "Centro Direito" },
  { value: "top-left", label: "Superior Esquerdo" },
  { value: "top-right", label: "Superior Direito" },
  { value: "bottom-left", label: "Inferior Esquerdo" },
  { value: "bottom-right", label: "Inferior Direito" },
];

export const maskTypeOptions: { value: MaskType; label: string }[] = [
  { value: "full", label: "Tela Inteira" },
  { value: "bottom", label: "Inferior (↑)" },
  { value: "top", label: "Superior (↓)" },
  { value: "left", label: "Esquerdo (→)" },
  { value: "right", label: "Direito (←)" },
];
