import React from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const skillLevelWidth: Record<string, string> = {
  beginner: '25%',
  intermediate: '50%',
  advanced: '75%',
  expert: '100%',
};

const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full p-6 bg-cv-paper text-cv-text",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Header */}
      <header className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-base font-medium text-cv-muted mb-3">
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-[9px]">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" style={{ color: accentColor }} />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" style={{ color: accentColor }} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" style={{ color: accentColor }} />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="h-3 w-3" style={{ color: accentColor }} />
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <p className="text-cv-muted leading-relaxed text-center">
            {personalInfo.summary}
          </p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Main Column */}
        <div className="col-span-2 space-y-5">
          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 
                className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                Expérience Professionnelle
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-cv-muted">{exp.company}{exp.location && ` · ${exp.location}`}</p>
                      </div>
                      <span className="text-[8px] text-cv-muted whitespace-nowrap">
                        {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-cv-muted whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 
                className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                Formation
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold">{edu.degree} {edu.field && `en ${edu.field}`}</h3>
                        <p className="text-cv-muted">{edu.institution}</p>
                      </div>
                      <span className="text-[8px] text-cv-muted whitespace-nowrap">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    {edu.description && (
                      <p className="text-cv-muted">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 
                className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                Compétences
              </h2>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span>{skill.name}</span>
                    </div>
                    <div className="h-1.5 bg-cv-border rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: skillLevelWidth[skill.level],
                          backgroundColor: accentColor 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h2 
                className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                Langues
              </h2>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span>{lang.name}</span>
                    <span className="text-cv-muted capitalize">
                      {lang.level === 'native' ? 'Natif' : 
                       lang.level === 'fluent' ? 'Bilingue' :
                       lang.level === 'professional' ? 'Pro' :
                       lang.level === 'conversational' ? 'Courant' : 'Notions'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
