import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3, LayoutGrid, ClipboardCheck, User } from 'lucide-react';
import EditorPanel from './EditorPanel';
import ResumeScorePanel from '@/components/review/ResumeScorePanel';
import TemplateGallery from './TemplateGallery';
import ProfilePanel from './ProfilePanel';
import { useCV } from '@/context/CVContext';

interface EditorTabsProps {
  onNavigateToSection?: (section: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ onNavigateToSection }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const { cvData, completionScore } = useCV();

  // Calculate issues based on CV data
  const issues = [];
  
  if (!cvData.personalInfo.email || !cvData.personalInfo.phone) {
    issues.push({
      id: 'contact',
      type: 'critical' as const,
      title: 'Coordonnées manquantes',
      description: 'Les recruteurs ont besoin d\'un moyen de vous contacter.',
    });
  }
  
  if (!cvData.personalInfo.summary || cvData.personalInfo.summary.length < 100) {
    issues.push({
      id: 'summary',
      type: 'warning' as const,
      title: 'Résumé trop court',
      description: 'Visez au moins 3 phrases pour un bon résumé.',
    });
  }

  if (cvData.experience.length === 0) {
    issues.push({
      id: 'experience',
      type: 'critical' as const,
      title: 'Aucune expérience',
      description: 'Ajoutez au moins une expérience professionnelle.',
    });
  }

  // Calculate quick wins
  const quickWins = [
    {
      id: 'font',
      title: 'Police cohérente',
      completed: true,
    },
    {
      id: 'linkedin',
      title: 'Ajouter URL LinkedIn',
      completed: !!cvData.personalInfo.linkedin,
      action: 'Corriger',
    },
    {
      id: 'photo',
      title: 'Ajouter photo de profil',
      completed: !!cvData.personalInfo.photoUrl,
      action: 'Ajouter',
    },
  ];

  const handleFixIssue = (issueId: string) => {
    setActiveTab('editor');
    // Map issue IDs to section names
    const sectionMap: Record<string, string> = {
      contact: 'personal',
      summary: 'personal',
      experience: 'experience',
    };
    const section = sectionMap[issueId];
    if (section && onNavigateToSection) {
      onNavigateToSection(section);
    }
  };

  const handleQuickWinAction = (quickWinId: string) => {
    setActiveTab('editor');
    const sectionMap: Record<string, string> = {
      linkedin: 'personal',
      photo: 'personal',
    };
    const section = sectionMap[quickWinId];
    if (section && onNavigateToSection) {
      onNavigateToSection(section);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="flex-shrink-0 border-b border-border bg-card">
        <TabsList className="w-full h-12 bg-transparent rounded-none p-0 gap-0">
          <TabsTrigger 
            value="editor" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Éditeur</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Review</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="editor" className="h-full m-0">
          <EditorPanel />
        </TabsContent>

        <TabsContent value="templates" className="h-full m-0">
          <TemplateGallery />
        </TabsContent>

        <TabsContent value="review" className="h-full m-0">
          <ResumeScorePanel 
            score={completionScore}
            issues={issues}
            quickWins={quickWins}
            onFixIssue={handleFixIssue}
            onQuickWinAction={handleQuickWinAction}
          />
        </TabsContent>

        <TabsContent value="profile" className="h-full m-0">
          <ProfilePanel />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EditorTabs;
