import { 
  ShieldCheck, Lock, UserCheck, Eye, Settings, Mail, 
  AlertTriangle, Globe, FileText, Cpu, Share2, CreditCard, Cookie
} from 'lucide-react';


const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-black py-20 px-6 md:px-20 font-poppins selection:bg-zinc-200">
      <div className="max-w-4xl mx-auto">
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        {/* CABEÇALHO DA PÁGINA */}
        <div className="mb-16 border-b border-zinc-100 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="PearlShop.io" className="h-10 w-auto brightness-0" />
            <span className="text-xl font-black italic tracking-tighter">PEARLSHOP</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-none text-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            Política de Privacidade
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-black font-bold uppercase tracking-widest text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <span>PearlShop Autonomous Systems</span>
            <span className="hidden md:block text-zinc-200">•</span>
            <span>Última atualização: 5 de Abril de 2026</span>
          </div>
        </div>

        {/* CONTEÚDO JURÍDICO */}
        <div className="space-y-16 text-zinc-600 leading-relaxed font-medium">
          <div className="space-y-4">
            <p className="text-xl text-zinc-800 font-medium leading-relaxed">
              A PearlShop.io faz parte do ecossistema Pearl, que inclui também a plataforma PearlPost.io. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos os dados dos usuários ao utilizar nossos serviços.
            </p>
          </div>

          {/* 1. INTRODUÇÃO */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">01</span>
              Introdução
            </h2>
            <p>
              A PearlShop.io é uma plataforma digital voltada à automação de criação de conteúdo, geração de vídeos com inteligência artificial e estruturação de lojas online baseadas em produtos do TikTok Shop. 
              A PearlPost.io, integrada ao ecossistema, é responsável pela distribuição e publicação de conteúdo em redes sociais. Ambas operam de forma complementar, respeitando os limites de acesso e finalidade de dados.
            </p>
          </section>

          {/* 2. DADOS COLETADOS */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">02</span>
              Dados coletados
            </h2>
            <p>Coletamos apenas os dados necessários para o funcionamento da plataforma:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Nome e E-mail', icon: Mail },
                { label: 'Identificadores de Contas', icon: Lock },
                { label: 'Dados via OAuth', icon: UserCheck },
                { label: 'Informações do TikTok Shop', icon: Globe },
                { label: 'Dados Técnicos (IP, Dispositivo)', icon: Settings },
                { label: 'Preferências de Uso', icon: Eye }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <item.icon size={18} className="text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-900">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. TIKTOK SHOP */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">03</span>
              Dados do TikTok Shop (PearlShop)
            </h2>
            <p>
              Ao conectar sua conta ao TikTok Shop, acessamos apenas os dados autorizados pela API oficial para exibir produtos, criar lojas automáticas e gerar conteúdos. A PearlShop não executa publicação direta; esta função é delegada à PearlPost.
            </p>
          </section>

          {/* 4 & 5. IA E DISTRIBUIÇÃO */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <Cpu size={32} className="text-black mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3">Geração IA</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Vídeos, imagens e avatares são gerados com base nos dados do produto e nas preferências do usuário, que detém a responsabilidade pelo uso final.</p>
            </div>
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <Share2 size={32} className="text-black mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3">PearlPost</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">A distribuição é feita via OAuth, permitindo publicação de vídeos e leitura de métricas sem que a PearlShop armazene tokens de publicação.</p>
            </div>
          </div>

          {/* 6. COMPARTILHAMENTO */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">06</span>
              Compartilhamento de dados
            </h2>
            <p>Seus dados podem ser compartilhados com a PearlPost.io, provedores de infraestrutura e APIs oficiais. Nunca vendemos dados pessoais em nenhuma circunstância.</p>
          </section>

          {/* 7 & 8. ARMAZENAMENTO E SEGURANÇA */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">07</span>
              Segurança e Localização
            </h2>
            <p>Os dados são armazenados em provedores de alta segurança no Brasil e nos Estados Unidos, utilizando criptografia HTTPS e controle de acesso baseado em privilégio mínimo.</p>
          </section>

          {/* 9 & 10. DIREITOS E EXCLUSÃO */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">09</span>
              Retenção e Direitos
            </h2>
            <p>Os dados são mantidos pelo tempo necessário para a operação. O usuário pode solicitar a exclusão total a qualquer momento, sendo processada em até 30 dias após o encerramento da conta.</p>
          </section>

          {/* 11 & 12. INCIDENTES E CONFORMIDADE */}
          <section className="p-8 border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
            <div className="flex items-start gap-4">
              <AlertTriangle size={24} className="text-black mt-1" />
              <div>
                <h3 className="font-black uppercase tracking-widest mb-2">Conformidade e Incidentes</h3>
                <p className="text-sm italic">Nos últimos 3 anos, não houve violações ou sanções. Em caso de incidentes, seguimos um protocolo rigoroso de contenção, análise e notificação.</p>
              </div>
            </div>
          </section>

          {/* 15 & 16. COOKIES E PAGAMENTOS */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 rounded-xl"><Cookie size={20} /></div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-1">Cookies</h4>
                <p className="text-xs text-zinc-500">Essenciais para autenticação e segurança do sistema.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 rounded-xl"><CreditCard size={20} /></div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-1">Pagamentos</h4>
                <p className="text-xs text-zinc-500">Processados via Stripe. Não armazenamos dados de cartão.</p>
              </div>
            </div>
          </div>

          {/* CONTATO FINAL */}
          <div className="pt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">© 2026 PearlShop.io • Ecossistema Pearl</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={14} className="text-zinc-400" />
                <span className="text-sm font-bold text-black">suporte@Pearlshop.io</span>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <FileText size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Privacy Protocol v3.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
