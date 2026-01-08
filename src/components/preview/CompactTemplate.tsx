import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin } from 'lucide-react';
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

const CompactTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-white text-gray-800 flex flex-col",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ 
        padding: layout.contentPadding,
        fontSize: layout.bodyFontSize
      }}
    >
      {/* Compact Header - One line style */}
      <header 
        className="flex-shrink-0 flex items-center justify-between border-b-2"
        style={{ borderColor: accentColor, paddingBottom: layout.itemMargin, marginBottom: layout.sectionMargin }}
      >
        <div>
          <h1 
            className="font-bold"
            style={{ color: accentColor, fontSize: layout.headerFontSize }}
          >
            {personalInfo.fullName || 'Votre Nom'}
          </h1>
          <p 
            className="text-gray-500"
            style={{ fontSize: layout.titleFontSize }}
          >
            {personalInfo.jobTitle || 'Titre'}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1 text-gray-500">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              {personalInfo.email}
              <Mail className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {personalInfo.phone}
              <Phone className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              {personalInfo.location}
              <MapPin className="h-2.5 w-2.5" style={{ color: accentColor }} />
            </span>
          )}
        </div>
      </header>

      {/* Summary - Compact */}
      {personalInfo.summary && (
        <section className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <p className="text-gray-600 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Three Column Layout for max density */}
      <div className="grid grid-cols-12 flex-grow" style={{ gap: layout.sectionMargin }}>
        {/* Experience Column */}
        <div className="col-span-5 flex flex-col">
          {experience.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-bold uppercase tracking-wider pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40`, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
              >
                Expérience
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <span className="text-gray-400 whitespace-nowrap ml-1" style={{ fontSize: '9px' }}>
                        {formatDate(exp.startDate).slice(0, 3)} - {exp.current ? 'Prés.' : formatDate(exp.endDate).slice(0, 3)}
                      </span>
                    </div>
                    <p style={{ color: accentColor, fontSize: '10px' }}>{exp.company}</p>
                    {exp.description && (
                      <p className="text-gray-500 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Education Column */}
        <div className="col-span-4 flex flex-col">
          {education.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-bold uppercase tracking-wider pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40`, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
              >
                Formation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p style={{ color: accentColor, fontSize: '10px' }}>{edu.institution}</p>
                    <p className="text-gray-400" style={{ fontSize: '9px' }}>{formatDate(edu.endDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Skills & Languages Column */}
        <div className="col-span-3 flex flex-col" style={{ gap: layout.sectionMargin }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="flex-grow">
              <h2 
                className="font-bold uppercase tracking-wider pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40`, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
              >
                Skills
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{skill.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map((dot) => (
                        <div 
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: dot <= (
                              skill.level === 'expert' ? 4 :
                              skill.level === 'advanced' ? 3 :
                              skill.level === 'intermediate' ? 2 : 1
                            ) ? accentColor : '#e5e7eb'
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
            <section className="flex-shrink-0">
              <h2 
                className="font-bold uppercase tracking-wider pb-1 border-b"
                style={{ color: accentColor, borderColor: `${accentColor}40`, fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
              >
                Langues
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-400">
                      {lang.level === 'native' ? 'C2' : 
                       lang.level === 'fluent' ? 'C1' :
                       lang.level === 'professional' ? 'B2' :
                       lang.level === 'conversational' ? 'B1' : 'A1'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Projects & Certifications Row */}
      {(projects.length > 0 || certifications.length > 0) && (
        <div className="grid grid-cols-2 flex-shrink-0" style={{ gap: layout.sectionMargin, marginTop: layout.sectionMargin }}>
          <ProjectsSection
            projects={projects}
            accentColor={accentColor}
            titleFontSize={layout.titleFontSize}
            itemMargin={layout.itemMargin}
          />
          <CertificationsSection
            certifications={certifications}
            accentColor={accentColor}
            titleFontSize={layout.titleFontSize}
            itemMargin={layout.itemMargin}
          />
        </div>
      )}
    </div>
  );
});

CompactTemplate.displayName = 'CompactTemplate';

export default CompactTemplate;
