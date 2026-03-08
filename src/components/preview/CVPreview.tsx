import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useCV } from '@/context/CVContext';
import { useAuth } from '@/context/AuthContext';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useDocxExport } from '@/hooks/useDocxExport';
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
import { ZoomIn, ZoomOut, Download, FileText, Loader2, Share2, Check, Copy, Lock, Globe, GlobeLock, FileSpreadsheet } from 'lucide-react';
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

  const { exportToDocx, isExporting: isExportingDocx } = useDocxExport();

  const { checkPermission, isChecking } = useDownloadPermission({
    resumeId: currentResumeId,
  });

  const { isPublic, isLoading: isTogglingPublic, loadPublicStatus, togglePublic, getPublicUrl } = usePublicShare(currentResumeId);

  // Load public status on mount
  useEffect(() => {
    if (currentResumeId && user) {
      loadPublicStatus();
    }
  }, [currentResumeId, user, loadPublicStatus]);

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

  const handleDocxDownload = () => {
    exportToDocx(cvData);
  };

  const handleCopyPublicLink = async () => {
    const url = getPublicUrl();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Lien public copié !');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Impossible de copier le lien');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV - ${cvData.personalInfo.fullName || 'Mon CV'}`,
          text: 'Découvrez mon CV professionnel',
          url: isPublic && getPublicUrl() ? getPublicUrl()! : window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyPublicLink();
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between p-2 sm:p-3 border-b border-border bg-card gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium hidden sm:inline">Aperçu</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4">
          {/* Zoom Controls - hidden on mobile */}
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
              <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && currentResumeId && (
                <>
                  <DropdownMenuItem onClick={togglePublic} disabled={isTogglingPublic}>
                    {isTogglingPublic ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isPublic ? (
                      <GlobeLock className="h-4 w-4 mr-2" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {isPublic ? 'Rendre privé' : 'Rendre public'}
                  </DropdownMenuItem>
                  {isPublic && (
                    <DropdownMenuItem onClick={handleCopyPublicLink}>
                      {copied ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copier le lien public
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download Buttons */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs sm:text-sm sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3" disabled={isExporting || isExportingDocx || isChecking || !permissionLoaded}>
                {isExporting || isExportingDocx || isChecking ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">Télécharger</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Show free option only if NOT an AI-imported CV */}
              {!usedAiImport ? (
                <DropdownMenuItem onClick={handleFreeDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF Gratuit (avec filigrane)
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
                {usedAiImport ? 'PDF (1000F)' : 'PDF Premium (sans filigrane)'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDocxDownload} disabled={isExportingDocx}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-start justify-center">
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
