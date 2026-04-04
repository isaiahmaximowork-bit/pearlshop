import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CinematicCardProps {
  step: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  description: string;
  stats: { label: string; value: string };
  icon: LucideIcon;
}

const CinematicCard = ({ step, title, subtitle, image, tags, description, stats, icon: Icon }: CinematicCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: parseInt(step) * 0.1 }}
    className="group relative w-full md:w-[280px] h-[520px] bg-zinc-900 rounded-[24px] overflow-hidden shadow-2xl border border-white/5 font-poppins flex flex-col"
  >
    <div className="relative h-[200px] w-full overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 backdrop-blur-md border border-purple-500/30 flex items-center justify-center">
            <Icon size={16} className="text-purple-400" />
          </div>
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">{step}</span>
        </div>
      </div>
    </div>

    <div className="flex-1 p-6 bg-[#0a0a0a] flex flex-col justify-between border-t border-white/5">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight mb-1">{title}</h3>
        <h2 className="text-[10px] font-semibold text-zinc-500 mb-4 uppercase tracking-wider">{subtitle}</h2>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full border border-white/10 text-[8px] font-bold uppercase tracking-wider text-white bg-white/5">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">
          {description}
        </p>
      </div>

      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border border-black bg-zinc-800 overflow-hidden">
                <img src={`https://i.pravatar.cc/50?u=${title}${i}`} alt="user" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-purple-500 uppercase leading-none">{stats.label}</p>
            <p className="text-sm font-bold text-white font-poppins">{stats.value}</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default CinematicCard;
