import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
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

const skillLevelDots: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const CreativeTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full flex bg-cv-paper text-cv-text",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        layout.fontSize
      )}
    >
      {/* Sidebar */}
      <div 
        className={cn("w-[35%] p-5 text-primary-foreground flex flex-col", layout.shouldDistribute && "justify-between")}
        style={{ backgroundColor: accentColor }}
      >
        {/* Profile Photo Placeholder */}
        <div>
          <div className={cn(
            "mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center",
            layout.contentDensity === 'sparse' ? 'w-28 h-28' : 'w-24 h-24'
          )}>
            <span className={cn("font-bold text-primary-foreground/60", layout.contentDensity === 'sparse' ? 'text-4xl' : 'text-3xl')}>
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : '?'}
            </span>
          </div>

          {/* Name */}
          <div className="text-center mb-6">
            <h1 className={cn("font-bold mb-1", layout.contentDensity === 'sparse' ? 'text-xl' : 'text-lg')}>
              {personalInfo.fullName || 'Votre Nom'}
            </h1>
            <p className={cn("opacity-90", layout.subtitleSize)}>
              {personalInfo.jobTitle || 'Votre Titre'}
            </p>
          </div>

          {/* Contact */}
          <section className={cn(layout.shouldDistribute ? "mb-auto" : "mb-6")}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
              Contact
            </h2>
            <div className={cn("space-y-2", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
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
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <section className={cn(layout.shouldDistribute ? "my-auto" : "mb-6")}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
              Compétences
            </h2>
            <div className={cn("space-y-2", layout.contentDensity === 'sparse' && "space-y-3")}>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <p className={cn("mb-1", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>{skill.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={cn(
                          "rounded-full",
                          layout.contentDensity === 'sparse' ? 'w-2.5 h-2.5' : 'w-2 h-2',
                          dot <= skillLevelDots[skill.level]
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30"
                        )}
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
          <section className={layout.shouldDistribute ? "mt-auto" : ""}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-primary-foreground/30">
              Langues
            </h2>
            <div className={cn("space-y-1.5", layout.contentDensity === 'sparse' ? 'text-[10px]' : 'text-[9px]')}>
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
      <div className={cn("flex-1 p-6 flex flex-col", layout.shouldDistribute && "justify-between")}>
        {/* Summary */}
        {personalInfo.summary && (
          <section className={cn(layout.shouldDistribute ? "" : "mb-5")}>
            <h2 
              className={cn("font-bold uppercase tracking-wider mb-2 pb-1 border-b-2", layout.subtitleSize)}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              À propos
            </h2>
            <p className="text-cv-muted">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className={cn(layout.shouldDistribute ? "flex-grow py-4" : "mb-5")}>
            <h2 
              className={cn("font-bold uppercase tracking-wider mb-3 pb-1 border-b-2", layout.subtitleSize)}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Expérience
            </h2>
            <div className={cn("space-y-4", layout.contentDensity === 'dense' && "space-y-3")}>
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="mb-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-cv-muted">{exp.company}</p>
                    <p className="text-[8px] text-cv-muted">
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
          <section className={layout.shouldDistribute ? "mt-auto" : ""}>
            <h2 
              className={cn("font-bold uppercase tracking-wider mb-3 pb-1 border-b-2", layout.subtitleSize)}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Formation
            </h2>
            <div className={cn("space-y-3", layout.contentDensity === 'dense' && "space-y-2")}>
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <h3 className="font-semibold">{edu.degree} {edu.field && `- ${edu.field}`}</h3>
                  <p className="text-cv-muted">{edu.institution}</p>
                  <p className="text-[8px] text-cv-muted">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

CreativeTemplate.displayName = 'CreativeTemplate';

export default CreativeTemplate;
