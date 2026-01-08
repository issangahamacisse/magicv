import React from 'react';
import { Project, Certification } from '@/types/cv';

interface ProjectsSectionProps {
  projects: Project[];
  accentColor: string;
  titleFontSize: string;
  itemMargin: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
  accentColor: string;
  titleFontSize: string;
  itemMargin: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  accentColor,
  titleFontSize,
  itemMargin,
}) => {
  if (projects.length === 0) return null;

  return (
    <section>
      <h2 
        className="font-bold uppercase tracking-wider border-b"
        style={{ 
          color: accentColor, 
          borderColor: accentColor,
          fontSize: titleFontSize,
          marginBottom: itemMargin,
          paddingBottom: '4px'
        }}
      >
        Projets
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemMargin }}>
        {projects.map((project) => (
          <div key={project.id}>
            <h3 className="font-semibold">{project.name}</h3>
            {project.description && (
              <p className="text-cv-muted">{project.description}</p>
            )}
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {project.technologies.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: accentColor, fontSize: '9px' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  accentColor,
  titleFontSize,
  itemMargin,
}) => {
  if (certifications.length === 0) return null;

  return (
    <section>
      <h2 
        className="font-bold uppercase tracking-wider border-b"
        style={{ 
          color: accentColor, 
          borderColor: accentColor,
          fontSize: titleFontSize,
          marginBottom: itemMargin,
          paddingBottom: '4px'
        }}
      >
        Certifications
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {certifications.map((cert) => (
          <div key={cert.id}>
            <span className="font-medium">{cert.name}</span>
            <p className="text-cv-muted" style={{ fontSize: '10px' }}>
              {cert.issuer} {cert.date && `· ${formatDate(cert.date)}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
