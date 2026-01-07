import React from 'react';
import { useCV } from '@/context/CVContext';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Choisissez un template</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez le design qui correspond le mieux à votre profil
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const isSelected = currentTemplate === template.id;
            return (
              <Card
                key={template.id}
                onClick={() => updateTheme('template', template.id)}
                className={`relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                  <div className="w-[80%] h-[90%] bg-background rounded shadow-sm flex flex-col p-2">
                    {/* Mini template preview */}
                    <div className="h-3 w-1/2 bg-primary/20 rounded mb-1" />
                    <div className="h-2 w-3/4 bg-muted-foreground/20 rounded mb-2" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 w-full bg-muted-foreground/10 rounded" />
                      <div className="h-1.5 w-4/5 bg-muted-foreground/10 rounded" />
                      <div className="h-1.5 w-full bg-muted-foreground/10 rounded" />
                    </div>
                  </div>
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
