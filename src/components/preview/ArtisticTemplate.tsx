import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Palette, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';
import { ProjectsSection, CertificationsSection } from './TemplateSections';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const ArtisticTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-gradient-to-br from-amber-50 via-white to-rose-50 flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: layout.bodyFontSize }}
    >
      {/* Artistic diagonal header */}
      <div className="relative overflow-hidden flex-shrink-0">
        <div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -top-10 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: accentColor }}
        />
        
        <header className="relative" style={{ padding: layout.contentPadding, paddingBottom: layout.sectionMargin }}>
          <div className="flex items-start gap-6">
            {/* Creative avatar */}
            <div 
              className="rounded-2xl rotate-3 shadow-lg flex items-center justify-center text-white"
              style={{ 
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                width: layout.contentDensity === 'sparse' ? '96px' : '80px',
                height: layout.contentDensity === 'sparse' ? '96px' : '80px'
              }}
            >
              <Palette style={{ width: '32px', height: '32px' }} />
            </div>
            
            <div className="flex-1">
              <h1 
                className="font-black tracking-tight"
                style={{ color: accentColor, fontSize: layout.headerFontSize }}
              >
                {personalInfo.fullName || 'Votre Nom'}
              </h1>
              <p 
                className="text-gray-600 font-light mt-0.5"
                style={{ fontSize: layout.titleFontSize }}
              >
                {personalInfo.jobTitle || 'Titre Créatif'}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-3 text-gray-500">
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

      <div 
        className="flex-grow flex flex-col"
        style={{ padding: `0 ${layout.contentPadding} ${layout.contentPadding}` }}
      >
        {/* Summary with artistic styling */}
        {personalInfo.summary && (
          <section className="flex-shrink-0 relative" style={{ marginBottom: layout.sectionMargin }}>
            <div 
              className="absolute -left-2 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-gray-600 leading-relaxed pl-4 italic">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-5 flex-grow" style={{ gap: layout.sectionMargin }}>
          {/* Main Column */}
          <div className="col-span-3 flex flex-col" style={{ gap: layout.sectionMargin }}>
            {/* Experience */}
            {experience.length > 0 && (
              <section className="flex-grow">
                <h2 
                  className="font-black inline-block pb-1"
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}`,
                    fontSize: layout.titleFontSize,
                    marginBottom: layout.itemMargin
                  }}
                >
                  Parcours
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {experience.map((exp) => (
                    <div 
                      key={exp.id} 
                      className="bg-white/70 p-4 rounded-xl shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{exp.position}</h3>
                          <p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
                        </div>
                        <span 
                          className="px-2 py-1 rounded-full text-white whitespace-nowrap"
                          style={{ backgroundColor: accentColor, fontSize: '10px' }}
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
              <section style={{ marginBottom: layout.sectionMargin }}>
                <h2 
                  className="font-black inline-block pb-1"
                  style={{ 
                    color: accentColor,
                    borderBottom: `3px solid ${accentColor}`,
                    fontSize: layout.titleFontSize,
                    marginBottom: layout.itemMargin
                  }}
                >
                  Formation
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white/70 p-3 rounded-xl">
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p style={{ color: accentColor }}>{edu.institution}</p>
                      <p className="text-gray-400 mt-1" style={{ fontSize: '10px' }}>{formatDate(edu.endDate)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            <ProjectsSection
              projects={projects}
              accentColor={accentColor}
              titleFontSize={layout.titleFontSize}
              itemMargin={layout.itemMargin}
            />

            {/* Certifications */}
            <CertificationsSection
              certifications={certifications}
              accentColor={accentColor}
              titleFontSize={layout.titleFontSize}
              itemMargin={layout.itemMargin}
            />
          </div>

          {/* Sidebar */}
          <div className="col-span-2 flex flex-col" style={{ gap: layout.sectionMargin }}>
            {/* Skills */}
            {skills.length > 0 && (
              <section 
                className="flex-grow rounded-2xl"
                style={{ backgroundColor: `${accentColor}10`, padding: layout.itemMargin }}
              >
                <h2 
                  className="font-black"
                  style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
                >
                  ✦ Compétences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill.id}
                      className="px-3 py-1.5 rounded-full text-white font-medium"
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
                className="flex-shrink-0 rounded-2xl"
                style={{ backgroundColor: `${accentColor}10`, padding: layout.itemMargin }}
              >
                <h2 
                  className="font-black"
                  style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
                >
                  ✦ Langues
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
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
