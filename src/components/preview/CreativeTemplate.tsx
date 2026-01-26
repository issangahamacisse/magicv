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

const skillLevelDots: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const CreativeTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full flex bg-cv-paper text-cv-text",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: layout.bodyFontSize }}
    >
      {/* Sidebar */}
      <div 
        className="w-[35%] text-primary-foreground flex flex-col"
        style={{ backgroundColor: accentColor, padding: layout.contentPadding }}
      >
        {/* Profile Photo */}
        <div 
          className="mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ 
            width: layout.contentDensity === 'sparse' ? '112px' : '96px',
            height: layout.contentDensity === 'sparse' ? '112px' : '96px',
            marginBottom: layout.itemMargin
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
              className="font-bold text-primary-foreground/60"
              style={{ fontSize: layout.headerFontSize }}
            >
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : '?'}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="text-center flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <h1 
            className="font-bold"
            style={{ fontSize: layout.headerFontSize, marginBottom: '4px' }}
          >
            {personalInfo.fullName || 'Votre Nom'}
          </h1>
          <p className="opacity-90" style={{ fontSize: layout.titleFontSize }}>
            {personalInfo.jobTitle || 'Votre Titre'}
          </p>
        </div>

        {/* Contact */}
        <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <h2 
            className="font-bold uppercase tracking-wider pb-1 border-b border-primary-foreground/30"
            style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
          >
            Contact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personalInfo.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3 opacity-80" />
                <span className="break-all">{personalInfo.email}</span>
              </p>
            )}
            {personalInfo.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3 opacity-80" />
                {personalInfo.phone}
              </p>
            )}
            {personalInfo.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3 opacity-80" />
                {personalInfo.location}
              </p>
            )}
            {personalInfo.linkedin && (
              <p className="flex items-center gap-2">
                <Linkedin className="h-3 w-3 opacity-80" />
                <span className="break-all">{personalInfo.linkedin}</span>
              </p>
            )}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-bold uppercase tracking-wider pb-1 border-b border-primary-foreground/30"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Compétences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <p style={{ marginBottom: '4px' }}>{skill.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={cn(
                          "rounded-full",
                          dot <= skillLevelDots[skill.level]
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30"
                        )}
                        style={{ width: '10px', height: '10px' }}
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
          <section className="mt-auto flex-shrink-0">
            <h2 
              className="font-bold uppercase tracking-wider pb-1 border-b border-primary-foreground/30"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Langues
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {languages.map((lang) => (
                <p key={lang.id} className="flex justify-between">
                  <span>{lang.name}</span>
                  <span className="opacity-80">
                    {lang.level === 'native' ? 'Natif' : 
                     lang.level === 'fluent' ? 'Bilingue' :
                     lang.level === 'professional' ? 'Pro' :
                     lang.level === 'conversational' ? 'Courant' : 'Notions'}
                  </span>
                </p>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col"
        style={{ padding: layout.contentPadding }}
      >
        {/* Summary */}
        {personalInfo.summary && (
          <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              À propos
            </h2>
            <p className="text-cv-muted">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <h2 
              className="font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Expérience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="mb-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-cv-muted">{exp.company}</p>
                    <p className="text-cv-muted" style={{ fontSize: '10px' }}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-cv-muted whitespace-pre-line">{exp.description}</p>
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
              className="font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: accentColor, color: accentColor, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              Formation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <h3 className="font-semibold">{edu.degree} {edu.field && `- ${edu.field}`}</h3>
                  <p className="text-cv-muted">{edu.institution}</p>
                  <p className="text-cv-muted" style={{ fontSize: '10px' }}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
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
    </div>
  );
});

CreativeTemplate.displayName = 'CreativeTemplate';

export default CreativeTemplate;
