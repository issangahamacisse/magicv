import React from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Palette, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const ArtisticTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full bg-gradient-to-br from-amber-50 via-white to-rose-50",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Artistic diagonal header */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -top-10 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: accentColor }}
        />
        
        <header className="relative p-8 pb-6">
          <div className="flex items-start gap-6">
            {/* Creative avatar */}
            <div 
              className="w-20 h-20 rounded-2xl rotate-3 shadow-lg flex items-center justify-center text-white"
              style={{ 
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` 
              }}
            >
              <Palette className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>
                {personalInfo.fullName || 'Votre Nom'}
              </h1>
              <p className="text-gray-600 font-light text-lg mt-0.5">
                {personalInfo.jobTitle || 'Titre Créatif'}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-3 text-[9px] text-gray-500">
                {personalInfo.email && (
                  <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                    <Mail className="h-3 w-3" style={{ color: accentColor }} />
                    {personalInfo.email}
                  </span>
                )}
                {personalInfo.phone && (
                  <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                    <Phone className="h-3 w-3" style={{ color: accentColor }} />
                    {personalInfo.phone}
                  </span>
                )}
                {personalInfo.location && (
                  <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3" style={{ color: accentColor }} />
                    {personalInfo.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="px-8 pb-6">
        {/* Summary with artistic styling */}
        {personalInfo.summary && (
          <section className="mb-6 relative">
            <div 
              className="absolute -left-2 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-gray-600 leading-relaxed pl-4 italic">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-5 gap-6">
          {/* Main Column */}
          <div className="col-span-3 space-y-6">
            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <h2 
                  className="text-sm font-black mb-4 inline-block pb-1"
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}` 
                  }}
                >
                  Parcours
                </h2>
                <div className="space-y-5">
                  {experience.map((exp) => (
                    <div 
                      key={exp.id} 
                      className="bg-white/70 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{exp.position}</h3>
                          <p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
                        </div>
                        <span 
                          className="text-[8px] px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-gray-600 whitespace-pre-line">{exp.description}</p>
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
                  className="text-sm font-black mb-4 inline-block pb-1"
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}` 
                  }}
                >
                  Formation
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white/70 p-3 rounded-xl">
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p style={{ color: accentColor }}>{edu.institution}</p>
                      <p className="text-[8px] text-gray-400 mt-1">{formatDate(edu.endDate)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-2 space-y-6">
            {/* Skills */}
            {skills.length > 0 && (
              <section 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <h2 className="text-[11px] font-black mb-3" style={{ color: accentColor }}>
                  ✦ Compétences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill.id}
                      className="px-3 py-1.5 text-[9px] rounded-full text-white font-medium"
                      style={{ backgroundColor: accentColor }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <h2 className="text-[11px] font-black mb-3" style={{ color: accentColor }}>
                  ✦ Langues
                </h2>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className="w-3 h-3"
                            fill={star <= (
                              lang.level === 'native' ? 5 :
                              lang.level === 'fluent' ? 4 :
                              lang.level === 'professional' ? 3 :
                              lang.level === 'conversational' ? 2 : 1
                            ) ? accentColor : 'transparent'}
                            style={{ color: accentColor }}
                          />
                        ))}
                      </div>
                      <span className="text-gray-700">{lang.name}</span>
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

export default ArtisticTemplate;
