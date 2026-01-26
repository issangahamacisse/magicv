import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CVData } from '@/types/cv';
import { toast } from 'sonner';
import JSZip from 'jszip';
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (data: ArrayBuffer | { data: Uint8Array }) => {
        promise: Promise<{
          numPages: number;
          getPage: (num: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string }>;
            }>;
          }>;
        }>;
      };
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

interface ImportedCVData {
  personalInfo: Partial<CVData['personalInfo']>;
  experience: CVData['experience'];
  education: CVData['education'];
  skills: CVData['skills'];
  languages: CVData['languages'];
  projects: CVData['projects'];
  certifications: CVData['certifications'];
}

interface UseCVImportReturn {
  isLoading: boolean;
  progress: string;
  importedData: ImportedCVData | null;
  importFile: (file: File) => Promise<void>;
  clearImportedData: () => void;
}

export const useCVImport = (): UseCVImportReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [importedData, setImportedData] = useState<ImportedCVData | null>(null);

  const loadPdfJs = async (): Promise<void> => {
    if (window.pdfjsLib) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = () => reject(new Error('Impossible de charger PDF.js'));
      document.head.appendChild(script);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    await loadPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(`Extraction page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check if it's a valid ZIP file (DOCX is a ZIP)
    if (uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
      throw new Error('Format de fichier invalide');
    }

    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('Impossible de lire le contenu du fichier DOCX');
    }

    // Extract text from XML (simple regex approach)
    const textContent = documentXml
      .replace(/<w:p[^>]*>/g, '\n') // Paragraphs
      .replace(/<w:tab[^>]*>/g, '\t') // Tabs
      .replace(/<[^>]+>/g, '') // Remove all tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();

    return textContent;
  };

  const importFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setProgress('Préparation...');
    setImportedData(null);

    try {
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';
      let extractedText = '';

      // Extract text based on file type
      if (fileType === 'pdf') {
        setProgress('Extraction du texte PDF...');
        extractedText = await extractTextFromPDF(file);
      } else {
        setProgress('Extraction du texte DOCX...');
        extractedText = await extractTextFromDOCX(file);
      }

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Le fichier semble vide ou le texte n\'a pas pu être extrait');
      }

      console.log('Extracted text length:', extractedText.length);
      setProgress('Analyse par IA en cours...');

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('parse-cv', {
        body: { cvText: extractedText, fileType }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erreur lors de l\'analyse');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse du CV');
      }

      setImportedData(data.data);
      setProgress('');
      toast.success('CV analysé avec succès !');

    } catch (error) {
      console.error('Import error:', error);
      setProgress('');
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImportedData = useCallback(() => {
    setImportedData(null);
    setProgress('');
  }, []);

  return {
    isLoading,
    progress,
    importedData,
    importFile,
    clearImportedData,
  };
};
