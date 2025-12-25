import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Lightbulb } from 'lucide-react';
import { Skill } from '@/types/cv';

const skillLevels: { value: Skill['level']; label: string }[] = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
];

const SkillsForm: React.FC = () => {
  const { cvData, addSkill, updateSkill, removeSkill } = useCV();
  const { skills } = cvData;

  return (
    <div className="space-y-4 animate-fade-in">
      {skills.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucune compétence ajoutée
          </p>
          <Button onClick={addSkill} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une compétence
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="p-3 form-section">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    placeholder="JavaScript, Gestion de projet..."
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  />
                  <Select
                    value={skill.level}
                    onValueChange={(value) => updateSkill(skill.id, 'level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
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
                  onClick={() => removeSkill(skill.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <Button onClick={addSkill} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une compétence
        </Button>
      )}

      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        <p className="font-medium mb-1">💡 Conseil</p>
        <p>Ajoutez 6-10 compétences pertinentes. Incluez à la fois des compétences techniques et des soft skills.</p>
      </div>
    </div>
  );
};

export default SkillsForm;
