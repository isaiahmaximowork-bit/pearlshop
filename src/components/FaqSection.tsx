import { useState } from 'react';
import { Plus, Minus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: "Preciso aparecer nos vídeos?",
    answer: "Não. Os vídeos são criados com avatares IA realistas. Você não precisa gravar ou mostrar seu rosto."
  },
  {
    question: "Preciso editar os vídeos?",
    answer: "Não. Os vídeos já saem prontos, com roteiro, cortes e formato ideal para TikTok, Reels e Shorts."
  },
  {
    question: "Funciona pra quem está começando agora?",
    answer: "Sim. Você só precisa escolher um produto. O sistema cria, testa e publica os vídeos pra você."
  },
  {
    question: "Preciso investir dinheiro ou comprar produtos?",
    answer: "Não. Você trabalha como afiliado, vendendo produtos do TikTok Shop sem precisar de estoque."
  },
  {
    question: "Em quanto tempo posso ver resultados?",
    answer: "Você pode ter vídeos no ar em minutos. Muitos usuários começam a ver engajamento no mesmo dia."
  },
  {
    question: "Como eu ganho dinheiro com isso?",
    answer: "Cada venda feita através do seu link gera comissão automática pra você."
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className={`border-b border-white/5 transition-colors duration-300 ${isOpen ? 'bg-white/[0.02]' : ''}`}>
    <button onClick={onClick} className="w-full py-6 flex items-center justify-between text-left group">
      <span className={`text-base md:text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-purple-400' : 'text-zinc-300 group-hover:text-white'}`}>
        {question}
      </span>
      <div className={`shrink-0 ml-4 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-purple-600 border-purple-600 rotate-180' : 'bg-transparent border-white/10 group-hover:border-white/30'}`}>
        {isOpen ? <Minus size={16} className="text-white" /> : <Plus size={16} className="text-zinc-500 group-hover:text-white" />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pb-8 pr-12">
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">{answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight font-poppins">
            ANTES DE <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-800 uppercase tracking-tight">Começar.</span>
          </h2>
        </div>

        <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl px-6 md:px-10 mb-20">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        <div className="text-center space-y-10">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-zinc-500">
              <CheckCircle2 size={16} className="text-purple-500" />
              <p className="text-sm md:text-lg font-bold tracking-tight">
                Ainda com dúvida? <span className="text-white">Comece com 1 produto e veja na prática.</span>
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-14 py-7 rounded-[2rem] bg-white text-black font-black text-base md:text-lg uppercase tracking-widest transition-all flex items-center gap-4 mx-auto shadow-[0_30px_90px_rgba(255,255,255,0.1)]"
          >
            COMEÇAR COM 1 PRODUTO AGORA <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
