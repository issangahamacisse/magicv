import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CVData, defaultCVData, Experience, Education, Skill, Language, Project, Certification } from '@/types/cv';
import { toast } from 'sonner';

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
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cvData, setCVData] = useState<CVData>(() => {
    const saved = localStorage.getItem('cvData');
    return saved ? JSON.parse(saved) : defaultCVData;
  });
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem('cvData', JSON.stringify(cvData));
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cvData]);

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
