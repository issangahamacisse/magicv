import React, { useState, useRef, useCallback } from 'react';
import { Project, Certification, CVData } from '@/types/cv';
import { useCV } from '@/context/CVContext';

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

// CVFooter — optional last-updated date + draggable signature
interface CVFooterProps {
  data: CVData;
  onUpdateSignaturePosition?: (pos: { x: number; y: number }) => void;
}

const formatFullDate = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const CVFooter: React.FC<CVFooterProps> = ({ data, onUpdateSignaturePosition }) => {
  const { theme, personalInfo } = data;
  const showDate = theme.showLastUpdated;
  const showSig = theme.showSignature && personalInfo.signatureUrl;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sigPos = theme.signaturePosition || { x: 70, y: 0 };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !onUpdateSignaturePosition) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    onUpdateSignaturePosition({ x, y });
  }, [isDragging, onUpdateSignaturePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!showDate && !showSig) return null;

  return (
    <div 
      ref={containerRef}
      className="relative mt-auto pt-4 border-t border-gray-200"
      style={{ minHeight: showSig ? '80px' : 'auto' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {showDate && (
        <p className="text-gray-400" style={{ fontSize: '9px' }}>
          Mis à jour le {formatFullDate(data.updatedAt)}
        </p>
      )}
      
      {showSig && (
        <img
          src={personalInfo.signatureUrl}
          alt="Signature"
          onMouseDown={handleMouseDown}
          className="absolute select-none"
          style={{
            left: `${sigPos.x}%`,
            top: `${sigPos.y}%`,
            transform: 'translate(-50%, -50%)',
            height: '50px',
            cursor: isDragging ? 'grabbing' : 'grab',
            filter: theme.signatureColor && theme.signatureColor !== '#000000' 
              ? undefined 
              : undefined,
          }}
          draggable={false}
        />
      )}
    </div>
  );
};
