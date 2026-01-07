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

const ExecutiveTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-white text-gray-800 p-8",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        layout.fontSize,
        layout.containerClass
      )}
    >
      {/* Executive Header - Luxe style */}
      <header className={cn("text-center border-b-2 border-gray-200", layout.shouldDistribute ? "pb-8 mb-auto" : "pb-6 mb-8")}>
        <h1 className={cn("font-light tracking-[0.2em] uppercase mb-2", layout.headerSize)} style={{ color: accentColor }}>
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className={cn("font-light tracking-[0.15em] uppercase text-gray-500 mb-4", layout.titleSize)}>
          {personalInfo.jobTitle || 'Titre Professionnel'}
        </p>
        
        <div className={cn("flex items-center justify-center gap-6 text-gray-500", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.location && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{personalInfo.location}</span>
            </>
          )}
        </div>
      </header>

      {/* Summary with elegant styling */}
      {personalInfo.summary && (
        <section className={cn("text-center max-w-2xl mx-auto", layout.shouldDistribute ? "my-auto" : "mb-8")}>
          <p className="text-gray-600 leading-relaxed font-light italic">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Two column layout */}
      <div className={cn("grid grid-cols-3", layout.sectionGap, layout.shouldDistribute ? "flex-grow" : "")}>
        {/* Main Column */}
        <div className={cn("col-span-2 flex flex-col", layout.itemGap)}>
          {/* Experience */}
          {experience.length > 0 && (
            <section className="flex-grow">
              <h2 
                className={cn("font-light uppercase tracking-[0.25em] mb-5 pb-2", layout.subtitleSize)}
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Expérience Professionnelle
              </h2>
              <div className={cn("space-y-6", layout.contentDensity === 'dense' && "space-y-4")}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="mb-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-900">{exp.position}</h3>
                        <span className="text-[8px] text-gray-400 italic">
                          {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: accentColor }}>
                        {exp.company}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 whitespace-pre-line pl-0">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className={cn(layout.shouldDistribute ? "" : "mt-4")}>
              <h2 
                className={cn("font-light uppercase tracking-[0.25em] mb-5 pb-2", layout.subtitleSize)}
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Formation
              </h2>
              <div className={cn("space-y-4", layout.contentDensity === 'dense' && "space-y-3")}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <span className="text-[8px] text-gray-400 italic">
                        {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: accentColor }}>
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className={cn("border-l border-gray-200 pl-6 flex flex-col", layout.itemGap)}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="flex-grow">
              <h2 
                className={cn("font-light uppercase tracking-[0.25em] mb-4 pb-2", layout.subtitleSize)}
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Expertise
              </h2>
              <div className={cn("space-y-2", layout.contentDensity === 'sparse' && "space-y-3")}>
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-gray-700">{skill.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section className={cn(layout.shouldDistribute ? "" : "mt-4")}>
              <h2 
                className={cn("font-light uppercase tracking-[0.25em] mb-4 pb-2", layout.subtitleSize)}
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Langues
              </h2>
              <div className={cn("space-y-2", layout.contentDensity === 'sparse' && "space-y-3")}>
                {languages.map((lang) => (
                  <div key={lang.id}>
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-400 text-[9px] ml-2 capitalize">
                      ({lang.level === 'native' ? 'Natif' : 
                        lang.level === 'fluent' ? 'Bilingue' :
                        lang.level === 'professional' ? 'Professionnel' :
                        lang.level === 'conversational' ? 'Courant' : 'Notions'})
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

ExecutiveTemplate.displayName = 'ExecutiveTemplate';

export default ExecutiveTemplate;
