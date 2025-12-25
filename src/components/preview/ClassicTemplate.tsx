import React from 'react';
import { CVData } from '@/types/cv';
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: CVData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;

  const spacingClass = {
    compact: 'text-[9px] leading-tight',
    normal: 'text-[10px] leading-normal',
    spacious: 'text-[11px] leading-relaxed',
  }[theme.spacing];

  return (
    <div className={cn(
      "w-full h-full p-8 bg-cv-paper text-cv-text",
      theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans',
      spacingClass
    )}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-cv-text mb-1">
          {personalInfo.fullName || 'Votre Nom'}
        </h1>
        <p className="text-base text-cv-muted mb-2">
          {personalInfo.jobTitle || 'Votre Titre Professionnel'}
        </p>
        
        <div className="text-[9px] text-cv-muted space-y-0.5">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
          {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cv-text mb-2 pb-1 border-b border-cv-border">
            Profil
          </h2>
          <p className="text-cv-muted">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cv-text mb-2 pb-1 border-b border-cv-border">
            Expérience Professionnelle
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="mb-1">
                  <h3 className="font-semibold text-cv-text">{exp.position}</h3>
                  <p className="text-cv-muted">
                    {exp.company}{exp.location && `, ${exp.location}`}
                  </p>
                  <p className="text-[8px] text-cv-muted italic">
                    {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-cv-muted whitespace-pre-line mt-1">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cv-text mb-2 pb-1 border-b border-cv-border">
            Formation
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <h3 className="font-semibold text-cv-text">
                  {edu.degree} {edu.field && `- ${edu.field}`}
                </h3>
                <p className="text-cv-muted">{edu.institution}</p>
                <p className="text-[8px] text-cv-muted italic">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
                {edu.description && (
                  <p className="text-cv-muted mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cv-text mb-2 pb-1 border-b border-cv-border">
              Compétences
            </h2>
            <ul className="space-y-1">
              {skills.map((skill) => (
                <li key={skill.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cv-text" />
                  <span>{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cv-text mb-2 pb-1 border-b border-cv-border">
              Langues
            </h2>
            <ul className="space-y-1">
              {languages.map((lang) => (
                <li key={lang.id}>
                  {lang.name} -{' '}
                  <span className="text-cv-muted">
                    {lang.level === 'native' ? 'Langue maternelle' : 
                     lang.level === 'fluent' ? 'Bilingue' :
                     lang.level === 'professional' ? 'Professionnel' :
                     lang.level === 'conversational' ? 'Courant' : 'Notions'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
