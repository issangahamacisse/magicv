import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin } from 'lucide-react';
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

const CompactTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  // Compact uses smaller base sizes
  const fontSize = layout.contentDensity === 'sparse' ? 'text-[10px]' : layout.contentDensity === 'normal' ? 'text-[9px]' : 'text-[8px]';

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-white text-gray-800 p-5 flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        fontSize
      )}
    >
      {/* Compact Header - One line style */}
      <header 
        className={cn("flex items-center justify-between pb-3 border-b-2", layout.shouldDistribute ? "mb-auto" : "mb-4")}
        style={{ borderColor: accentColor }}
      >
        <div>
          <h1 className={cn("font-bold", layout.contentDensity === 'sparse' ? 'text-2xl' : 'text-xl')} style={{ color: accentColor }}>
            {personalInfo.fullName || 'Votre Nom'}
          </h1>
          <p className={cn("text-gray-500", layout.contentDensity === 'sparse' ? 'text-[11px]' : 'text-[10px]')}>
            {personalInfo.jobTitle || 'Titre'}
          </p>
        </div>
        
        <div className={cn("flex flex-col items-end gap-1 text-gray-500", layout.contentDensity === 'sparse' ? 'text-[9px]' : 'text-[8px]')}>
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              {personalInfo.email}
              <Mail className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {personalInfo.phone}
              <Phone className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              {personalInfo.location}
              <MapPin className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
        </div>
      </header>

      {/* Summary - Compact */}
      {personalInfo.summary && (
        <section className={cn(layout.shouldDistribute ? "my-auto" : "mb-4")}>
          <p className={cn("text-gray-600 leading-relaxed", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Three Column Layout for max density */}
      <div className={cn("grid grid-cols-12 flex-grow", layout.sectionGap, layout.shouldDistribute && "items-start")}>
        {/* Experience Column */}
        <div className="col-span-5 flex flex-col">
          {experience.length > 0 && (
            <section className="flex-grow">
              <h2 
                className={cn("font-bold uppercase tracking-wider mb-2 pb-1 border-b", layout.contentDensity === 'sparse' ? 'text-[11px]' : 'text-[10px]')}
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Expérience
              </h2>
              <div className={cn("space-y-3", layout.contentDensity === 'dense' && "space-y-2")}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between">
                      <h3 className={cn("font-semibold text-gray-900", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>{exp.position}</h3>
                      <span className="text-[7px] text-gray-400 whitespace-nowrap ml-1">
                        {formatDate(exp.startDate).slice(0, 3)} - {exp.current ? 'Prés.' : formatDate(exp.endDate).slice(0, 3)}
                      </span>
                    </div>
                    <p className="text-[8px]" style={{ color: accentColor }}>{exp.company}</p>
                    {exp.description && (
                      <p className={cn("text-gray-500 mt-1", layout.contentDensity === 'sparse' ? 'text-[9px]' : 'text-[8px]', layout.contentDensity !== 'sparse' && "line-clamp-3")}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Education Column */}
        <div className="col-span-4 flex flex-col">
          {education.length > 0 && (
            <section className="flex-grow">
              <h2 
                className={cn("font-bold uppercase tracking-wider mb-2 pb-1 border-b", layout.contentDensity === 'sparse' ? 'text-[11px]' : 'text-[10px]')}
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Formation
              </h2>
              <div className={cn("space-y-2", layout.contentDensity === 'sparse' && "space-y-3")}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className={cn("font-semibold text-gray-900", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>{edu.degree}</h3>
                    <p className="text-[8px]" style={{ color: accentColor }}>{edu.institution}</p>
                    <p className="text-[7px] text-gray-400">{formatDate(edu.endDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Skills & Languages Column */}
        <div className={cn("col-span-3 flex flex-col", layout.itemGap)}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="flex-grow">
              <h2 
                className={cn("font-bold uppercase tracking-wider mb-2 pb-1 border-b", layout.contentDensity === 'sparse' ? 'text-[11px]' : 'text-[10px]')}
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Skills
              </h2>
              <div className={cn("space-y-1", layout.contentDensity === 'sparse' && "space-y-2")}>
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className={cn("text-gray-700", layout.contentDensity === 'sparse' ? 'text-[9px]' : 'text-[8px]')}>{skill.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map((dot) => (
                        <div 
                          key={dot}
                          className={cn("rounded-full", layout.contentDensity === 'sparse' ? 'w-1.5 h-1.5' : 'w-1 h-1')}
                          style={{ 
                            backgroundColor: dot <= (
                              skill.level === 'expert' ? 4 :
                              skill.level === 'advanced' ? 3 :
                              skill.level === 'intermediate' ? 2 : 1
                            ) ? accentColor : '#e5e7eb'
                          }}
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
            <section className={cn(layout.shouldDistribute ? "" : "mt-2")}>
              <h2 
                className={cn("font-bold uppercase tracking-wider mb-2 pb-1 border-b", layout.contentDensity === 'sparse' ? 'text-[11px]' : 'text-[10px]')}
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Langues
              </h2>
              <div className={cn("space-y-1", layout.contentDensity === 'sparse' && "space-y-2")}>
                {languages.map((lang) => (
                  <div key={lang.id} className={cn("flex justify-between", layout.contentDensity === 'sparse' ? 'text-[9px]' : 'text-[8px]')}>
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-400">
                      {lang.level === 'native' ? 'C2' : 
                       lang.level === 'fluent' ? 'C1' :
                       lang.level === 'professional' ? 'B2' :
                       lang.level === 'conversational' ? 'B1' : 'A1'}
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

CompactTemplate.displayName = 'CompactTemplate';

export default CompactTemplate;
