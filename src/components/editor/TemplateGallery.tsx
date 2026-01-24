import React, { useState, useEffect } from 'react';
import { useCV } from '@/context/CVContext';
import { Card } from '@/components/ui/card';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const templates = [
  { id: 'modern', name: 'Moderne', description: 'Design épuré avec accents colorés' },
  { id: 'classic', name: 'Classique', description: 'Style traditionnel et professionnel' },
  { id: 'minimal', name: 'Minimal', description: 'Simple et élégant' },
  { id: 'creative', name: 'Créatif', description: 'Pour les profils créatifs' },
  { id: 'bold', name: 'Audacieux', description: 'Design impactant' },
  { id: 'elegant', name: 'Élégant', description: 'Sophistiqué et raffiné' },
  { id: 'tech', name: 'Tech', description: 'Pour les développeurs' },
  { id: 'executive', name: 'Exécutif', description: 'Pour les cadres' },
  { id: 'compact', name: 'Compact', description: 'Maximise l\'espace' },
  { id: 'artistic', name: 'Artistique', description: 'Expression créative' },
];

const TemplateGallery: React.FC = () => {
  const { cvData, updateTheme } = useCV();
  const currentTemplate = cvData.theme.template;
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  // Check existing previews on mount
  useEffect(() => {
    checkExistingPreviews();
  }, []);

  const checkExistingPreviews = async () => {
    const urls: Record<string, string> = {};
    
    for (const template of templates) {
      const { data } = supabase.storage
        .from('template-previews')
        .getPublicUrl(`${template.id}.png`);
      
      // Check if the file exists by trying to fetch it
      try {
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          urls[template.id] = `${data.publicUrl}?t=${Date.now()}`;
        }
      } catch {
        // File doesn't exist, will use SVG fallback
      }
    }
    
    setPreviewUrls(urls);
  };

  const generatePreview = async (templateId: string) => {
    setLoadingPreviews(prev => ({ ...prev, [templateId]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-preview', {
        body: { templateId }
      });

      if (error) throw error;

      if (data?.url) {
        setPreviewUrls(prev => ({ ...prev, [templateId]: `${data.url}?t=${Date.now()}` }));
        toast.success(`Preview "${templateId}" généré !`);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error(`Erreur lors de la génération du preview ${templateId}`);
    } finally {
      setLoadingPreviews(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const generateAllPreviews = async () => {
    setGeneratingAll(true);
    toast.info('Génération de tous les previews en cours... Cela peut prendre quelques minutes.');

    for (const template of templates) {
      if (!previewUrls[template.id]) {
        await generatePreview(template.id);
        // Small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setGeneratingAll(false);
    toast.success('Tous les previews ont été générés !');
  };

  const missingPreviews = templates.filter(t => !previewUrls[t.id]).length;

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Choisissez un template</h3>
          {missingPreviews > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={generateAllPreviews}
              disabled={generatingAll}
              className="text-xs"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Générer previews ({missingPreviews})
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez le design qui correspond le mieux à votre profil
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const isSelected = currentTemplate === template.id;
            const hasAiPreview = !!previewUrls[template.id];
            const isLoading = loadingPreviews[template.id];

            return (
              <Card
                key={template.id}
                onClick={() => updateTheme('template', template.id)}
                className={`relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden relative">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs">Génération IA...</span>
                    </div>
                  ) : hasAiPreview ? (
                    <img 
                      src={previewUrls[template.id]}
                      alt={`Template ${template.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <img 
                      src={`/templates/${template.id}.svg`}
                      alt={`Template ${template.name}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Generate button for missing previews */}
                  {!hasAiPreview && !isLoading && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-2 right-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        generatePreview(template.id);
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{template.name}</span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TemplateGallery;
