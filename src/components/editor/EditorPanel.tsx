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
} from 'lucide-react';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import ThemeSelector from './ThemeSelector';

interface EditorPanelProps {
  openSection?: string;
  onSectionOpened?: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ openSection, onSectionOpened }) => {
  const { completionScore, isSaving, isCloudSynced } = useCV();
  const [openSections, setOpenSections] = useState<string[]>(['personal']);

  const sections = [
    { id: 'personal', icon: User, label: 'Informations personnelles', component: PersonalInfoForm },
    { id: 'experience', icon: Briefcase, label: 'Expérience', component: ExperienceForm },
    { id: 'education', icon: GraduationCap, label: 'Formation', component: EducationForm },
    { id: 'skills', icon: Lightbulb, label: 'Compétences', component: SkillsForm },
    { id: 'languages', icon: Languages, label: 'Langues', component: LanguagesForm },
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
      <div className="flex-shrink-0 p-4 border-b border-border bg-gradient-to-b from-background to-card">
        <div className="flex items-center justify-between mb-3">
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

      {/* Sections */}
      <ScrollArea className="flex-1">
        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={setOpenSections}
          className="p-4"
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
