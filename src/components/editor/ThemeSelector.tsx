import React, { useState } from 'react';
import { useCV } from '@/context/CVContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { TemplateId } from '@/types/cv';
import { 
  Palette, 
  Type, 
  Maximize2, 
  Layout, 
  Briefcase, 
  Sparkles,
  Grid3X3,
  Layers,
  Zap,
  Brush,
  FileText,
  Check
} from 'lucide-react';

interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  icon: React.ElementType;
  previewColors: { primary: string; secondary: string; accent: string };
}

const templates: TemplateOption[] = [
  { 
    id: 'modern', 
    name: 'Moderne', 
    description: 'Épuré avec sidebar colorée',
    icon: Layout,
    previewColors: { primary: '#f8fafc', secondary: '#4f46e5', accent: '#818cf8' }
  },
  { 
    id: 'classic', 
    name: 'Classique', 
    description: 'Format traditionnel',
    icon: FileText,
    previewColors: { primary: '#ffffff', secondary: '#1f2937', accent: '#6b7280' }
  },
  { 
    id: 'creative', 
    name: 'Créatif', 
    description: 'Layout original asymétrique',
    icon: Brush,
    previewColors: { primary: '#fef3c7', secondary: '#d97706', accent: '#f59e0b' }
  },
  { 
    id: 'minimal', 
    name: 'Minimaliste', 
    description: 'Ultra-simple, focus texte',
    icon: Grid3X3,
    previewColors: { primary: '#ffffff', secondary: '#0a0a0a', accent: '#737373' }
  },
  { 
    id: 'elegant', 
    name: 'Élégant', 
    description: 'Raffiné avec typographie soignée',
    icon: Sparkles,
    previewColors: { primary: '#fafaf9', secondary: '#292524', accent: '#a8a29e' }
  },
  { 
    id: 'bold', 
    name: 'Audacieux', 
    description: 'Couleurs vives et impact fort',
    icon: Zap,
    previewColors: { primary: '#18181b', secondary: '#fafafa', accent: '#ef4444' }
  },
  { 
    id: 'executive', 
    name: 'Exécutif', 
    description: 'Professionnel haut de gamme',
    icon: Briefcase,
    previewColors: { primary: '#f1f5f9', secondary: '#0f172a', accent: '#3b82f6' }
  },
  { 
    id: 'tech', 
    name: 'Tech', 
    description: 'Style développeur moderne',
    icon: Layers,
    previewColors: { primary: '#0f172a', secondary: '#22d3ee', accent: '#a855f7' }
  },
  { 
    id: 'artistic', 
    name: 'Artistique', 
    description: 'Créatif avec formes organiques',
    icon: Palette,
    previewColors: { primary: '#fdf4ff', secondary: '#a855f7', accent: '#ec4899' }
  },
  { 
    id: 'compact', 
    name: 'Compact', 
    description: 'Maximum d\'info sur une page',
    icon: FileText,
    previewColors: { primary: '#f0fdf4', secondary: '#166534', accent: '#22c55e' }
  },
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

// Helper to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 79, g: 70, b: 229 };
};

// Helper to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const TemplatePreview: React.FC<{ template: TemplateOption; isSelected: boolean }> = ({ 
  template, 
  isSelected 
}) => {
  const { previewColors } = template;
  const Icon = template.icon;
  
  return (
    <div 
      className="relative w-full aspect-[3/4] rounded-md overflow-hidden border transition-all"
      style={{ 
        backgroundColor: previewColors.primary,
        borderColor: isSelected ? previewColors.secondary : 'transparent',
        borderWidth: isSelected ? '2px' : '1px'
      }}
    >
      {/* Header bar */}
      <div 
        className="h-[20%] w-full"
        style={{ backgroundColor: previewColors.secondary }}
      />
      
      {/* Content lines */}
      <div className="p-1.5 space-y-1">
        <div 
          className="h-1 w-3/4 rounded-full"
          style={{ backgroundColor: previewColors.secondary, opacity: 0.7 }}
        />
        <div 
          className="h-0.5 w-1/2 rounded-full"
          style={{ backgroundColor: previewColors.accent, opacity: 0.5 }}
        />
        <div 
          className="h-0.5 w-2/3 rounded-full"
          style={{ backgroundColor: previewColors.secondary, opacity: 0.3 }}
        />
        <div 
          className="h-0.5 w-1/2 rounded-full"
          style={{ backgroundColor: previewColors.secondary, opacity: 0.3 }}
        />
      </div>
      
      {/* Icon overlay */}
      <div className="absolute bottom-1 right-1">
        <Icon 
          className="h-3 w-3"
          style={{ color: previewColors.accent }}
        />
      </div>
      
      {/* Selected checkmark */}
      {isSelected && (
        <div 
          className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: previewColors.secondary }}
        >
          <Check className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
  );
};

const ThemeSelector: React.FC = () => {
  const { cvData, updateTheme } = useCV();
  const { theme } = cvData;
  
  const currentRgb = hexToRgb(theme.accentColor);
  const [rgb, setRgb] = useState(currentRgb);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: value };
    setRgb(newRgb);
    updateTheme('accentColor', rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHexChange = (hex: string) => {
    updateTheme('accentColor', hex);
    setRgb(hexToRgb(hex));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Template Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layout className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Template</Label>
            <p className="text-xs text-muted-foreground">Choisissez votre style</p>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => updateTheme('template', template.id)}
              className={cn(
                "group relative p-2 rounded-xl transition-all duration-200",
                "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                theme.template === template.id && "bg-primary/5 ring-2 ring-primary/30"
              )}
            >
              <TemplatePreview 
                template={template} 
                isSelected={theme.template === template.id} 
              />
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-[10px] font-medium truncate",
                  theme.template === template.id ? "text-primary" : "text-foreground/80"
                )}>
                  {template.name}
                </p>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 
                            bg-foreground text-background text-[10px] rounded-md opacity-0 
                            group-hover:opacity-100 transition-opacity pointer-events-none 
                            whitespace-nowrap z-10 shadow-lg">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RGB Color Picker */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Couleur d'accent</Label>
            <p className="text-xs text-muted-foreground">Personnalisez avec RGB</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 space-y-4">
          {/* Color Preview & Hex Input */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl shadow-inner border-2 border-white/20 transition-colors"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div className="flex-1 space-y-2">
              <Label className="text-xs text-muted-foreground">Code HEX</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={theme.accentColor.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) {
                        handleHexChange(val);
                      } else {
                        updateTheme('accentColor', val);
                      }
                    }
                  }}
                  className="font-mono text-sm h-9"
                  maxLength={7}
                />
                <Input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* RGB Sliders */}
          <div className="space-y-3">
            {/* Red */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-red-500">Rouge (R)</Label>
                <span className="text-xs font-mono bg-red-500/10 text-red-600 px-2 py-0.5 rounded">
                  {rgb.r}
                </span>
              </div>
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(0, ${rgb.g}, ${rgb.b}), 
                      rgb(255, ${rgb.g}, ${rgb.b}))`
                  }}
                />
                <Slider
                  value={[rgb.r]}
                  onValueChange={([value]) => handleRgbChange('r', value)}
                  max={255}
                  step={1}
                  className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>

            {/* Green */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-green-500">Vert (G)</Label>
                <span className="text-xs font-mono bg-green-500/10 text-green-600 px-2 py-0.5 rounded">
                  {rgb.g}
                </span>
              </div>
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(${rgb.r}, 0, ${rgb.b}), 
                      rgb(${rgb.r}, 255, ${rgb.b}))`
                  }}
                />
                <Slider
                  value={[rgb.g]}
                  onValueChange={([value]) => handleRgbChange('g', value)}
                  max={255}
                  step={1}
                  className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>

            {/* Blue */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-blue-500">Bleu (B)</Label>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                  {rgb.b}
                </span>
              </div>
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(${rgb.r}, ${rgb.g}, 0), 
                      rgb(${rgb.r}, ${rgb.g}, 255))`
                  }}
                />
                <Slider
                  value={[rgb.b]}
                  onValueChange={([value]) => handleRgbChange('b', value)}
                  max={255}
                  step={1}
                  className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Type className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Police</Label>
            <p className="text-xs text-muted-foreground">Style typographique</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {fonts.map((font) => (
            <button
              key={font.id}
              onClick={() => updateTheme('fontFamily', font.id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                theme.fontFamily === font.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted"
              )}
            >
              <p className={cn(
                "font-semibold text-sm",
                font.id === 'serif' ? 'font-serif' : 'font-sans'
              )}>
                {font.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{font.example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Maximize2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Espacement</Label>
            <p className="text-xs text-muted-foreground">Densité du contenu</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {spacings.map((spacing) => (
            <button
              key={spacing.id}
              onClick={() => updateTheme('spacing', spacing.id)}
              className={cn(
                "py-3 px-4 rounded-xl border-2 text-center text-sm font-medium transition-all",
                theme.spacing === spacing.id
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-transparent bg-muted/30 hover:bg-muted/50 text-foreground/70"
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
