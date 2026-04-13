import { Instagram, Youtube, Mail } from 'lucide-react';
import TikTokIcon from '@/components/TikTokIcon';
import logo from '@/assets/logo.png';

interface FooterConfig {
  bgColor: string;
  textColor: string;
  logoColor: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  supportEmail: string;
}

interface StoreFooterProps {
  storeName: string;
  config: FooterConfig;
}

const defaultConfig: FooterConfig = {
  bgColor: '#1a1a1a',
  textColor: '#ffffff',
  logoColor: '#ffffff',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  supportEmail: '',
};

const StoreFooter = ({ storeName, config: rawConfig }: StoreFooterProps) => {
  const config = { ...defaultConfig, ...rawConfig };
  const mutedColor = `${config.textColor}99`;
  const borderColor = `${config.textColor}15`;

  const hasSocials = config.instagramUrl || config.tiktokUrl || config.youtubeUrl;

  return (
    <footer className="w-full" style={{ backgroundColor: config.bgColor, color: config.textColor }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Logo / Store name */}
        <div className="flex flex-col items-center text-center gap-6">
          <h3 className="text-lg font-bold" style={{ color: config.logoColor }}>
            {storeName || 'Loja'}
          </h3>

          {/* Disclaimer */}
          <div className="max-w-xl space-y-3" style={{ color: mutedColor }}>
            <p className="text-xs leading-relaxed">
              Todos os produtos exibidos nesta loja são vendidos exclusivamente através do <strong style={{ color: config.textColor }}>TikTok Shop</strong>.
              Ao clicar em "Comprar", você será redirecionado para a página do produto no TikTok, onde toda a transação será realizada.
            </p>
            <p className="text-xs leading-relaxed">
              A <strong style={{ color: config.textColor }}>PearlShop.io</strong> é apenas uma plataforma de vitrine e não se responsabiliza por entregas, trocas, devoluções, qualidade dos produtos ou qualquer problema decorrente da compra.
              Qualquer questão relacionada ao produto deve ser tratada diretamente com o vendedor responsável no TikTok Shop.
            </p>
            <p className="text-xs leading-relaxed">
              Nenhum dado pessoal é coletado por esta loja. Ao utilizar este site, você concorda com os termos acima.
            </p>
          </div>

          {/* Social links */}
          {hasSocials && (
            <div className="flex items-center gap-3">
              {config.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ backgroundColor: `${config.textColor}15` }}>
                  <Instagram size={16} style={{ color: config.textColor }} />
                </a>
              )}
              {config.tiktokUrl && (
                <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ backgroundColor: `${config.textColor}15` }}>
                  <TikTokIcon size={16} />
                </a>
              )}
              {config.youtubeUrl && (
                <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ backgroundColor: `${config.textColor}15` }}>
                  <Youtube size={16} style={{ color: config.textColor }} />
                </a>
              )}
            </div>
          )}

          {/* Support */}
          {config.supportEmail && (
            <div className="flex items-center gap-2" style={{ color: mutedColor }}>
              <Mail size={14} />
              <a href={`mailto:${config.supportEmail}`} className="text-xs hover:underline" style={{ color: mutedColor }}>
                {config.supportEmail}
              </a>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="my-8" style={{ borderTop: `1px solid ${borderColor}` }} />

        {/* Made with PearlShop */}
        <div className="flex flex-col items-center gap-3">
          <a href="https://pearlshop.io" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: mutedColor }}>Made with</span>
            <img src={logo} alt="PearlShop.io" className="h-5 w-auto" />
            <span className="text-xs font-bold" style={{ color: config.textColor }}>
              PearlShop<span className="italic" style={{ color: '#a78bfa' }}>.io</span>
            </span>
          </a>
          <p className="text-[10px]" style={{ color: `${config.textColor}50` }}>
            Make an online shop with TikTok Shop products
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
export type { FooterConfig };
