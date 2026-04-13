import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import bannerWoman from '@/assets/banner-woman.png';
import bannerPhone from '@/assets/banner-phone-mockup.png';

const BannerSection = () => (
  <section
    className="relative z-10 w-full overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #7c3aed 100%)',
    }}
  >
    <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr_0.8fr] items-end min-h-[400px] md:min-h-[600px] lg:min-h-[700px]">

      {/* Left: Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col justify-center items-start px-5 md:px-12 py-8 md:py-12 lg:py-16 order-1 text-left"
      >
        <p className="text-white/70 text-sm font-medium mb-5 font-poppins tracking-wide">
          Tenha sua própria loja online
        </p>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-white tracking-tighter leading-[0.95] mb-6 md:mb-10 font-poppins"
          style={{ fontWeight: 900 }}
        >
          Com produtos que<br />
          já estão vendendo<br />
          no TikTok Shop
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-full bg-white text-purple-700 font-extrabold text-sm md:text-base tracking-tight transition-all flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
        >
          Criar minha loja agora
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-white/50 text-xs font-medium mt-4 font-poppins">
          Comece agora. Sem cartão. Sem risco.
        </p>
      </motion.div>

      {/* Center: Woman */}
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
          className="h-[300px] sm:h-[450px] md:h-[620px] lg:h-[750px] object-cover object-top drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
          style={{ objectPosition: 'top center' }}
        />
      </motion.div>

      {/* Right: Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden lg:flex flex-col items-end justify-start pr-8 pt-12 order-3 self-start"
      >
        <div className="mb-5 text-left">
          <p className="text-white font-bold text-base font-poppins">Faça como a MF Store</p>
          <p className="text-white/60 text-xs font-poppins leading-relaxed mt-1.5">
            Loja ativa na PearlShop<br />
            +5 redes rodando e vendendo<br />
            automaticamente
          </p>
        </div>
        <div className="relative w-[210px] h-[420px]">
          <div className="absolute inset-0 rounded-[2.2rem] border-[5px] border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden bg-white">
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
  </section>
);

export default BannerSection;
