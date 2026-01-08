import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, FolderKanban, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProjectsForm: React.FC = () => {
  const { cvData, addProject, updateProject, removeProject } = useCV();
  const { projects } = cvData;

  const handleAddTechnology = (projectId: string, tech: string) => {
    if (!tech.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (project && !project.technologies.includes(tech.trim())) {
      updateProject(projectId, 'technologies', [...project.technologies, tech.trim()]);
    }
  };

  const handleRemoveTechnology = (projectId: string, tech: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, 'technologies', project.technologies.filter(t => t !== tech));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, projectId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleAddTechnology(projectId, input.value);
      input.value = '';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {projects.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucun projet ajouté
          </p>
          <Button onClick={addProject} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un projet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={project.id} className="p-4 form-section">
              <div className="flex items-start gap-3">
                <div className="drag-handle pt-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Projet {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(project.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Nom du projet</Label>
                      <Input
                        placeholder="Mon application"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">URL (optionnel)</Label>
                      <Input
                        placeholder="https://monprojet.com"
                        value={project.url || ''}
                        onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      placeholder="Description brève du projet et de vos contributions..."
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Technologies</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="gap-1">
                          {tech}
                          <button
                            onClick={() => handleRemoveTechnology(project.id, tech)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Appuyez Entrée pour ajouter (ex: React, Node.js)"
                      onKeyDown={(e) => handleKeyDown(e, project.id)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <Button onClick={addProject} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un projet
        </Button>
      )}
    </div>
  );
};

export default ProjectsForm;
