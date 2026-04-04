import TikTokIcon from './TikTokIcon';
import { LucideIcon } from 'lucide-react';

interface PlatformIconProps {
  name: string;
  icon: LucideIcon | null;
  color: string | null;
}

const PlatformIcon = ({ name, icon: Icon, color }: PlatformIconProps) => (
  <div className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-transform duration-300 shrink-0">
    {name === "TikTok" ? (
      <TikTokIcon size={18} />
    ) : Icon ? (
      <Icon size={18} color={color || undefined} className="drop-shadow-sm" />
    ) : null}
    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-poppins">{name}</span>
  </div>
);

export default PlatformIcon;
