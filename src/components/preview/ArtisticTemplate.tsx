import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Palette, Star } from 'lucide-react';
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

const ArtisticTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-gradient-to-br from-amber-50 via-white to-rose-50 flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        layout.fontSize
      )}
    >
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
        
        <header className={cn("relative p-8", layout.contentDensity === 'sparse' ? 'pb-8' : 'pb-6')}>
          <div className="flex items-start gap-6">
            {/* Creative avatar */}
            <div 
              className={cn(
                "rounded-2xl rotate-3 shadow-lg flex items-center justify-center text-white",
                layout.contentDensity === 'sparse' ? 'w-24 h-24' : 'w-20 h-20'
              )}
              style={{ 
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` 
              }}
            >
              <Palette className={layout.contentDensity === 'sparse' ? 'w-10 h-10' : 'w-8 h-8'} />
            </div>
            
            <div className="flex-1">
              <h1 className={cn("font-black tracking-tight", layout.headerSize)} style={{ color: accentColor }}>
                {personalInfo.fullName || 'Votre Nom'}
              </h1>
              <p className={cn("text-gray-600 font-light mt-0.5", layout.titleSize)}>
                {personalInfo.jobTitle || 'Titre Créatif'}
              </p>
              
              <div className={cn("flex flex-wrap gap-3 mt-3 text-gray-500", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
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

      <div className={cn("px-8 pb-6 flex-grow", layout.shouldDistribute && "flex flex-col justify-between")}>
        {/* Summary with artistic styling */}
        {personalInfo.summary && (
          <section className={cn("relative", layout.shouldDistribute ? "" : "mb-6")}>
            <div 
              className="absolute -left-2 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-gray-600 leading-relaxed pl-4 italic">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <div className={cn("grid grid-cols-5", layout.sectionGap, layout.shouldDistribute ? "flex-grow items-start" : "")}>
          {/* Main Column */}
          <div className={cn("col-span-3 flex flex-col", layout.itemGap)}>
            {/* Experience */}
            {experience.length > 0 && (
              <section className="flex-grow">
                <h2 
                  className={cn("font-black mb-4 inline-block pb-1", layout.subtitleSize)}
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}` 
                  }}
                >
                  Parcours
                </h2>
                <div className={cn("space-y-5", layout.contentDensity === 'dense' && "space-y-3")}>
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
              <section className={cn(layout.shouldDistribute ? "" : "mt-4")}>
                <h2 
                  className={cn("font-black mb-4 inline-block pb-1", layout.subtitleSize)}
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}` 
                  }}
                >
                  Formation
                </h2>
                <div className={cn("space-y-3", layout.contentDensity === 'dense' && "space-y-2")}>
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
          <div className={cn("col-span-2 flex flex-col", layout.itemGap)}>
            {/* Skills */}
            {skills.length > 0 && (
              <section 
                className={cn("p-4 rounded-2xl flex-grow", layout.contentDensity === 'sparse' && "p-5")}
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <h2 className={cn("font-black mb-3", layout.subtitleSize)} style={{ color: accentColor }}>
                  ✦ Compétences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill.id}
                      className={cn("px-3 py-1.5 rounded-full text-white font-medium", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}
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
                className={cn("p-4 rounded-2xl", layout.contentDensity === 'sparse' && "p-5")}
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <h2 className={cn("font-black mb-3", layout.subtitleSize)} style={{ color: accentColor }}>
                  ✦ Langues
                </h2>
                <div className={cn("space-y-2", layout.contentDensity === 'sparse' && "space-y-3")}>
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
});

ArtisticTemplate.displayName = 'ArtisticTemplate';

export default ArtisticTemplate;
