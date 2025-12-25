import React from 'react';
import { useCV } from '@/context/CVContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Palette, Type, Maximize2 } from 'lucide-react';

const templates = [
  { id: 'modern', name: 'Moderne', description: 'Design épuré avec accents colorés' },
  { id: 'classic', name: 'Classique', description: 'Format traditionnel et professionnel' },
  { id: 'creative', name: 'Créatif', description: 'Layout original avec sidebar' },
];

const fonts = [
  { id: 'sans', name: 'Sans Serif', example: 'Inter, Arial' },
  { id: 'serif', name: 'Serif', example: 'Georgia, Times' },
];

const spacings = [
  { id: 'compact', name: 'Compact' },
  { id: 'normal', name: 'Normal' },
  { id: 'spacious', name: 'Aéré' },
];

const accentColors = [
  { color: '#4f46e5', name: 'Indigo' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#059669', name: 'Émeraude' },
  { color: '#d97706', name: 'Ambre' },
  { color: '#dc2626', name: 'Rouge' },
  { color: '#7c3aed', name: 'Violet' },
  { color: '#1f2937', name: 'Slate' },
];

const ThemeSelector: React.FC = () => {
  const { cvData, updateTheme } = useCV();
  const { theme } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Template Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Template
        </Label>
        <RadioGroup
          value={theme.template}
          onValueChange={(value) => updateTheme('template', value)}
          className="grid grid-cols-1 gap-3"
        >
          {templates.map((template) => (
            <label
              key={template.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                theme.template === template.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <RadioGroupItem value={template.id} className="sr-only" />
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  theme.template === template.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {theme.template === template.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Couleur d'accent</Label>
        <div className="flex flex-wrap gap-2">
          {accentColors.map((color) => (
            <button
              key={color.color}
              onClick={() => updateTheme('accentColor', color.color)}
              className={cn(
                "w-8 h-8 rounded-full transition-all border-2",
                theme.accentColor === color.color
                  ? "scale-110 shadow-md border-foreground/20"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color.color }}
              title={color.name}
            />
          ))}
          <div className="relative">
            <Input
              type="color"
              value={theme.accentColor}
              onChange={(e) => updateTheme('accentColor', e.target.value)}
              className="w-8 h-8 p-0 rounded-full cursor-pointer overflow-hidden border-2 border-dashed"
              title="Couleur personnalisée"
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4" />
          Police
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {fonts.map((font) => (
            <button
              key={font.id}
              onClick={() => updateTheme('fontFamily', font.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                theme.fontFamily === font.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className={cn("font-medium text-sm", font.id === 'serif' ? 'font-serif' : 'font-sans')}>
                {font.name}
              </p>
              <p className="text-xs text-muted-foreground">{font.example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Maximize2 className="h-4 w-4" />
          Espacement
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {spacings.map((spacing) => (
            <button
              key={spacing.id}
              onClick={() => updateTheme('spacing', spacing.id)}
              className={cn(
                "p-2 rounded-lg border text-center text-sm transition-all",
                theme.spacing === spacing.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              )}
            >
              {spacing.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
