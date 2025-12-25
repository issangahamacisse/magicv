import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Languages } from 'lucide-react';
import { Language } from '@/types/cv';

const languageLevels: { value: Language['level']; label: string }[] = [
  { value: 'basic', label: 'Notions' },
  { value: 'conversational', label: 'Courant' },
  { value: 'professional', label: 'Professionnel' },
  { value: 'fluent', label: 'Bilingue' },
  { value: 'native', label: 'Langue maternelle' },
];

const LanguagesForm: React.FC = () => {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCV();
  const { languages } = cvData;

  return (
    <div className="space-y-4 animate-fade-in">
      {languages.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <Languages className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucune langue ajoutée
          </p>
          <Button onClick={addLanguage} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une langue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((lang) => (
            <Card key={lang.id} className="p-3 form-section">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Français, Anglais..."
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                  />
                  <Select
                    value={lang.level}
                    onValueChange={(value) => updateLanguage(lang.id, 'level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(lang.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <Button onClick={addLanguage} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une langue
        </Button>
      )}
    </div>
  );
};

export default LanguagesForm;
