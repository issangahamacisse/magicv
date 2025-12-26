import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface UsePdfExportOptions {
  filename?: string;
  addWatermark?: boolean;
}

export const usePdfExport = (options: UsePdfExportOptions = {}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { filename = 'mon-cv', addWatermark = false } = options;

  const exportToPdf = useCallback(async (element: HTMLElement | null) => {
    if (!element) {
      toast.error("Impossible de trouver le CV à exporter");
      return;
    }

    setIsExporting(true);
    
    try {
      // Create a clone of the element for export
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Add watermark for free users
      if (addWatermark) {
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Créé avec CV Builder', pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      }

      pdf.save(`${filename}.pdf`);
      toast.success("CV exporté avec succès !");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export du CV");
    } finally {
      setIsExporting(false);
    }
  }, [filename, addWatermark]);

  return { exportToPdf, isExporting };
};
