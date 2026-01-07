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
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-white text-gray-900 flex flex-col",
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
          className="font-light tracking-tight"
          style={{ fontSize: layout.headerFontSize, marginBottom: '4px' }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="text-gray-500 font-light"
          style={{ fontSize: layout.titleFontSize }}
        >
          {personalInfo.jobTitle || 'Votre Titre'}
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Main Content - grows to fill space */}
      <main className="flex-grow flex flex-col" style={{ gap: layout.sectionMargin }}>
        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 
              className="font-semibold uppercase tracking-[0.2em] text-gray-400"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Expérience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {experience.map((exp) => (
                <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{exp.position}</h3>
                    <span className="text-gray-400" style={{ fontSize: '10px' }}>
                      {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-600 mt-2 whitespace-pre-line">{exp.description}</p>
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
              className="font-semibold uppercase tracking-[0.2em] text-gray-400"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Formation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {education.map((edu) => (
                <div key={edu.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{edu.degree}</h3>
                    <span className="text-gray-400" style={{ fontSize: '10px' }}>
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Skills & Languages - fixed at bottom */}
      <footer className="flex-shrink-0 mt-auto" style={{ paddingTop: layout.sectionMargin, gap: layout.sectionMargin, display: 'flex' }}>
        {skills.length > 0 && (
          <section className="flex-1">
            <h2 
              className="font-semibold uppercase tracking-[0.2em] text-gray-400"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${accentColor}15`,
                    color: accentColor 
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="flex-1">
            <h2 
              className="font-semibold uppercase tracking-[0.2em] text-gray-400"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Langues
            </h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span key={lang.id} className="text-gray-600">
                  {lang.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </footer>
    </div>
  );
});

MinimalTemplate.displayName = 'MinimalTemplate';

export default MinimalTemplate;
