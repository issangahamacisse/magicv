import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
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

const skillLevelWidth: Record<string, string> = {
  beginner: '25%',
  intermediate: '50%',
  advanced: '75%',
  expert: '100%',
};

const BoldTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full flex bg-white",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: layout.bodyFontSize }}
    >
      {/* Bold Sidebar */}
      <aside 
        className="w-[35%] text-white flex flex-col"
        style={{ backgroundColor: accentColor, padding: layout.contentPadding }}
      >
        {/* Avatar placeholder */}
        <div 
          className="mx-auto rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ 
            width: layout.contentDensity === 'sparse' ? '100px' : '80px',
            height: layout.contentDensity === 'sparse' ? '100px' : '80px',
            marginBottom: layout.sectionMargin
          }}
        >
          {personalInfo.photoUrl ? (
            <img 
              src={personalInfo.photoUrl} 
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span 
              className="font-bold text-white/80"
              style={{ fontSize: layout.headerFontSize }}
            >
              {personalInfo.fullName?.charAt(0) || 'N'}
            </span>
          )}
        </div>

        <h1 
          className="font-black text-center tracking-tight"
          style={{ fontSize: layout.headerFontSize, marginBottom: '4px' }}
        >
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p 
          className="text-white/80 text-center font-light"
          style={{ fontSize: layout.titleFontSize, marginBottom: layout.sectionMargin }}
        >
          {personalInfo.jobTitle || 'Titre'}
        </p>

        {/* Contact */}
        <div className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personalInfo.email && (
              <div className="flex items-center gap-2 text-white/90">
                <Mail className="h-3 w-3" />
                <span className="truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2 text-white/90">
                <Phone className="h-3 w-3" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-3 w-3" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2 text-white/90">
                <Linkedin className="h-3 w-3" />
                <span className="truncate">{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-black uppercase tracking-widest pb-1 border-b border-white/30"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Compétences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between mb-1">
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
          <section className="mt-auto flex-shrink-0">
            <h2 
              className="font-black uppercase tracking-widest pb-1 border-b border-white/30"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Langues
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between">
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
      <main 
        className="flex-1 flex flex-col"
        style={{ padding: layout.contentPadding }}
      >
        {/* Summary */}
        {personalInfo.summary && (
          <section 
            className="flex-shrink-0 p-4 bg-gray-50 rounded-lg"
            style={{ marginBottom: layout.sectionMargin }}
          >
            <p className="text-gray-600 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-black uppercase tracking-widest flex items-center gap-2"
              style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
              Expérience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
                    </div>
                    <span 
                      className="font-medium px-2 py-1 rounded whitespace-nowrap"
                      style={{ 
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                        fontSize: '10px'
                      }}
                    >
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
          <section style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-black uppercase tracking-widest flex items-center gap-2"
              style={{ color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
              Formation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-500">{edu.institution}</p>
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
      </main>
    </div>
  );
});

BoldTemplate.displayName = 'BoldTemplate';

export default BoldTemplate;
