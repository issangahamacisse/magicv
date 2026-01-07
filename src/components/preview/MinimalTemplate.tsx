import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { cn } from '@/lib/utils';

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

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full p-8 bg-white text-gray-900",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        spacingClass
      )}
    >
      {/* Header - Ultra minimal */}
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight mb-1">
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-lg text-gray-500 font-light">
          {personalInfo.jobTitle || 'Votre Titre'}
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-[9px] text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
            Expérience
          </h2>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium">{exp.position}</h3>
                  <span className="text-[8px] text-gray-400">
                    {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-gray-500 text-[9px]">{exp.company}</p>
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
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
            Formation
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <span className="text-[8px] text-gray-400">
                    {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                  </span>
                </div>
                <p className="text-gray-500 text-[9px]">{edu.institution}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Languages - Inline */}
      <div className="flex gap-12">
        {skills.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 text-[8px] rounded"
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
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
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
      </div>
    </div>
  );
});

MinimalTemplate.displayName = 'MinimalTemplate';

export default MinimalTemplate;
