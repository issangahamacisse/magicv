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
        "w-full h-full p-8 bg-white text-gray-900",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        layout.fontSize,
        layout.containerClass
      )}
    >
      {/* Header - Ultra minimal */}
      <header className={cn(layout.shouldDistribute ? "mb-auto" : "mb-8")}>
        <h1 className={cn("font-light tracking-tight mb-1", layout.headerSize)}>
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className={cn("text-gray-500 font-light", layout.titleSize)}>
          {personalInfo.jobTitle || 'Votre Titre'}
        </p>
        
        <div className={cn("flex flex-wrap gap-4 mt-4 text-gray-600", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className={cn(layout.shouldDistribute ? "my-auto" : "mb-8")}>
          <p className={cn("text-gray-600 leading-relaxed max-w-2xl", layout.contentDensity === 'sparse' && 'text-[13px]')}>
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Main Content */}
      <div className={cn("flex-grow", layout.sectionGap, layout.shouldDistribute && "flex flex-col justify-center")}>
        {/* Experience */}
        {experience.length > 0 && (
          <section className={cn(layout.shouldDistribute ? "" : "mb-8")}>
            <h2 className={cn("font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4", layout.subtitleSize)}>
              Expérience
            </h2>
            <div className={cn("space-y-5", layout.contentDensity === 'dense' && "space-y-3")}>
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
          <section className={cn(layout.shouldDistribute ? "" : "mb-8")}>
            <h2 className={cn("font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4", layout.subtitleSize)}>
              Formation
            </h2>
            <div className={cn("space-y-3", layout.contentDensity === 'dense' && "space-y-2")}>
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
      </div>

      {/* Skills & Languages - Inline */}
      <div className={cn("flex", layout.sectionGap, layout.shouldDistribute ? "mt-auto gap-12" : "gap-12")}>
        {skills.length > 0 && (
          <section>
            <h2 className={cn("font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3", layout.subtitleSize)}>
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id}
                  className={cn("px-2 py-1 rounded", layout.contentDensity === 'sparse' ? 'text-[9px]' : 'text-[8px]')}
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
            <h2 className={cn("font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3", layout.subtitleSize)}>
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
