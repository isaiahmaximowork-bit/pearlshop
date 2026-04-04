import { TikTokLogo, YouTubeLogo, FacebookLogo, InstagramLogo, StoreLogo } from './PlatformLogos';

interface PlatformIconProps {
  name: string;
}

const logoMap: Record<string, React.FC<{ size?: number }>> = {
  Instagram: InstagramLogo,
  Facebook: FacebookLogo,
  YouTube: YouTubeLogo,
  TikTok: TikTokLogo,
  "Loja Virtual": StoreLogo,
};

const PlatformIcon = ({ name }: PlatformIconProps) => {
  const Logo = logoMap[name];
  return (
    <div className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-transform duration-300 shrink-0">
      {Logo && <Logo size={18} />}
      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-poppins">{name}</span>
    </div>
  );
};

export default PlatformIcon;
