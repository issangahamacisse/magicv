import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  User, 
  Briefcase, 
  GraduationCap,
  Lightbulb,
  Languages,
  FolderKanban,
  Award,
  AlertCircle
} from 'lucide-react';
import { useCVImport } from '@/hooks/useCVImport';
import { useCV } from '@/context/CVContext';
import { cn } from '@/lib/utils';

interface CVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CVImportModal: React.FC<CVImportModalProps> = ({ open, onOpenChange }) => {
  const { isLoading, progress, importedData, importFile, clearImportedData } = useCVImport();
  const { importCVData } = useCV();
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        importFile(file);
      }
    }
  }, [importFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      importFile(files[0]);
    }
  }, [importFile]);

  const handleApply = useCallback(() => {
    if (importedData) {
      importCVData(importedData);
      clearImportedData();
      onOpenChange(false);
    }
  }, [importedData, importCVData, clearImportedData, onOpenChange]);

  const handleClose = useCallback(() => {
    clearImportedData();
    onOpenChange(false);
  }, [clearImportedData, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importer un CV
          </DialogTitle>
          <DialogDescription>
            Importez un CV existant (PDF ou DOCX) et l'IA extraira automatiquement les informations.
          </DialogDescription>
        </DialogHeader>

        {!importedData ? (
          // Upload zone
          <div className="flex-1 py-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                dragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50",
                isLoading && "pointer-events-none opacity-50"
              )}
            >
              {isLoading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">{progress || 'Traitement en cours...'}</p>
                </div>
              ) : (
                <>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Glissez-déposez votre CV ici
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou cliquez pour sélectionner un fichier
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="cv-file-input"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="cv-file-input" className="cursor-pointer">
                      Parcourir
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formats acceptés : PDF, DOCX
                  </p>
                </>
              )}
            </div>

            {/* Premium Warning */}
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Mode Premium requis
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    L'importation d'un CV désactive le téléchargement gratuit avec filigrane. 
                    Vous devrez payer <strong>1000F</strong> pour télécharger le fichier final sans filigrane.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Note :</strong> Les CV très graphiques (colonnes complexes, images) peuvent être moins bien interprétés. 
                  Vous pourrez vérifier et corriger les données extraites avant de les appliquer.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Preview extracted data
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {/* Personal Info */}
              {importedData.personalInfo && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Informations personnelles</h3>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                    {importedData.personalInfo.fullName && (
                      <p><strong>Nom :</strong> {importedData.personalInfo.fullName}</p>
                    )}
                    {importedData.personalInfo.jobTitle && (
                      <p><strong>Titre :</strong> {importedData.personalInfo.jobTitle}</p>
                    )}
                    {importedData.personalInfo.email && (
                      <p><strong>Email :</strong> {importedData.personalInfo.email}</p>
                    )}
                    {importedData.personalInfo.phone && (
                      <p><strong>Téléphone :</strong> {importedData.personalInfo.phone}</p>
                    )}
                    {importedData.personalInfo.location && (
                      <p><strong>Localisation :</strong> {importedData.personalInfo.location}</p>
                    )}
                    {importedData.personalInfo.summary && (
                      <p className="mt-2"><strong>Résumé :</strong> {importedData.personalInfo.summary}</p>
                    )}
                  </div>
                </section>
              )}

              <Separator />

              {/* Experience */}
              {importedData.experience?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Expériences</h3>
                    <Badge variant="secondary">{importedData.experience.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {importedData.experience.map((exp, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{exp.position}</p>
                        <p className="text-muted-foreground">{exp.company}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {importedData.education?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Formation</h3>
                    <Badge variant="secondary">{importedData.education.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {importedData.education.map((edu, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-muted-foreground">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {importedData.skills?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Compétences</h3>
                    <Badge variant="secondary">{importedData.skills.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {importedData.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill.name}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {importedData.languages?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Langues</h3>
                    <Badge variant="secondary">{importedData.languages.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {importedData.languages.map((lang, idx) => (
                      <Badge key={idx} variant="outline">{lang.name}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {importedData.projects?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Projets</h3>
                    <Badge variant="secondary">{importedData.projects.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {importedData.projects.map((proj, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{proj.name}</p>
                        {proj.description && (
                          <p className="text-muted-foreground text-xs mt-1">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {importedData.certifications?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Certifications</h3>
                    <Badge variant="secondary">{importedData.certifications.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {importedData.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-muted-foreground">{cert.issuer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2">
          {importedData ? (
            <>
              <Button variant="outline" onClick={clearImportedData}>
                Recommencer
              </Button>
              <Button onClick={handleApply}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Appliquer au CV
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CVImportModal;
