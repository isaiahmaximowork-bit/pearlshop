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
        className="relative w-full rounded-[2.5rem] overflow-hidden"
        style={{ background: '#a855f7' }}
      >
        {/* Content grid - 3 columns */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] items-end h-full min-h-[520px]">
          
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center items-center lg:items-start px-6 md:px-8 py-12 lg:py-16 order-1 text-center lg:text-left"
          >
            <p className="text-white/80 text-sm font-medium mb-4 font-poppins tracking-wide">
              Sua loja automática com produtos do TikTok Shop
            </p>

            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-white tracking-tighter leading-[0.95] mb-10 font-poppins" style={{ fontWeight: 900 }}>
              Com produtos que<br />
              já estão vendendo<br />
              no TikTok Shop
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-full sm:w-auto px-12 py-5 rounded-2xl bg-white text-purple-700 font-black text-base uppercase tracking-tight transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
              Criar minha loja agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <p className="text-white/60 text-xs font-medium mt-5 font-poppins">
              Comece agora. Sem cartão. Sem risco.
            </p>
          </motion.div>

          {/* Center: Woman image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-end justify-center self-end order-2"
          >
            <img
              src={bannerWoman}
              alt="Mulher usando celular"
              className="h-[360px] md:h-[480px] lg:h-[520px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </motion.div>

          {/* Right: Phone mockup with case study */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex flex-col items-end justify-end pr-8 pb-10 order-3 self-end"
          >
            <div className="mb-5 text-right">
              <p className="text-white font-bold text-sm font-poppins">Faça como a MF Store</p>
              <p className="text-white/70 text-xs font-poppins leading-relaxed mt-1.5">
                Loja ativa na PearlShop<br />
                +5 redes rodando e vendendo<br />
                automaticamente
              </p>
            </div>
            <div className="relative w-[200px] h-[400px]">
              <div className="absolute inset-0 rounded-[2.2rem] border-[5px] border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[28px] bg-black rounded-b-2xl z-20" />
                <img
                  src={bannerPhone}
                  alt="Mockup loja MF Store"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default BannerSection;
