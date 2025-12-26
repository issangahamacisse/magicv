import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3, LayoutGrid, ClipboardCheck, User } from 'lucide-react';
import EditorPanel from './EditorPanel';
import ResumeScorePanel from '@/components/review/ResumeScorePanel';
import { useCV } from '@/context/CVContext';

const EditorTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const { cvData, completionScore } = useCV();

  // Calculate issues based on CV data
  const issues = [];
  
  if (!cvData.personalInfo.email || !cvData.personalInfo.phone) {
    issues.push({
      id: '1',
      type: 'critical' as const,
      title: 'Coordonnées manquantes',
      description: 'Les recruteurs ont besoin d\'un moyen de vous contacter.',
    });
  }
  
  if (!cvData.personalInfo.summary || cvData.personalInfo.summary.length < 100) {
    issues.push({
      id: '2',
      type: 'warning' as const,
      title: 'Résumé trop court',
      description: 'Visez au moins 3 phrases pour un bon résumé.',
    });
  }

  if (cvData.experience.length === 0) {
    issues.push({
      id: '3',
      type: 'critical' as const,
      title: 'Aucune expérience',
      description: 'Ajoutez au moins une expérience professionnelle.',
    });
  }

  // Calculate quick wins
  const quickWins = [
    {
      id: '1',
      title: 'Police cohérente',
      completed: true,
    },
    {
      id: '2',
      title: 'Ajouter URL LinkedIn',
      completed: !!cvData.personalInfo.linkedin,
      action: 'Corriger',
    },
    {
      id: '3',
      title: 'Ajouter photo de profil',
      completed: !!cvData.personalInfo.photoUrl,
      action: 'Ajouter',
    },
  ];

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

        <TabsContent value="templates" className="h-full m-0 p-4">
          <div className="text-center text-muted-foreground py-8">
            Les templates sont disponibles dans l'onglet Apparence de l'éditeur.
          </div>
        </TabsContent>

        <TabsContent value="review" className="h-full m-0">
          <ResumeScorePanel 
            score={completionScore}
            issues={issues}
            quickWins={quickWins}
          />
        </TabsContent>

        <TabsContent value="profile" className="h-full m-0 p-4">
          <div className="text-center text-muted-foreground py-8">
            Connectez-vous pour accéder à votre profil.
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EditorTabs;
