import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Building2, Sparkles } from 'lucide-react';

const ExperienceForm: React.FC = () => {
  const { cvData, addExperience, updateExperience, removeExperience } = useCV();
  const { experience } = cvData;

  return (
    <div className="space-y-4 animate-fade-in">
      {experience.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucune expérience ajoutée
          </p>
          <Button onClick={addExperience} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une expérience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <Card key={exp.id} className="p-4 form-section">
              <div className="flex items-start gap-3">
                <div className="drag-handle pt-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Expérience {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Entreprise</Label>
                      <Input
                        placeholder="Nom de l'entreprise"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Poste</Label>
                      <Input
                        placeholder="Titre du poste"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Lieu</Label>
                    <Input
                      placeholder="Paris, France"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Date de début</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Date de fin</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked as boolean)}
                    />
                    <Label htmlFor={`current-${exp.id}`} className="text-sm font-normal cursor-pointer">
                      Poste actuel
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:text-primary/80 ai-shimmer"
                        disabled
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Générer des puces
                      </Button>
                    </div>
                    <Textarea
                      placeholder="• Développement de fonctionnalités clés&#10;• Gestion d'une équipe de 5 personnes&#10;• Amélioration des performances de 40%"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <Button onClick={addExperience} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une expérience
        </Button>
      )}
    </div>
  );
};

export default ExperienceForm;
