import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';

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

const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-cv-paper text-cv-text flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ 
        padding: layout.contentPadding,
        fontSize: layout.bodyFontSize
      }}
    >
      {/* Header */}
      <header 
        className="flex-shrink-0 text-center border-b-2"
        style={{ borderColor: accentColor, paddingBottom: layout.itemMargin, marginBottom: layout.sectionMargin }}
      >
        <h1 
          className="font-bold"
          style={{ color: accentColor, fontSize: layout.headerFontSize, marginBottom: '4px' }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="font-medium text-cv-muted"
          style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
        >
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
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
        <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <p className="text-cv-muted leading-relaxed text-center">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-3 flex-grow" style={{ gap: layout.sectionMargin }}>
        {/* Main Column */}
        <div className="col-span-2 flex flex-col" style={{ gap: layout.sectionMargin }}>
          {/* Experience */}
          {experience.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-bold uppercase tracking-wider border-b"
                style={{ 
                  color: accentColor, 
                  borderColor: accentColor,
                  fontSize: layout.titleFontSize,
                  marginBottom: layout.itemMargin,
                  paddingBottom: '4px'
                }}
              >
                Expérience Professionnelle
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-cv-muted">{exp.company}{exp.location && ` · ${exp.location}`}</p>
                      </div>
                      <span className="text-cv-muted whitespace-nowrap" style={{ fontSize: '10px' }}>
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
                className="font-bold uppercase tracking-wider border-b"
                style={{ 
                  color: accentColor, 
                  borderColor: accentColor,
                  fontSize: layout.titleFontSize,
                  marginBottom: layout.itemMargin,
                  paddingBottom: '4px'
                }}
              >
                Formation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold">{edu.degree} {edu.field && `en ${edu.field}`}</h3>
                        <p className="text-cv-muted">{edu.institution}</p>
                      </div>
                      <span className="text-cv-muted whitespace-nowrap" style={{ fontSize: '10px' }}>
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
        <div className="flex flex-col" style={{ gap: layout.sectionMargin }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-bold uppercase tracking-wider border-b"
                style={{ 
                  color: accentColor, 
                  borderColor: accentColor,
                  fontSize: layout.titleFontSize,
                  marginBottom: layout.itemMargin,
                  paddingBottom: '4px'
                }}
              >
                Compétences
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1">
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
                className="font-bold uppercase tracking-wider border-b"
                style={{ 
                  color: accentColor, 
                  borderColor: accentColor,
                  fontSize: layout.titleFontSize,
                  marginBottom: layout.itemMargin,
                  paddingBottom: '4px'
                }}
              >
                Langues
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
});

ModernTemplate.displayName = 'ModernTemplate';

export default ModernTemplate;
