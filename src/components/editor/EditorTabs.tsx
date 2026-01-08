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

  // Calculate detailed score based on CV data
  const calculateDetailedScore = () => {
    let score = 0;
    
    // Personal info (35 pts)
    if (cvData.personalInfo.fullName) score += 5;
    if (cvData.personalInfo.jobTitle) score += 5;
    if (cvData.personalInfo.email) score += 10;
    if (cvData.personalInfo.phone) score += 10;
    if (cvData.personalInfo.location) score += 5;
    
    // Summary (15 pts)
    if (cvData.personalInfo.summary) {
      if (cvData.personalInfo.summary.length >= 150) score += 15;
      else if (cvData.personalInfo.summary.length >= 100) score += 10;
      else if (cvData.personalInfo.summary.length >= 50) score += 5;
    }
    
    // Experience (20 pts)
    if (cvData.experience.length >= 3) score += 20;
    else if (cvData.experience.length >= 2) score += 15;
    else if (cvData.experience.length >= 1) score += 10;
    
    // Education (10 pts)
    if (cvData.education.length >= 1) score += 10;
    
    // Skills (10 pts)
    if (cvData.skills.length >= 5) score += 10;
    else if (cvData.skills.length >= 3) score += 7;
    else if (cvData.skills.length >= 1) score += 3;
    
    // Languages (5 pts)
    if (cvData.languages.length >= 2) score += 5;
    else if (cvData.languages.length >= 1) score += 3;
    
    // Bonus points (5 pts)
    if (cvData.personalInfo.linkedin) score += 2;
    if (cvData.personalInfo.photoUrl) score += 2;
    if (cvData.projects.length >= 1) score += 1;
    
    return Math.min(score, 100);
  };

  const dynamicScore = calculateDetailedScore();

  // Calculate issues based on CV data
  const issues = [];
  
  if (!cvData.personalInfo.email) {
    issues.push({
      id: 'email',
      type: 'critical' as const,
      title: 'Email manquant',
      description: 'L\'email est essentiel pour être contacté par les recruteurs.',
    });
  }
  
  if (!cvData.personalInfo.phone) {
    issues.push({
      id: 'phone',
      type: 'critical' as const,
      title: 'Téléphone manquant',
      description: 'Ajoutez votre numéro pour faciliter le contact.',
    });
  }
  
  if (!cvData.personalInfo.summary || cvData.personalInfo.summary.length < 100) {
    issues.push({
      id: 'summary',
      type: 'warning' as const,
      title: 'Résumé trop court',
      description: 'Visez au moins 3 phrases percutantes.',
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

  if (cvData.education.length === 0) {
    issues.push({
      id: 'education',
      type: 'warning' as const,
      title: 'Aucune formation',
      description: 'Mentionnez vos diplômes et formations.',
    });
  }

  if (cvData.skills.length < 3) {
    issues.push({
      id: 'skills',
      type: 'warning' as const,
      title: 'Peu de compétences',
      description: 'Ajoutez au moins 3-5 compétences clés.',
    });
  }

  // Calculate quick wins
  const quickWins = [
    {
      id: 'photo',
      title: 'Ajouter photo de profil',
      completed: !!cvData.personalInfo.photoUrl,
      action: 'Ajouter',
    },
    {
      id: 'linkedin',
      title: 'Ajouter URL LinkedIn',
      completed: !!cvData.personalInfo.linkedin,
      action: 'Ajouter',
    },
    {
      id: 'languages',
      title: 'Ajouter des langues',
      completed: cvData.languages.length >= 1,
      action: 'Ajouter',
    },
    {
      id: 'projects',
      title: 'Ajouter des projets',
      completed: cvData.projects.length >= 1,
      action: 'Ajouter',
    },
  ];

  const handleFixIssue = (issueId: string) => {
    setActiveTab('editor');
    const sectionMap: Record<string, string> = {
      email: 'personal',
      phone: 'personal',
      summary: 'personal',
      experience: 'experience',
      education: 'education',
      skills: 'skills',
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
      languages: 'languages',
      projects: 'projects',
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
            score={dynamicScore}
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
