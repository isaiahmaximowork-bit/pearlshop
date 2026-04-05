import { Download } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const policies = [
  { label: 'Política de Privacidade', path: '/politica-de-privacidade', filename: 'politica-privacidade.pdf' },
  { label: 'Termos de Uso', path: '/termos-de-uso', filename: 'termos-de-uso.pdf' },
  { label: 'Segurança', path: '/seguranca', filename: 'seguranca.pdf' },
];

const PdfDownloadSection = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (path: string, filename: string) => {
    setLoading(filename);
    try {
      // Create a hidden iframe to render the page
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '1024px';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      iframe.src = path;

      await new Promise<void>((resolve) => {
        iframe.onload = () => setTimeout(resolve, 1500);
      });

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe');

      const content = iframeDoc.body;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1024,
        windowWidth: 1024,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      document.body.removeChild(iframe);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="relative z-10 py-12 px-4 md:px-10">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 text-center">
          📄 Download Políticas (PDF)
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {policies.map((p) => (
            <button
              key={p.filename}
              onClick={() => handleDownload(p.path, p.filename)}
              disabled={loading === p.filename}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-wait"
            >
              <Download size={16} />
              {loading === p.filename ? 'Gerando...' : p.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PdfDownloadSection;
