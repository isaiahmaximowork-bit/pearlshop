import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import bannerWoman from '@/assets/banner-woman.png';
import bannerPhone from '@/assets/banner-phone-mockup.png';

const BannerSection = () => (
  <section className="relative z-10 w-full py-24 px-6">
    <div className="max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full rounded-[2.5rem] overflow-hidden min-h-[480px] md:min-h-[520px]"
        style={{
          background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 30%, #7c3aed 60%, #9333ea 100%)',
        }}
      >
        {/* Content grid */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center h-full">
          {/* Left: Woman image */}
          <div className="relative flex-shrink-0 w-full lg:w-[40%] flex items-end justify-center lg:justify-start">
            <img
              src={bannerWoman}
              alt="Mulher usando celular"
              className="h-[400px] md:h-[520px] object-contain object-bottom drop-shadow-2xl"
            />
          </div>

          {/* Center: Copy */}
          <div className="flex-1 px-8 md:px-12 py-10 lg:py-16 flex flex-col justify-center">
            <p className="text-white/80 text-sm font-medium mb-3 font-poppins">
              Sua loja automática com produtos do TikTok Shop
            </p>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1] mb-8 font-poppins">
              Com produtos que<br />
              já estão vendendo<br />
              no TikTok Shop
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-fit px-10 py-5 rounded-2xl bg-white text-purple-700 font-black text-base uppercase tracking-tight transition-all flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            >
              Criar minha loja agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <p className="text-white/60 text-xs font-medium mt-4 font-poppins">
              Comece agora. Sem cartão. Sem risco.
            </p>
          </div>

          {/* Right: Phone mockup with case study */}
          <div className="hidden lg:flex flex-col items-end pr-10 py-10 flex-shrink-0">
            <div className="mb-4 text-right">
              <p className="text-white font-bold text-sm font-poppins">Faça como a MF Store</p>
              <p className="text-white/70 text-xs font-poppins leading-relaxed mt-1">
                Loja ativa na PearlShop<br />
                +5 redes rodando e vendendo<br />
                automaticamente
              </p>
            </div>
            <div className="w-[200px] h-[400px] rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
              <img
                src={bannerPhone}
                alt="Mockup loja MF Store"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default BannerSection;
