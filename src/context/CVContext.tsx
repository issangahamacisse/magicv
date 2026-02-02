import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CVData, defaultCVData, Experience, Education, Skill, Language, Project, Certification } from '@/types/cv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface ImportedCVData {
  personalInfo?: Partial<CVData['personalInfo']>;
  experience?: CVData['experience'];
  education?: CVData['education'];
  skills?: CVData['skills'];
  languages?: CVData['languages'];
  projects?: CVData['projects'];
  certifications?: CVData['certifications'];
}

interface CVContextType {
  cvData: CVData;
  updatePersonalInfo: (field: string, value: string) => void;
  updateTheme: (field: string, value: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: string, value: string | boolean) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, field: string, value: string) => void;
  removeSkill: (id: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: string, value: string) => void;
  removeLanguage: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, field: string, value: string | string[]) => void;
  removeProject: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, field: string, value: string) => void;
  removeCertification: (id: string) => void;
  reorderSections: (sections: CVData['sections']) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  completionScore: number;
  isSaving: boolean;
  isCloudSynced: boolean;
  resetCV: () => void;
  loadCV: (resumeId: string) => Promise<void>;
  currentResumeId: string | null;
  importCVData: (data: ImportedCVData) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cvData, setCVData] = useState<CVData>(() => {
    const saved = localStorage.getItem('cvData');
    return saved ? JSON.parse(saved) : defaultCVData;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const cloudSyncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncedRef = useRef<string>('');

  // Load latest resume from cloud on login
  useEffect(() => {
    if (user) {
      loadLatestResume();
    } else {
      setCurrentResumeId(null);
      setIsCloudSynced(false);
    }
  }, [user]);

  const loadLatestResume = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('resumes')
      .select('id, content, theme_config')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error loading resume:', error);
      return;
    }

    if (data) {
      setCurrentResumeId(data.id);
      const content = data.content as Record<string, unknown>;
      const themeConfig = data.theme_config as Record<string, unknown>;
      
      const loadedData = {
        ...content,
        theme: themeConfig,
      } as unknown as CVData;
      
      lastSyncedRef.current = JSON.stringify(loadedData);
      setCVData(loadedData);
      setIsCloudSynced(true);
    }
  };

  const loadCV = async (resumeId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('resumes')
      .select('id, content, theme_config')
      .eq('id', resumeId)
      .single();

    if (error) {
      toast.error('Erreur lors du chargement du CV');
      return;
    }

    if (data) {
      setCurrentResumeId(data.id);
      const content = data.content as Record<string, unknown>;
      const themeConfig = data.theme_config as Record<string, unknown>;
      
      const loadedData = {
        ...content,
        theme: themeConfig,
      } as unknown as CVData;
      
      lastSyncedRef.current = JSON.stringify(loadedData);
      setCVData(loadedData);
      localStorage.setItem('cvData', JSON.stringify(loadedData));
      toast.success('CV chargé');
    }
  };

  const resetCV = useCallback(() => {
    setCVData(defaultCVData);
    setCurrentResumeId(null);
    lastSyncedRef.current = '';
    localStorage.setItem('cvData', JSON.stringify(defaultCVData));
    toast.success('Nouveau CV créé');
  }, []);

  // Sync to cloud for logged-in users
  const syncToCloud = useCallback(async (data: CVData) => {
    if (!user) return;

    setIsSaving(true);

    const { theme, ...content } = data;
    const title = data.personalInfo.fullName 
      ? `CV - ${data.personalInfo.fullName}`
      : 'Mon CV';

    const contentJson = JSON.parse(JSON.stringify(content)) as Json;
    const themeJson = JSON.parse(JSON.stringify(theme)) as Json;

    try {
      if (currentResumeId) {
        const { error } = await supabase
          .from('resumes')
          .update({
            title,
            content: contentJson,
            theme_config: themeJson,
          })
          .eq('id', currentResumeId);

        if (error) throw error;
      } else {
        const { data: newResume, error } = await supabase
          .from('resumes')
          .insert([{
            user_id: user.id,
            title,
            content: contentJson,
            theme_config: themeJson,
          }])
          .select('id')
          .single();

        if (error) throw error;
        if (newResume) {
          setCurrentResumeId(newResume.id);
        }
      }

      lastSyncedRef.current = JSON.stringify(data);
      setIsCloudSynced(true);
    } catch (error) {
      console.error('Sync error:', error);
      setIsCloudSynced(false);
    } finally {
      setIsSaving(false);
    }
  }, [user, currentResumeId]);

  // Auto-save with requestIdleCallback for smooth typing
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const saveData = () => {
        setIsSaving(true);
        localStorage.setItem('cvData', JSON.stringify(cvData));
        requestAnimationFrame(() => {
          setTimeout(() => setIsSaving(false), 300);
        });
      };

      if ('requestIdleCallback' in window) {
        (window as Window).requestIdleCallback(saveData, { timeout: 500 });
      } else {
        saveData();
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cvData]);

  // Cloud sync (debounced)
  useEffect(() => {
    if (!user) return;

    const dataString = JSON.stringify(cvData);
    if (dataString === lastSyncedRef.current) return;

    if (cloudSyncTimeoutRef.current) {
      clearTimeout(cloudSyncTimeoutRef.current);
    }

    cloudSyncTimeoutRef.current = setTimeout(() => {
      syncToCloud(cvData);
    }, 2000);

    return () => {
      if (cloudSyncTimeoutRef.current) {
        clearTimeout(cloudSyncTimeoutRef.current);
      }
    };
  }, [cvData, user, syncToCloud]);

  // Calculate completion score
  const completionScore = useCallback(() => {
    let score = 0;
    const weights = {
      fullName: 10,
      jobTitle: 10,
      email: 10,
      phone: 5,
      location: 5,
      summary: 15,
      experience: 20,
      education: 15,
      skills: 10,
    };

    if (cvData.personalInfo.fullName) score += weights.fullName;
    if (cvData.personalInfo.jobTitle) score += weights.jobTitle;
    if (cvData.personalInfo.email) score += weights.email;
    if (cvData.personalInfo.phone) score += weights.phone;
    if (cvData.personalInfo.location) score += weights.location;
    if (cvData.personalInfo.summary && cvData.personalInfo.summary.length > 50) score += weights.summary;
    if (cvData.experience.length > 0) score += weights.experience;
    if (cvData.education.length > 0) score += weights.education;
    if (cvData.skills.length >= 3) score += weights.skills;

    return score;
  }, [cvData])();

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  }, []);

  const updateTheme = useCallback((field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setCVData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: string | boolean) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setCVData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  }, []);

  // Skills
  const addSkill = useCallback(() => {
    const newSkill: Skill = {
      id: generateId(),
      name: '',
      level: 'intermediate',
    };
    setCVData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  }, []);

  const updateSkill = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  }, []);

  // Languages
  const addLanguage = useCallback(() => {
    const newLang: Language = {
      id: generateId(),
      name: '',
      level: 'conversational',
    };
    setCVData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
  }, []);

  const updateLanguage = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      technologies: [],
    };
    setCVData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  }, []);

  const updateProject = useCallback((id: string, field: string, value: string | string[]) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  }, []);

  // Certifications
  const addCertification = useCallback(() => {
    const newCert: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
    };
    setCVData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  }, []);

  const updateCertification = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id),
    }));
  }, []);

  // Sections
  const reorderSections = useCallback((sections: CVData['sections']) => {
    setCVData(prev => ({ ...prev, sections }));
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setCVData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      ),
    }));
  }, []);

  // Import CV data from parsed file and mark as AI-imported
  const importCVData = useCallback(async (data: ImportedCVData) => {
    setCVData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...data.personalInfo,
      },
      experience: data.experience?.length ? data.experience : prev.experience,
      education: data.education?.length ? data.education : prev.education,
      skills: data.skills?.length ? data.skills : prev.skills,
      languages: data.languages?.length ? data.languages : prev.languages,
      projects: data.projects?.length ? data.projects : prev.projects,
      certifications: data.certifications?.length ? data.certifications : prev.certifications,
    }));

    // Mark the resume as having used AI import (requires payment for download)
    if (user && currentResumeId) {
      await supabase
        .from('resumes')
        .update({ used_ai_import: true } as Record<string, unknown>)
        .eq('id', currentResumeId);
    }

    toast.success('Données importées avec succès !');
  }, [user, currentResumeId]);

  return (
    <CVContext.Provider
      value={{
        cvData,
        updatePersonalInfo,
        updateTheme,
        addExperience,
        updateExperience,
        removeExperience,
        addEducation,
        updateEducation,
        removeEducation,
        addSkill,
        updateSkill,
        removeSkill,
        addLanguage,
        updateLanguage,
        removeLanguage,
        addProject,
        updateProject,
        removeProject,
        addCertification,
        updateCertification,
        removeCertification,
        reorderSections,
        toggleSectionVisibility,
        completionScore,
        isSaving,
        isCloudSynced,
        resetCV,
        loadCV,
        currentResumeId,
        importCVData,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
