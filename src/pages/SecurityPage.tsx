import { 
  Lock, UserCheck, Shield, Settings, Mail, 
  AlertTriangle, ChevronRight, Globe, FileText, Database,
  Zap, RefreshCw, Eye, ShieldAlert, Fingerprint, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const SecurityPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black py-20 px-6 md:px-20 font-poppins selection:bg-zinc-200">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <div className="mb-16 border-b border-zinc-100 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="PearlShop.io" className="h-10 w-auto brightness-0" />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-none text-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            Segurança e Proteção de Dados
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-black font-bold uppercase tracking-widest text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <span>PearlShop Autonomous Systems</span>
            <span className="hidden md:block text-zinc-200">•</span>
            <span>Última atualização: 5 de Abril de 2026</span>
          </div>
        </div>

        <div className="space-y-16 text-zinc-600 leading-relaxed font-medium">
          <div className="space-y-4">
            <p className="text-xl text-zinc-800 font-medium leading-relaxed">
              Na PearlShop, a segurança da informação é tratada como prioridade. Adotamos práticas e medidas técnicas para proteger os dados dos nossos usuários e garantir a integridade da plataforma.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full">
              <Shield size={14} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black">Compromisso com segurança, privacidade e transparência</span>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">01</span>
              Proteção de dados
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Criptografia HTTPS', desc: 'Dados protegidos em trânsito.', icon: Lock },
                { label: 'Armazenamento Seguro', desc: 'Provedores de nuvem confiáveis.', icon: Database },
                { label: 'Acesso Restrito', desc: 'Proteção contra intrusões.', icon: ShieldAlert },
                { label: 'Monitoramento 24/7', desc: 'Vigilância de atividades suspeitas.', icon: Eye }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <item.icon size={18} className="text-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-black">{item.label}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">02</span>
              Controle de acesso
            </h2>
            <p>
              O acesso aos sistemas é restrito com base no princípio do privilégio mínimo. Isso significa que apenas pessoas autorizadas têm acesso aos dados, limitado estritamente ao necessário para a operação, com credenciais protegidas por autenticação multifator.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">03</span>
              Infraestrutura e ambiente
            </h2>
            <p>
              A PearlShop utiliza infraestrutura em nuvem com padrões elevados de segurança (como AWS e Google Cloud). Os dados podem ser armazenados em servidores localizados no Brasil e/ou no exterior (como Estados Unidos), sempre sob protocolos de proteção adequados à legislação vigente.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <RefreshCw size={32} className="text-black mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3">Vulnerabilidades</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Mantemos sistemas atualizados e adotamos monitoramento contínuo para identificar e corrigir possíveis falhas antes que se tornem riscos.</p>
            </div>
            <div className="p-8 bg-black text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <AlertTriangle size={32} className="text-white mb-4 relative z-10" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3 relative z-10">Resposta a Incidentes</h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative z-10">Em caso de falha, isolamos o problema, investigamos a causa e aplicamos correções imediatas com total transparência aos usuários.</p>
              <Zap size={80} className="absolute -bottom-4 -right-4 text-white/5" />
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">04</span>
              Proteção de contas
            </h2>
            <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
              <p className="text-sm font-bold text-black mb-4 uppercase tracking-widest">Recomendações essenciais:</p>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Uso de senhas complexas e únicas',
                  'Não compartilhamento de credenciais',
                  'Ativação de MFA quando disponível',
                  'Monitoramento de acessos via e-mail'
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
                    <ChevronRight size={14} className="text-black" /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">05</span>
              Integrações com terceiros
            </h2>
            <p>
              Integramos com serviços como o TikTok Shop e utilizamos a PearlPost para distribuição. Estas conexões seguem permissões explícitas, APIs oficiais e as políticas de segurança rigorosas de cada plataforma parceira.
            </p>
          </section>

          <div className="pt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">© 2026 PearlShop.io • Centro de Segurança</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={14} className="text-zinc-400" />
                <span className="text-sm font-bold text-black">seguranca@pearlshop.io</span>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <Fingerprint size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Security Protocol v2.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
