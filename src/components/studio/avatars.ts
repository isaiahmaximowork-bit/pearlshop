import av23 from "@/assets/avatars/23.webp";
import av24 from "@/assets/avatars/24.webp";
import av25 from "@/assets/avatars/25.webp";
import av26 from "@/assets/avatars/26.webp";
import av27 from "@/assets/avatars/27.webp";
import av28 from "@/assets/avatars/28.webp";
import av29 from "@/assets/avatars/29.webp";
import av30 from "@/assets/avatars/30.webp";
import av31 from "@/assets/avatars/31.webp";

export type AvatarItem = { id: string; name: string; img?: string };

export const avatarsByCategory: Record<"mulheres" | "homens" | "ia", AvatarItem[]> = {
  mulheres: [
    { id: "f-sophia", name: "Sophia", img: av23 },
    { id: "f-amanda", name: "Amanda", img: av24 },
    { id: "f-isabela", name: "Isabela", img: av25 },
    { id: "f-helena", name: "Helena", img: av26 },
    { id: "f-camila", name: "Camila", img: av27 },
    { id: "f-julia", name: "Júlia", img: av30 },
    { id: "f-larissa", name: "Larissa", img: av31 },
  ],
  homens: [
    { id: "m-lucas", name: "Lucas", img: av28 },
    { id: "m-rafael", name: "Rafael", img: av29 },
  ],
  ia: [],
};

export const allAvatars: AvatarItem[] = [
  ...avatarsByCategory.mulheres,
  ...avatarsByCategory.homens,
  ...avatarsByCategory.ia,
];

export const findAvatar = (id: string | null): AvatarItem | undefined =>
  id ? allAvatars.find((a) => a.id === id) : undefined;
