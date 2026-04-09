import { ShoppingBag, Cpu, Share2, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CinematicCard from './CinematicCard';

import thumb1 from '@/assets/thumbnails/video1.jpg';
import thumb2 from '@/assets/thumbnails/video2.jpg';
import thumb3 from '@/assets/thumbnails/video3.jpg';
import thumb4 from '@/assets/thumbnails/video4.jpg';
import thumb5 from '@/assets/thumbnails/video5.jpg';
import thumb6 from '@/assets/thumbnails/video6.jpg';
import thumb7 from '@/assets/thumbnails/video7.jpg';

const thumbnails = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7];

// Distribute thumbnails across 5 columns, repeating as needed
const getColumnThumbs = (colIndex: number) => {
  const perCol = 4;
  const result: string[] = [];
  for (let i = 0; i < perCol; i++) {
    result.push(thumbnails[(colIndex * perCol + i) % thumbnails.length]);
  }
  return result;
};

const columns = [0, 1, 2, 3, 4].map(i => ({
  thumbs: getColumnThumbs(i),
  direction: i % 2 === 0 ? 'up' : 'down',
}));

const OperationalFlowSection = () => (
  <section className="relative z-10 w-full py-12 md:py-24 px-4 md:px-6 overflow-hidden">
    {/* ROTATING BACKGROUND THUMBNAILS */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex justify-around gap-0 opacity-[0.12]"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
      >
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className={`flex flex-col gap-3 flex-1 min-w-0 ${col.direction === 'up' ? 'animate-marquee-v-up' : 'animate-marquee-v-down'}`}
          >
            {[...col.thumbs, ...col.thumbs].map((thumb, i) => (
              <div key={i} className="w-full h-[320px] rounded-2xl overflow-hidden shrink-0">
                <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#020105]/25" />
    </div>

    {/* CONTENT */}
    <div className="relative z-10 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
        >
          <Zap size={12} className="text-purple-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Operational Flow</span>
        </motion.div>
        
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 font-poppins leading-tight">
          Veja isso <span className="italic text-gradient-purple uppercase">Acontecendo.</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-poppins">
          O fluxo automatizado que transforma produtos em lucro, <br className="hidden md:block" /> sem que você precise gravar um único segundo.
        </p>
        <p className="mt-4 text-sm text-purple-400 font-semibold font-poppins tracking-wide">
          Em menos de 2 minutos, seu primeiro vídeo já está no ar.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 md:gap-8">
        <CinematicCard 
          step="01"
          title="Escolha do Produto"
          subtitle="Análise de Tendências"
          image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
          icon={ShoppingBag}
          tags={["Trendy", "Viral Score", "9.8"]}
          description="A gente encontra produtos com alta chance de vender — antes de todo mundo."
          stats={{ label: "Precisão", value: "98.4%" }}
        />
        <CinematicCard 
          step="02"
          title="Criação dos Vídeos"
          subtitle="Digital Actors"
          image={thumb1}
          icon={Cpu}
          tags={["Realismo", "4K Render"]}
          description="Um apresentador digital grava o vídeo pra você — parece gente de verdade, e fica pronto em minutos."
          stats={{ label: "Velocidade", value: "vídeo #12 gerado agora" }}
        />
        <CinematicCard 
          step="03"
          title="Postagem Automática"
          subtitle="Multi-Platform"
          image="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600"
          icon={Share2}
          tags={["TikTok", "Reels", "Shorts"]}
          description="O vídeo vai pro ar sozinho, com link nos comentários — você não precisa abrir nenhum app."
          stats={{ label: "Escala", value: "hook testado: POV…" }}
        />
        <CinematicCard 
          step="04"
          title="Vendas Acontecendo"
          subtitle="Resultados Reais"
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
          icon={TrendingUp}
          tags={["ROI", "Sales", "Cashout"]}
          description="Você acompanha as vendas caindo em tempo real. O sistema repete o processo com novos produtos automaticamente."
          stats={{ label: "Agora", value: "+3 vendas nas últimas 2h" }}
        />
      </div>

      <div className="mt-12 md:mt-20 text-center">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group px-6 md:px-10 py-4 md:py-5 rounded-2xl bg-white text-black font-extrabold text-xs md:text-sm uppercase tracking-widest transition-all flex items-center gap-3 mx-auto shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
        >
          Começar com 1 produto agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  </section>
);

export default OperationalFlowSection;
