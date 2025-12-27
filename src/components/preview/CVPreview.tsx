import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useCV } from '@/context/CVContext';
import { useAuth } from '@/context/AuthContext';
import { usePdfExport } from '@/hooks/usePdfExport';
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
import { ZoomIn, ZoomOut, Download, FileText, Loader2, Share2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';

const CVPreview = forwardRef<HTMLDivElement>((_, ref) => {
  const { cvData } = useCV();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const cvRef = useRef<HTMLDivElement>(null);
  
  const { exportToPdf, isExporting } = usePdfExport({
    filename: cvData.personalInfo.fullName 
      ? `CV-${cvData.personalInfo.fullName.replace(/\s+/g, '-')}`
      : 'mon-cv',
    addWatermark: false, // 100% free for now
  });

  useImperativeHandle(ref, () => cvRef.current as HTMLDivElement);

  const templateComponents: Record<string, React.FC<{ data: typeof cvData }>> = {
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
      navigate('/auth');
      return;
    }
    await exportToPdf(cvRef.current);
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
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
          </Button>

          {/* Download Button */}
          <Button onClick={handleDownload} size="sm" className="gap-2" disabled={isExporting}>
            {isExporting ? (
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
          ref={cvRef}
          className="cv-paper transition-transform origin-top"
          style={{ 
            transform: `scale(${zoom / 100})`,
            width: '210mm',
            minHeight: '297mm',
          }}
        >
          <TemplateComponent data={cvData} />
        </div>
      </div>
    </div>
  );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;
