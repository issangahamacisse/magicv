import React from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const CompactTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[8px] leading-tight',
    normal: 'text-[9px] leading-snug',
    spacious: 'text-[10px] leading-normal',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full bg-white text-gray-800 p-5",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Compact Header - One line style */}
      <header 
        className="flex items-center justify-between mb-4 pb-3 border-b-2"
        style={{ borderColor: accentColor }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: accentColor }}>
            {personalInfo.fullName || 'Votre Nom'}
          </h1>
          <p className="text-gray-500 text-[10px]">
            {personalInfo.jobTitle || 'Titre'}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1 text-[8px] text-gray-500">
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
        <section className="mb-4">
          <p className="text-gray-600 text-[9px] leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Three Column Layout for max density */}
      <div className="grid grid-cols-12 gap-4">
        {/* Experience Column */}
        <div className="col-span-5">
          {experience.length > 0 && (
            <section>
              <h2 
                className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Expérience
              </h2>
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 text-[9px]">{exp.position}</h3>
                      <span className="text-[7px] text-gray-400 whitespace-nowrap ml-1">
                        {formatDate(exp.startDate).slice(0, 3)} - {exp.current ? 'Prés.' : formatDate(exp.endDate).slice(0, 3)}
                      </span>
                    </div>
                    <p className="text-[8px]" style={{ color: accentColor }}>{exp.company}</p>
                    {exp.description && (
                      <p className="text-gray-500 text-[8px] mt-1 line-clamp-3">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Education Column */}
        <div className="col-span-4">
          {education.length > 0 && (
            <section>
              <h2 
                className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Formation
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-gray-900 text-[9px]">{edu.degree}</h3>
                    <p className="text-[8px]" style={{ color: accentColor }}>{edu.institution}</p>
                    <p className="text-[7px] text-gray-400">{formatDate(edu.endDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Skills & Languages Column */}
        <div className="col-span-3 space-y-4">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 
                className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Skills
              </h2>
              <div className="space-y-1">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className="text-gray-700 text-[8px]">{skill.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map((dot) => (
                        <div 
                          key={dot}
                          className="w-1 h-1 rounded-full"
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
            <section>
              <h2 
                className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                Langues
              </h2>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-[8px]">
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
};

export default CompactTemplate;
