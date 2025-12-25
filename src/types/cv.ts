export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  summary: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
  id: string;
  name: string;
  level: 'basic' | 'conversational' | 'professional' | 'fluent' | 'native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface CVSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications';
  visible: boolean;
  order: number;
}

export interface CVTheme {
  template: 'modern' | 'classic' | 'creative';
  accentColor: string;
  fontFamily: 'sans' | 'serif';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface CVData {
  id?: string;
  title: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  sections: CVSection[];
  theme: CVTheme;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultCVData: CVData = {
  title: 'Mon CV',
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  sections: [
    { id: 'personal', type: 'personal', visible: true, order: 0 },
    { id: 'experience', type: 'experience', visible: true, order: 1 },
    { id: 'education', type: 'education', visible: true, order: 2 },
    { id: 'skills', type: 'skills', visible: true, order: 3 },
    { id: 'languages', type: 'languages', visible: true, order: 4 },
    { id: 'projects', type: 'projects', visible: false, order: 5 },
    { id: 'certifications', type: 'certifications', visible: false, order: 6 },
  ],
  theme: {
    template: 'modern',
    accentColor: '#4f46e5',
    fontFamily: 'sans',
    spacing: 'normal',
  },
};
