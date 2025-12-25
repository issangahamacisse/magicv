import React from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const ElegantTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full bg-white",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Elegant Header with accent banner */}
      <header 
        className="px-8 py-6 text-white"
        style={{ backgroundColor: accentColor }}
      >
        <h1 className="text-2xl font-bold tracking-wide">
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-white/90 mt-1 text-sm font-light">
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
      </header>

      {/* Contact bar */}
      <div className="px-8 py-3 bg-gray-50 flex flex-wrap gap-4 text-[9px] text-gray-600 border-b">
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

      <div className="p-8">
        {/* Summary with decorative border */}
        {personalInfo.summary && (
          <section className="mb-6 relative pl-4">
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-gray-600 leading-relaxed italic">
              "{personalInfo.summary}"
            </p>
          </section>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="col-span-2 space-y-6">
            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4" style={{ color: accentColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    Expérience Professionnelle
                  </h2>
                </div>
                <div className="space-y-5">
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
                          <p className="text-gray-500 text-[9px]">{exp.company}{exp.location && ` — ${exp.location}`}</p>
                        </div>
                        <span className="text-[8px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
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
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4 w-4" style={{ color: accentColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    Formation
                  </h2>
                </div>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="pl-5 relative">
                      <div 
                        className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-500 text-[9px]">{edu.institution}</p>
                        </div>
                        <span className="text-[8px] text-gray-400">
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
          <div className="space-y-6">
            {/* Skills */}
            {skills.length > 0 && (
              <section className="p-4 rounded-lg" style={{ backgroundColor: `${accentColor}08` }}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: accentColor }}>
                  Compétences
                </h2>
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{skill.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((dot) => (
                          <div 
                            key={dot}
                            className="w-1.5 h-1.5 rounded-full"
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
              <section className="p-4 rounded-lg" style={{ backgroundColor: `${accentColor}08` }}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: accentColor }}>
                  Langues
                </h2>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-gray-700">{lang.name}</span>
                      <span className="text-[9px] text-gray-500 capitalize">
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
};

export default ElegantTemplate;
