import React from 'react';
import { CVData } from '@/types/cv';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full bg-white text-gray-800 p-8",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Executive Header - Luxe style */}
      <header className="text-center mb-8 pb-6 border-b-2 border-gray-200">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase mb-2" style={{ color: accentColor }}>
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-sm font-light tracking-[0.15em] uppercase text-gray-500 mb-4">
          {personalInfo.jobTitle || 'Titre Professionnel'}
        </p>
        
        <div className="flex items-center justify-center gap-6 text-[9px] text-gray-500">
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
        <section className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 leading-relaxed font-light italic">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="col-span-2 space-y-8">
          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 
                className="text-xs font-light uppercase tracking-[0.25em] mb-5 pb-2"
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Expérience Professionnelle
              </h2>
              <div className="space-y-6">
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
            <section>
              <h2 
                className="text-xs font-light uppercase tracking-[0.25em] mb-5 pb-2"
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Formation
              </h2>
              <div className="space-y-4">
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
        <div className="space-y-8 border-l border-gray-200 pl-6">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 
                className="text-xs font-light uppercase tracking-[0.25em] mb-4 pb-2"
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Expertise
              </h2>
              <div className="space-y-2">
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
            <section>
              <h2 
                className="text-xs font-light uppercase tracking-[0.25em] mb-4 pb-2"
                style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}
              >
                Langues
              </h2>
              <div className="space-y-2">
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
};

export default ExecutiveTemplate;
