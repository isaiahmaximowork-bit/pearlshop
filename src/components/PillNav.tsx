import { useState } from 'react';
import { motion } from 'framer-motion';

const PillNav = () => {
  const [active, setActive] = useState('Funcionalidades');
  const items = ['Funcionalidades', 'Soluções', 'Preços'];

  return (
    <div className="bg-[#0d0d0d]/80 backdrop-blur-md border border-white/5 rounded-full p-1 flex items-center shadow-2xl font-poppins">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={`relative px-6 py-2.5 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
            active === item ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {active === item && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-purple-600 rounded-full z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{item}</span>
        </button>
      ))}
    </div>
  );
};

export default PillNav;
