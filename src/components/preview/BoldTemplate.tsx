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

const skillLevelWidth: Record<string, string> = {
  beginner: '25%',
  intermediate: '50%',
  advanced: '75%',
  expert: '100%',
};

const BoldTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full flex bg-white",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Bold Sidebar */}
      <aside 
        className="w-[35%] p-6 text-white"
        style={{ backgroundColor: accentColor }}
      >
        {/* Avatar placeholder */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-white/80">
            {personalInfo.fullName?.charAt(0) || 'N'}
          </span>
        </div>

        <h1 className="text-xl font-black text-center mb-1 tracking-tight">
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-white/80 text-center text-sm mb-6 font-light">
          {personalInfo.jobTitle || 'Titre'}
        </p>

        {/* Contact */}
        <div className="space-y-2 mb-8">
          {personalInfo.email && (
            <div className="flex items-center gap-2 text-white/90 text-[9px]">
              <Mail className="h-3 w-3" />
              <span className="truncate">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2 text-white/90 text-[9px]">
              <Phone className="h-3 w-3" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2 text-white/90 text-[9px]">
              <MapPin className="h-3 w-3" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 text-white/90 text-[9px]">
              <Linkedin className="h-3 w-3" />
              <span className="truncate">{personalInfo.linkedin}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-3 pb-1 border-b border-white/30">
              Compétences
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>{skill.name}</span>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: skillLevelWidth[skill.level] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-3 pb-1 border-b border-white/30">
              Langues
            </h2>
            <div className="space-y-1.5">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-[9px]">
                  <span>{lang.name}</span>
                  <span className="text-white/70 capitalize">
                    {lang.level === 'native' ? 'Natif' : 
                     lang.level === 'fluent' ? 'Bilingue' :
                     lang.level === 'professional' ? 'Pro' :
                     lang.level === 'conversational' ? 'Courant' : 'Notions'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 
              className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
              Expérience
            </h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
                    </div>
                    <span className="text-[8px] font-medium px-2 py-1 rounded" style={{ 
                      backgroundColor: `${accentColor}15`,
                      color: accentColor 
                    }}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
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
            <h2 
              className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
              Formation
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-500">{edu.institution}</p>
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
      </main>
    </div>
  );
};

export default BoldTemplate;
