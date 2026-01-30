import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useCV } from '@/context/CVContext';
import { useAuth } from '@/context/AuthContext';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useDownloadPermission } from '@/hooks/useDownloadPermission';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ElegantTemplate from './ElegantTemplate';
import BoldTemplate from './BoldTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import TechTemplate from './TechTemplate';
import ArtisticTemplate from './ArtisticTemplate';
import CompactTemplate from './CompactTemplate';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, FileText, Loader2, Share2, Check, Copy } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CVPreview = forwardRef<HTMLDivElement>((_, ref) => {
  const { cvData, currentResumeId } = useCV();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  
  const { exportToPdf, isExporting } = usePdfExport({
    filename: cvData.personalInfo.fullName 
      ? `CV-${cvData.personalInfo.fullName.replace(/\s+/g, '-')}`
      : 'mon-cv',
    addWatermark: false,
  });

  const { checkPermission, isChecking } = useDownloadPermission({
    resumeId: currentResumeId,
  });

  useImperativeHandle(ref, () => cvRef.current as HTMLDivElement);

  const templateComponents: Record<string, React.ForwardRefExoticComponent<{ data: typeof cvData } & React.RefAttributes<HTMLDivElement>>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    minimal: MinimalTemplate,
    elegant: ElegantTemplate,
    bold: BoldTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
    artistic: ArtisticTemplate,
    compact: CompactTemplate,
  };

  const TemplateComponent = templateComponents[cvData.theme.template] || ModernTemplate;

  const handleDownload = async () => {
    if (!user) {
      toast.info('Connectez-vous pour télécharger votre CV');
      navigate('/auth');
      return;
    }

    // Check download permission
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      return; // checkPermission handles the redirect
    }

    await exportToPdf(cvRef.current);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV - ${cvData.personalInfo.fullName || 'Mon CV'}`,
          text: 'Découvrez mon CV professionnel',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Aperçu</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-24">
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={50}
                max={150}
                step={10}
                className="cursor-pointer"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
          </div>

          {/* Share Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copier le lien
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download Button */}
          <Button onClick={handleDownload} size="sm" className="gap-2" disabled={isExporting || isChecking}>
            {isExporting || isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Télécharger
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div 
          className="cv-paper transition-transform origin-top"
          style={{ 
            transform: `scale(${zoom / 100})`,
            width: '210mm',
            minHeight: '297mm',
          }}
        >
          <TemplateComponent ref={cvRef} data={cvData} />
        </div>
      </div>
    </div>
  );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;
