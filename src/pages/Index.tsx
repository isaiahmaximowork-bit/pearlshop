import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PillNav from '@/components/PillNav';
import PlatformIcon from '@/components/PlatformIcon';

import TikTokVideoCard from '@/components/TikTokVideoCard';

const platformNames = ["Instagram", "Facebook", "YouTube", "TikTok", "Loja Virtual"];

const tiktokVideos = [
  {
    videoId: "7564143795248434453",
    thumbnail: "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oQzRsFyaAAAeAjIjAEFuePoD7fU3SLTEDIED5I~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Bqw%2Fi5VYGiJvuRLVMzcJtB%2BMSZg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  },
  {
    videoId: "7602084289580158226",
    thumbnail: "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oUA4wwBCpI0ria5OhufAIqOB23o7BACRAiAdvI~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=d0U2LCJozGiaxWynhcXWkK9hP98%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  },
  {
    videoId: "7578644486436228360",
    thumbnail: "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oAsEQDkYABwlcOGslgiAwCIiIA1mABEfCAB0Am~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=LTYfsU9M7jVV4kRFMB0yYWPnkxE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  },
  {
    videoId: "7613042284795301141",
    thumbnail: "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oYwN0lAQIPGAmQeLepJGFm6rdABGWJAAIyseen~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Nt2l%2FizFgou%2BRfqkGHRFJEtPDZA%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  },
];

const tiktokVideosDown = [
  {
    videoId: "7584518645519273237",
    thumbnail: "",
  },
  {
    videoId: "7619299281052585236",
    thumbnail: "",
  },
  {
    videoId: "7621282092948753672",
    thumbnail: "",
  },
  {
    videoId: "7602353355461020936",
    thumbnail: "",
  },
];

const Index = () => {
  const [activeSale, setActiveSale] = useState<{ col: string; index: number; value: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const triggerSale = () => {
      const col = Math.random() > 0.5 ? 'up' : 'down';
      const index = Math.floor(Math.random() * (tiktokVideos.length * 2));
      const value = "R$ " + (Math.random() * 370 + 80).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      
      setActiveSale({ col, index, value });
      
      setTimeout(() => {
        setActiveSale(null);
      }, 3500);
    };

    const interval = setInterval(triggerSale, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020105] text-white font-poppins selection:bg-purple-500/30 overflow-x-hidden antialiased">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        
        .font-poppins { font-family: 'Poppins', sans-serif; }

        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .btn-purple-flow {
          background: linear-gradient(-45deg, #7c3aed, #a855f7, #6b21a8, #4c1d95);
          background-size: 300% 300%;
          animation: gradient-flow 6s ease infinite;
          transition: animation-duration 0.3s ease;
        }

        .btn-purple-flow:hover {
          animation-duration: 3s;
        }
        
        @keyframes marquee-h {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-h {
          animation: marquee-h 25s linear infinite;
        }

        @keyframes marquee-v-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-v-up {
          animation: marquee-v-up 30s linear infinite;
        }

        @keyframes marquee-v-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-v-down {
          animation: marquee-v-down 30s linear infinite;
        }

        .marquee-paused {
          animation-play-state: paused !important;
        }
        
        .mask-fade-edges-h {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }

        .mask-fade-edges-v {
          mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
        }

        .text-gradient-purple {
          background: linear-gradient(to bottom, #c084fc 10%, #6b21a8 95%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          padding-right: 0.15em;
          line-height: 1.1;
        }
      `}</style>

      {/* AURORA BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/5 rounded-full blur-[140px]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 py-8 px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter uppercase italic">
              PearlShop<span className="text-purple-500">.io</span>
            </span>
          </div>
          
          <div className="hidden lg:block">
            <PillNav />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-poppins">Entrar</button>
            <button className="px-6 py-2.5 rounded-full bg-purple-600 text-white font-extrabold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] font-poppins">Teste Grátis</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-10 pt-16 pb-32 grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-180px)]">
        
        {/* LADO ESQUERDO: COPY */}
        <div className="text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-6xl md:text-[84px] leading-[0.95] tracking-tighter mb-10 font-poppins"
          >
            <span className="font-semibold text-white">Venda no</span> <br />
            <span className="font-extrabold text-white">TikTok Shop.</span> <br />
            <span className="font-extrabold text-gradient-purple italic">Sem gravar, <br /> sem aparecer.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-xl mb-12 leading-relaxed font-medium font-poppins"
          >
            Economize 10x o tempo com vídeos de atores digitais gerados por IA. 
            A única plataforma que cria e faz tiktok shop em todas as principais redes com um clique.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-start gap-4 mb-16"
          >
            <button className="group relative w-full sm:w-[520px] h-[76px] overflow-hidden rounded-2xl btn-purple-flow text-white font-extrabold text-xl uppercase tracking-tighter shadow-[0_20px_50px_rgba(147,51,234,0.3)] active:scale-95 font-poppins">
              <div className="relative flex items-center justify-center gap-3 z-10">
                <span>Testar Grátis</span>
                <div className="overflow-hidden w-0 opacity-0 group-hover:w-8 group-hover:opacity-100 transition-all duration-500 ease-out translate-x-4 group-hover:translate-x-0">
                  <ArrowRight size={28} />
                </div>
              </div>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xs font-bold font-poppins text-zinc-500 uppercase tracking-wider text-center w-full">LANCE EM TODAS AS PLATAFORMAS</p>
            
            <div className="relative w-full overflow-hidden mask-fade-edges-h">
              <div className="flex animate-marquee-h whitespace-nowrap gap-4">
                {[...platformNames, ...platformNames].map((name, index) => (
                  <PlatformIcon key={index} name={name} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* LADO DIREITO: VERTICAL MARQUEE VIDEOS */}
        <div 
          className="relative h-[700px] grid grid-cols-2 gap-6 mask-fade-edges-v overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`flex flex-col animate-marquee-v-up ${isHovered ? 'marquee-paused' : ''}`}>
            {[...tiktokVideos, ...tiktokVideos].map((video, i) => (
              <TikTokVideoCard 
                key={`up-${i}`} 
                videoId={video.videoId}
                thumbnail={video.thumbnail}
                showBadge={activeSale?.col === 'up' && activeSale?.index === i}
                saleValue={activeSale?.value}
              />
            ))}
          </div>

          <div className={`flex flex-col animate-marquee-v-down ${isHovered ? 'marquee-paused' : ''}`}>
            {[...tiktokVideosDown, ...tiktokVideosDown].map((video, i) => (
              <TikTokVideoCard 
                key={`down-${i}`} 
                videoId={video.videoId}
                thumbnail={video.thumbnail}
                showBadge={activeSale?.col === 'down' && activeSale?.index === i}
                saleValue={activeSale?.value}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-10 flex justify-center items-center">
          <div className="flex items-center gap-2 group cursor-pointer opacity-50">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
              <ShoppingBag size={12} className="text-white" />
            </div>
            <span className="text-sm font-extrabold tracking-tighter uppercase italic font-poppins">
              PearlShop<span className="text-purple-500">.io</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
