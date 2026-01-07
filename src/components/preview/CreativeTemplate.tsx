import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const skillLevelDots: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const CreativeTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full flex bg-cv-paper text-cv-text",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        spacingClass
      )}
    >
      {/* Sidebar */}
      <div 
        className="w-[35%] p-5 text-primary-foreground"
        style={{ backgroundColor: accentColor }}
      >
        {/* Profile Photo Placeholder */}
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-primary-foreground/60">
            {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        {/* Name */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold mb-1">
            {personalInfo.fullName || 'Votre Nom'}
          </h1>
          <p className="text-sm opacity-90">
            {personalInfo.jobTitle || 'Votre Titre'}
          </p>
        </div>

        {/* Contact */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
            Contact
          </h2>
          <div className="space-y-2 text-[9px]">
            {personalInfo.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3 opacity-80" />
                <span className="break-all">{personalInfo.email}</span>
              </p>
            )}
            {personalInfo.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3 opacity-80" />
                {personalInfo.phone}
              </p>
            )}
            {personalInfo.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3 opacity-80" />
                {personalInfo.location}
              </p>
            )}
            {personalInfo.linkedin && (
              <p className="flex items-center gap-2">
                <Linkedin className="h-3 w-3 opacity-80" />
                <span className="break-all">{personalInfo.linkedin}</span>
              </p>
            )}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
              Compétences
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <p className="text-[9px] mb-1">{skill.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          dot <= skillLevelDots[skill.level]
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
              Langues
            </h2>
            <div className="space-y-1.5 text-[9px]">
              {languages.map((lang) => (
                <p key={lang.id} className="flex justify-between">
                  <span>{lang.name}</span>
                  <span className="opacity-80">
                    {lang.level === 'native' ? 'Natif' : 
                     lang.level === 'fluent' ? 'Bilingue' :
                     lang.level === 'professional' ? 'Pro' :
                     lang.level === 'conversational' ? 'Courant' : 'Notions'}
                  </span>
                </p>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-5">
            <h2 
              className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              À propos
            </h2>
            <p className="text-cv-muted">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-5">
            <h2 
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Expérience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="mb-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-cv-muted">{exp.company}</p>
                    <p className="text-[8px] text-cv-muted">
                      {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                    </p>
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
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Formation
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <h3 className="font-semibold">{edu.degree} {edu.field && `- ${edu.field}`}</h3>
                  <p className="text-cv-muted">{edu.institution}</p>
                  <p className="text-[8px] text-cv-muted">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

CreativeTemplate.displayName = 'CreativeTemplate';

export default CreativeTemplate;
