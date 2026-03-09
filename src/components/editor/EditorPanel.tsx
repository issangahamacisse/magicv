import React, { useEffect, useState } from 'react';
import { useCV } from '@/context/CVContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  User,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Languages,
  Palette,
  Save,
  Loader2,
  Cloud,
  FolderKanban,
  Award,
  Upload,
  Sparkles,
  Wand2,
} from 'lucide-react';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import ThemeSelector from './ThemeSelector';
import ProjectsForm from './ProjectsForm';
import CertificationsForm from './CertificationsForm';
import CVImportModal from './CVImportModal';
import AISmartFillModal from './AISmartFillModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface EditorPanelProps {
  openSection?: string;
  onSectionOpened?: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ openSection, onSectionOpened }) => {
  const { completionScore, isSaving, isCloudSynced, cvData, importCVData } = useCV();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(['personal']);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSmartFillOpen, setIsSmartFillOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleRewriteAll = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour utiliser cette fonctionnalité');
      return;
    }

    const hasContent = cvData.experience.length > 0 || cvData.education.length > 0 || cvData.personalInfo.summary;
    if (!hasContent) {
      toast.error('Votre CV est vide. Remplissez d\'abord quelques sections.');
      return;
    }

    setIsRewriting(true);
    try {
      const cvText = JSON.stringify({
        personalInfo: cvData.personalInfo,
        experience: cvData.experience,
        education: cvData.education,
        skills: cvData.skills,
        languages: cvData.languages,
      });

      const { data, error } = await supabase.functions.invoke('ai-rewrite', {
        body: { text: cvText, action: 'rewrite-all' }
      });

      if (error) {
        toast.error('Erreur lors de la reformulation');
        return;
      }

      if (data?.error) {
        if (data.requiresPayment) {
          toast.error(data.error, {
            action: { label: 'Acheter des crédits', onClick: () => window.location.href = '/payment' },
          });
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.cvData) {
        const addIds = (items: any[]) =>
          items?.map((item: any) => ({ ...item, id: crypto.randomUUID() })) || [];

        const importData: any = {};
        if (data.cvData.personalInfo) importData.personalInfo = data.cvData.personalInfo;
        if (data.cvData.experience?.length) importData.experience = addIds(data.cvData.experience);
        if (data.cvData.education?.length) importData.education = addIds(data.cvData.education);
        if (data.cvData.skills?.length) importData.skills = addIds(data.cvData.skills);
        if (data.cvData.languages?.length) importData.languages = addIds(data.cvData.languages);

        importCVData(importData);
        toast.success('CV reformulé et amélioré avec succès !');
      }
    } catch (err) {
      console.error('Rewrite all error:', err);
      toast.error('Erreur lors de la communication avec l\'IA');
    } finally {
      setIsRewriting(false);
    }
  };

  const sections = [
    { id: 'personal', icon: User, label: 'Informations personnelles', component: PersonalInfoForm },
    { id: 'experience', icon: Briefcase, label: 'Expérience', component: ExperienceForm },
    { id: 'education', icon: GraduationCap, label: 'Formation', component: EducationForm },
    { id: 'skills', icon: Lightbulb, label: 'Compétences', component: SkillsForm },
    { id: 'languages', icon: Languages, label: 'Langues', component: LanguagesForm },
    { id: 'projects', icon: FolderKanban, label: 'Projets', component: ProjectsForm },
    { id: 'certifications', icon: Award, label: 'Certifications', component: CertificationsForm },
    { id: 'theme', icon: Palette, label: 'Apparence', component: ThemeSelector },
  ];

  // Handle external section opening (from Quick Wins)
  useEffect(() => {
    if (openSection && !openSections.includes(openSection)) {
      setOpenSections(prev => [...prev, openSection]);
      onSectionOpened?.();
      
      // Scroll to the section after a short delay
      setTimeout(() => {
        const element = document.getElementById(`section-${openSection}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [openSection, onSectionOpened]);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border bg-gradient-to-b from-background to-card">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-lg font-semibold text-foreground">Éditeur de CV</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : isCloudSynced ? (
              <>
                <Cloud className="h-3 w-3 text-emerald-500" />
                <span>Synchronisé</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                <span>Sauvegardé</span>
              </>
            )}
          </div>
        </div>

        {/* Import Button */}
        <div className="flex flex-col gap-2 mb-2 sm:mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer un CV (PDF/DOCX)
          </Button>
          <Button 
            size="sm" 
            className="w-full text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80"
            onClick={() => setIsSmartFillOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Remplissage intelligent IA ✨
          </Button>
        </div>

        {/* Completion Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Complétion du CV</span>
            <span className="font-semibold text-primary">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completionScore < 50 
              ? "Ajoutez plus d'informations pour un meilleur CV"
              : completionScore < 80
              ? "Bon début ! Continuez à enrichir votre profil"
              : "Excellent ! Votre CV est presque parfait"}
          </p>
        </div>
      </div>

      {/* Import Modal */}
      <CVImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
      <AISmartFillModal open={isSmartFillOpen} onOpenChange={setIsSmartFillOpen} />

      {/* Sections */}
      <ScrollArea className="flex-1">
        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={setOpenSections}
          className="p-2 sm:p-4"
        >
          {sections.map((section) => (
            <AccordionItem 
              key={section.id} 
              value={section.id} 
              id={`section-${section.id}`}
              className="border-b-0 mb-2"
            >
              <AccordionTrigger className="hover:no-underline p-3 rounded-lg bg-muted/30 hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <section.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{section.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-1">
                <section.component />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default EditorPanel;
