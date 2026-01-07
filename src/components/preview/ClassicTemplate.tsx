import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { cn } from '@/lib/utils';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const ClassicTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
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
      <header className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
        <h1 
          className="font-bold text-cv-text"
          style={{ fontSize: layout.headerFontSize, marginBottom: '4px' }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="text-cv-muted"
          style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
        >
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
        
        <div className="text-cv-muted space-y-0.5">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
          {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <h2 
            className="font-bold uppercase tracking-wider text-cv-text pb-1 border-b border-cv-border"
            style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
          >
            Profil
          </h2>
          <p className="text-cv-muted">{personalInfo.summary}</p>
        </section>
      )}

      {/* Main Content - grows to fill */}
      <main className="flex-grow flex flex-col" style={{ gap: layout.sectionMargin }}>
        {/* Experience */}
        {experience.length > 0 && (
          <section className="flex-grow">
            <h2 
              className="font-bold uppercase tracking-wider text-cv-text pb-1 border-b border-cv-border"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Expérience Professionnelle
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="mb-1">
                    <h3 className="font-semibold text-cv-text">{exp.position}</h3>
                    <p className="text-cv-muted">
                      {exp.company}{exp.location && `, ${exp.location}`}
                    </p>
                    <p className="text-cv-muted italic" style={{ fontSize: '10px' }}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-cv-muted whitespace-pre-line mt-1">{exp.description}</p>
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
              className="font-bold uppercase tracking-wider text-cv-text pb-1 border-b border-cv-border"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Formation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold text-cv-text">
                    {edu.degree} {edu.field && `- ${edu.field}`}
                  </h3>
                  <p className="text-cv-muted">{edu.institution}</p>
                  <p className="text-cv-muted italic" style={{ fontSize: '10px' }}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                  {edu.description && (
                    <p className="text-cv-muted mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer - Skills & Languages */}
      <footer 
        className="flex-shrink-0 grid grid-cols-2 mt-auto"
        style={{ gap: layout.sectionMargin, paddingTop: layout.sectionMargin }}
      >
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 
              className="font-bold uppercase tracking-wider text-cv-text pb-1 border-b border-cv-border"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Compétences
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skills.map((skill) => (
                <li key={skill.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cv-text" />
                  <span>{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 
              className="font-bold uppercase tracking-wider text-cv-text pb-1 border-b border-cv-border"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Langues
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {languages.map((lang) => (
                <li key={lang.id}>
                  {lang.name} -{' '}
                  <span className="text-cv-muted">
                    {lang.level === 'native' ? 'Langue maternelle' : 
                     lang.level === 'fluent' ? 'Bilingue' :
                     lang.level === 'professional' ? 'Professionnel' :
                     lang.level === 'conversational' ? 'Courant' : 'Notions'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </footer>
    </div>
  );
});

ClassicTemplate.displayName = 'ClassicTemplate';

export default ClassicTemplate;
