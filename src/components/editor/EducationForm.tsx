import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, GraduationCap } from 'lucide-react';

const EducationForm: React.FC = () => {
  const { cvData, addEducation, updateEducation, removeEducation } = useCV();
  const { education } = cvData;

  return (
    <div className="space-y-4 animate-fade-in">
      {education.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucune formation ajoutée
          </p>
          <Button onClick={addEducation} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une formation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <Card key={edu.id} className="p-4 form-section">
              <div className="flex items-start gap-3">
                <div className="drag-handle pt-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Formation {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Établissement</Label>
                    <Input
                      placeholder="Université Paris-Saclay"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Diplôme</Label>
                      <Input
                        placeholder="Master"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Domaine</Label>
                      <Input
                        placeholder="Informatique"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Date de début</Label>
                      <Input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Date de fin</Label>
                      <Input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Description (optionnel)</Label>
                    <Textarea
                      placeholder="Mention Très Bien, Spécialisation en IA..."
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <Button onClick={addEducation} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une formation
        </Button>
      )}
    </div>
  );
};

export default EducationForm;
