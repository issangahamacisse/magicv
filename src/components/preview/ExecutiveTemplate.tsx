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
        "w-full h-full bg-white text-gray-800 flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ 
        padding: layout.contentPadding,
        fontSize: layout.bodyFontSize
      }}
    >
      {/* Executive Header - Luxe style */}
      <header 
        className="flex-shrink-0 text-center border-b-2 border-gray-200"
        style={{ paddingBottom: layout.sectionMargin, marginBottom: layout.sectionMargin }}
      >
        <h1 
          className="font-light tracking-[0.2em] uppercase"
          style={{ color: accentColor, fontSize: layout.headerFontSize, marginBottom: '8px' }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="font-light tracking-[0.15em] uppercase text-gray-500"
          style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
        >
          {personalInfo.jobTitle || 'Titre Professionnel'}
        </p>
        
        <div className="flex items-center justify-center gap-6 text-gray-500">
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
        <section 
          className="flex-shrink-0 text-center max-w-2xl mx-auto"
          style={{ marginBottom: layout.sectionMargin }}
        >
          <p className="text-gray-600 leading-relaxed font-light italic">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-3 flex-grow" style={{ gap: layout.sectionMargin }}>
        {/* Main Column */}
        <div className="col-span-2 flex flex-col" style={{ gap: layout.sectionMargin }}>
          {/* Experience */}
          {experience.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-light uppercase tracking-[0.25em]"
                style={{ 
                  color: accentColor, 
                  borderBottom: `1px solid ${accentColor}`,
                  fontSize: layout.titleFontSize,
                  paddingBottom: '8px',
                  marginBottom: layout.itemMargin
                }}
              >
                Expérience Professionnelle
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="mb-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-900">{exp.position}</h3>
                        <span className="text-gray-400 italic" style={{ fontSize: '10px' }}>
                          {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <p className="uppercase tracking-wider" style={{ color: accentColor, fontSize: '11px' }}>
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
            <section className="flex-shrink-0">
              <h2 
                className="font-light uppercase tracking-[0.25em]"
                style={{ 
                  color: accentColor, 
                  borderBottom: `1px solid ${accentColor}`,
                  fontSize: layout.titleFontSize,
                  paddingBottom: '8px',
                  marginBottom: layout.itemMargin
                }}
              >
                Formation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <span className="text-gray-400 italic" style={{ fontSize: '10px' }}>
                        {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <p className="uppercase tracking-wider" style={{ color: accentColor, fontSize: '11px' }}>
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="border-l border-gray-200 flex flex-col" style={{ paddingLeft: layout.itemMargin, gap: layout.sectionMargin }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-light uppercase tracking-[0.25em]"
                style={{ 
                  color: accentColor, 
                  borderBottom: `1px solid ${accentColor}`,
                  fontSize: layout.titleFontSize,
                  paddingBottom: '8px',
                  marginBottom: layout.itemMargin
                }}
              >
                Expertise
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
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
            <section className="flex-shrink-0">
              <h2 
                className="font-light uppercase tracking-[0.25em]"
                style={{ 
                  color: accentColor, 
                  borderBottom: `1px solid ${accentColor}`,
                  fontSize: layout.titleFontSize,
                  paddingBottom: '8px',
                  marginBottom: layout.itemMargin
                }}
              >
                Langues
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {languages.map((lang) => (
                  <div key={lang.id}>
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-400 ml-2 capitalize" style={{ fontSize: '11px' }}>
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
