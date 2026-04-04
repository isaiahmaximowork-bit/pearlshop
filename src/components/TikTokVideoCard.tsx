import { useState } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TikTokVideoCardProps {
  videoId: string;
  thumbnail: string;
  showBadge: boolean;
  saleValue?: string;
}

const TikTokVideoCard = ({ videoId, thumbnail, showBadge, saleValue }: TikTokVideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  return (
    <div 
      className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 relative group mb-4"
      onMouseEnter={handlePlay}
      onMouseLeave={handleStop}
      onClick={handlePlay}
    >
      {isPlaying ? (
        <iframe
          src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&mute=1&controls=0&loop=1&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0`}
          className="w-full border-0"
          allow="autoplay"
          style={{ pointerEvents: 'none', height: '120%', marginTop: '-10%' }}
        />
      ) : (
        <>
          {thumbnail ? (
            <img 
              src={thumbnail} 
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
              alt="TikTok Video" 
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-3">
              <Play size={16} className="fill-white text-white" />
            </div>
          </div>
        </>
      )}
      
      <AnimatePresence>
        {showBadge && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            className="absolute bottom-3 left-3 right-3 bg-white p-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 border border-zinc-200 flex items-center gap-2 pointer-events-none"
          >
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-white" size={14} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter leading-none mb-0.5 font-poppins">Venda Confirmada</p>
              <p className="text-[11px] font-black leading-none text-black font-poppins">+ {saleValue}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikTokVideoCard;
