import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
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
import { ZoomIn, ZoomOut, Download, FileText, Loader2, Share2, Check, Copy, Lock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CVPreview = forwardRef<HTMLDivElement>((_, ref) => {
  const { cvData, currentResumeId } = useCV();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  
  const [addWatermark, setAddWatermark] = useState(true);
  const [usedAiImport, setUsedAiImport] = useState(false);
  const [permissionLoaded, setPermissionLoaded] = useState(false);
  
  const { exportToPdf, isExporting } = usePdfExport({
    filename: cvData.personalInfo.fullName 
      ? `CV-${cvData.personalInfo.fullName.replace(/\s+/g, '-')}`
      : 'mon-cv',
    addWatermark,
  });

  const { checkPermission, isChecking } = useDownloadPermission({
    resumeId: currentResumeId,
  });

  // Check permission on mount and when resumeId changes
  useEffect(() => {
    const loadPermission = async () => {
      if (currentResumeId && user) {
        const permission = await checkPermission();
        setUsedAiImport(permission.usedAiImport);
        setPermissionLoaded(true);
      } else {
        setUsedAiImport(false);
        setPermissionLoaded(true);
      }
    };
    loadPermission();
  }, [currentResumeId, user, checkPermission]);

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

  const handleDownload = async (premium: boolean = false) => {
    if (premium && !user) {
      toast.info('Connectez-vous pour télécharger sans filigrane');
      navigate('/auth');
      return;
    }

    if (premium) {
      // Check if user has premium access
      const permission = await checkPermission();
      if (!permission.isPremium) {
        toast.info('Débloquez le téléchargement premium pour retirer le filigrane');
        navigate(`/payment?resumeId=${currentResumeId}`);
        return;
      }
      setAddWatermark(false);
    } else {
      // Check if this is an AI-imported CV - free download not allowed
      if (usedAiImport) {
        toast.error('Ce CV a été importé via IA. Paiement requis pour télécharger.');
        navigate(`/payment?resumeId=${currentResumeId}`);
        return;
      }
      setAddWatermark(true);
    }

    // Small delay to ensure state is updated
    setTimeout(() => {
      exportToPdf(cvRef.current);
    }, 50);
  };

  const handleFreeDownload = () => handleDownload(false);
  const handlePremiumDownload = () => handleDownload(true);

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

          {/* Download Buttons */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2" disabled={isExporting || isChecking || !permissionLoaded}>
                {isExporting || isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Télécharger
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Show free option only if NOT an AI-imported CV */}
              {!usedAiImport ? (
                <DropdownMenuItem onClick={handleFreeDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Gratuit (avec filigrane)
                </DropdownMenuItem>
              ) : (
                <>
                  <div className="px-2 py-2 text-xs text-muted-foreground flex items-start gap-2">
                    <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Ce CV a été importé via IA. Le téléchargement gratuit n'est pas disponible.
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handlePremiumDownload}>
                <FileText className="h-4 w-4 mr-2" />
                {usedAiImport ? 'Télécharger (1000F)' : 'Premium (sans filigrane)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
