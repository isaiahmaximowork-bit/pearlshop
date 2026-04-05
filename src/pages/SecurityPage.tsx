import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const SecurityPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black py-16 px-6 md:px-20 font-poppins">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <img src={logo} alt="PearlShop.io" className="h-8 w-auto brightness-0 mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Segurança e Proteção de Dados</h1>
        <p className="text-xs text-zinc-400 mb-10">Última atualização: 5 de Abril de 2026</p>

        <div className="space-y-0 text-sm text-zinc-700 leading-relaxed">
          <p className="text-base text-zinc-800 mb-8">
            Na PearlShop, a segurança da informação é tratada como prioridade. Adotamos práticas e medidas técnicas para proteger os dados dos nossos usuários e garantir a integridade da plataforma.
          </p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">1. Proteção de dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Criptografia HTTPS — dados protegidos em trânsito</li>
            <li>Armazenamento seguro em provedores de nuvem confiáveis</li>
            <li>Acesso restrito com proteção contra intrusões</li>
            <li>Monitoramento 24/7 de atividades suspeitas</li>
          </ul>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">2. Controle de acesso</h2>
          <p>O acesso aos sistemas é restrito com base no princípio do privilégio mínimo. Apenas pessoas autorizadas têm acesso aos dados, limitado estritamente ao necessário para a operação, com credenciais protegidas por autenticação multifator.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">3. Infraestrutura e ambiente</h2>
          <p>A PearlShop utiliza infraestrutura em nuvem com padrões elevados de segurança (como AWS e Google Cloud). Os dados podem ser armazenados em servidores localizados no Brasil e/ou no exterior, sempre sob protocolos de proteção adequados à legislação vigente.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">4. Vulnerabilidades</h2>
          <p>Mantemos sistemas atualizados e adotamos monitoramento contínuo para identificar e corrigir possíveis falhas antes que se tornem riscos.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">5. Resposta a incidentes</h2>
          <p>Em caso de falha, isolamos o problema, investigamos a causa e aplicamos correções imediatas com total transparência aos usuários.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">6. Proteção de contas</h2>
          <p className="mb-3">Recomendações essenciais:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Uso de senhas complexas e únicas</li>
            <li>Não compartilhamento de credenciais</li>
            <li>Ativação de MFA quando disponível</li>
            <li>Monitoramento de acessos via e-mail</li>
          </ul>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">7. Integrações com terceiros</h2>
          <p>Integramos com serviços como o TikTok Shop e utilizamos a PearlPost para distribuição. Estas conexões seguem permissões explícitas, APIs oficiais e as políticas de segurança rigorosas de cada plataforma parceira.</p>

          <hr className="border-zinc-100 my-8" />
          <div className="text-xs text-zinc-400 space-y-1">
            <p>© 2026 PearlShop.io • Centro de Segurança</p>
            <p>Contacto: seguranca@pearlshop.io</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
