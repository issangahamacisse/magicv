import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, GraduationCap, Briefcase } from 'lucide-react';
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

const skillLevelDots: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const ElegantTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-white flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: layout.bodyFontSize }}
    >
      {/* Elegant Header with accent banner */}
      <header 
        className="flex-shrink-0 text-white"
        style={{ backgroundColor: accentColor, padding: layout.contentPadding, paddingTop: layout.sectionMargin, paddingBottom: layout.sectionMargin }}
      >
        <h1 
          className="font-bold tracking-wide"
          style={{ fontSize: layout.headerFontSize }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="text-white/90 mt-1 font-light"
          style={{ fontSize: layout.titleFontSize }}
        >
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
      </header>

      {/* Contact bar */}
      <div 
        className="flex-shrink-0 bg-gray-50 flex flex-wrap gap-4 text-gray-600 border-b"
        style={{ padding: `${layout.itemMargin} ${layout.contentPadding}` }}
      >
        {personalInfo.email && (
          <span className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" style={{ color: accentColor }} />
            {personalInfo.email}
          </span>
        )}
        {personalInfo.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" style={{ color: accentColor }} />
            {personalInfo.phone}
          </span>
        )}
        {personalInfo.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" style={{ color: accentColor }} />
            {personalInfo.location}
          </span>
        )}
        {personalInfo.linkedin && (
          <span className="flex items-center gap-1.5">
            <Linkedin className="h-3 w-3" style={{ color: accentColor }} />
            {personalInfo.linkedin}
          </span>
        )}
      </div>

      <div 
        className="flex-grow flex flex-col"
        style={{ padding: layout.contentPadding }}
      >
        {/* Summary with decorative border */}
        {personalInfo.summary && (
          <section 
            className="flex-shrink-0 relative pl-4"
            style={{ marginBottom: layout.sectionMargin }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-gray-600 leading-relaxed italic">
              "{personalInfo.summary}"
            </p>
          </section>
        )}

        <div className="grid grid-cols-3 flex-grow" style={{ gap: layout.sectionMargin }}>
          {/* Main Column */}
          <div className="col-span-2 flex flex-col" style={{ gap: layout.sectionMargin }}>
            {/* Experience */}
            {experience.length > 0 && (
              <section className="flex-grow">
                <div className="flex items-center gap-2" style={{ marginBottom: layout.itemMargin }}>
                  <Briefcase className="h-4 w-4" style={{ color: accentColor }} />
                  <h2 
                    className="font-bold uppercase tracking-wider"
                    style={{ color: accentColor, fontSize: layout.titleFontSize }}
                  >
                    Expérience Professionnelle
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {experience.map((exp, idx) => (
                    <div key={exp.id} className="relative pl-5">
                      {/* Timeline dot and line */}
                      <div 
                        className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      {idx < experience.length - 1 && (
                        <div 
                          className="absolute left-[3px] top-4 bottom-0 w-0.5"
                          style={{ backgroundColor: `${accentColor}30` }}
                        />
                      )}
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-gray-500" style={{ fontSize: '11px' }}>{exp.company}{exp.location && ` — ${exp.location}`}</p>
                        </div>
                        <span 
                          className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap"
                          style={{ fontSize: '10px' }}
                        >
                          {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate)}
                        </span>
                      </div>
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
              <section className="flex-shrink-0">
                <div className="flex items-center gap-2" style={{ marginBottom: layout.itemMargin }}>
                  <GraduationCap className="h-4 w-4" style={{ color: accentColor }} />
                  <h2 
                    className="font-bold uppercase tracking-wider"
                    style={{ color: accentColor, fontSize: layout.titleFontSize }}
                  >
                    Formation
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {education.map((edu) => (
                    <div key={edu.id} className="pl-5 relative">
                      <div 
                        className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-500" style={{ fontSize: '11px' }}>{edu.institution}</p>
                        </div>
                        <span className="text-gray-400" style={{ fontSize: '10px' }}>
                          {formatDate(edu.endDate)}
                        </span>
                      </div>
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
              <section 
                className="flex-grow rounded-lg"
                style={{ backgroundColor: `${accentColor}08`, padding: layout.itemMargin }}
              >
                <h2 
                  className="font-bold uppercase tracking-wider"
                  style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
                >
                  Compétences
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{skill.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((dot) => (
                          <div 
                            key={dot}
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: dot <= skillLevelDots[skill.level] 
                                ? accentColor 
                                : `${accentColor}30`
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
              <section 
                className="flex-shrink-0 rounded-lg"
                style={{ backgroundColor: `${accentColor}08`, padding: layout.itemMargin }}
              >
                <h2 
                  className="font-bold uppercase tracking-wider"
                  style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
                >
                  Langues
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-gray-700">{lang.name}</span>
                      <span className="text-gray-500 capitalize" style={{ fontSize: '11px' }}>
                        {lang.level === 'native' ? 'Natif' : 
                         lang.level === 'fluent' ? 'Bilingue' :
                         lang.level === 'professional' ? 'Professionnel' :
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
    </div>
  );
});

ElegantTemplate.displayName = 'ElegantTemplate';

export default ElegantTemplate;
