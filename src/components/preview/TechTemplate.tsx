import React, { forwardRef } from 'react';
import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Code, Terminal, Database } from 'lucide-react';
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

const skillLevelBars: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const TechTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
  const { personalInfo, experience, education, skills, languages, theme } = data;
  const accentColor = theme.accentColor;
  const layout = useAdaptiveLayout(data);

  return (
    <div 
      ref={ref}
      className={cn(
        "w-full h-full bg-slate-900 text-slate-100 flex",
        theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: layout.bodyFontSize }}
    >
      {/* Sidebar - Dark tech style */}
      <aside 
        className="w-[32%] bg-slate-950 border-r border-slate-800 flex flex-col"
        style={{ padding: layout.contentPadding }}
      >
        {/* Terminal-style header */}
        <div 
          className="flex-shrink-0 pb-4 border-b border-slate-800"
          style={{ marginBottom: layout.sectionMargin }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="font-mono text-slate-500" style={{ fontSize: '12px' }}>
            <span style={{ color: accentColor }}>$</span> whoami
          </div>
          <h1 
            className="font-bold mt-1 font-mono"
            style={{ fontSize: layout.headerFontSize }}
          >
            {personalInfo.fullName || 'username'}
          </h1>
          <p 
            className="mt-1 font-mono"
            style={{ color: accentColor, fontSize: layout.titleFontSize }}
          >
            {personalInfo.jobTitle || 'Developer'}
          </p>
        </div>

        {/* Contact */}
        <div className="flex-shrink-0" style={{ marginBottom: layout.sectionMargin }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personalInfo.email && (
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-3 w-3" style={{ color: accentColor }} />
                <span className="font-mono truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-3 w-3" style={{ color: accentColor }} />
                <span className="font-mono">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-3 w-3" style={{ color: accentColor }} />
                <span className="font-mono">{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2 text-slate-400">
                <Linkedin className="h-3 w-3" style={{ color: accentColor }} />
                <span className="font-mono truncate">{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills as code blocks */}
        {skills.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <div className="flex items-center gap-2" style={{ marginBottom: layout.itemMargin }}>
              <Code className="h-3 w-3" style={{ color: accentColor }} />
              <h2 className="font-mono font-bold uppercase tracking-wider" style={{ fontSize: layout.titleFontSize }}>skills.tech</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {skills.map((skill) => (
                <div key={skill.id} className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono">{skill.name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div 
                        key={bar}
                        className="flex-1 h-1 rounded"
                        style={{ 
                          backgroundColor: bar <= skillLevelBars[skill.level] 
                            ? accentColor 
                            : 'rgba(255,255,255,0.1)'
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
          <section className="mt-auto flex-shrink-0">
            <div className="flex items-center gap-2" style={{ marginBottom: layout.itemMargin }}>
              <Terminal className="h-3 w-3" style={{ color: accentColor }} />
              <h2 className="font-mono font-bold uppercase tracking-wider" style={{ fontSize: layout.titleFontSize }}>languages</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {languages.map((lang) => (
                <div key={lang.id} className="font-mono text-slate-400">
                  <span style={{ color: accentColor }}>&gt;</span> {lang.name}
                  <span className="text-slate-600"> // {lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-auto flex flex-col"
        style={{ padding: layout.contentPadding }}
      >
        {/* Summary */}
        {personalInfo.summary && (
          <section 
            className="flex-shrink-0 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
            style={{ marginBottom: layout.sectionMargin }}
          >
            <p className="text-slate-300 leading-relaxed font-mono">
              <span style={{ color: accentColor }}>/**</span><br />
              <span className="text-slate-400">* </span>{personalInfo.summary}<br />
              <span style={{ color: accentColor }}>*/</span>
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="flex-grow" style={{ marginBottom: layout.sectionMargin }}>
            <div className="flex items-center gap-2" style={{ marginBottom: layout.itemMargin }}>
              <Database className="h-4 w-4" style={{ color: accentColor }} />
              <h2 className="font-mono font-bold" style={{ fontSize: layout.titleFontSize }}>experience.log</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: layout.itemMargin }}>
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: accentColor }}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-slate-100">{exp.position}</h3>
                      <p className="font-mono" style={{ color: accentColor, fontSize: '11px' }}>
                        @ {exp.company}
                      </p>
                    </div>
                    <span 
                      className="font-mono px-2 py-1 bg-slate-800 rounded text-slate-400 whitespace-nowrap"
                      style={{ fontSize: '10px' }}
                    >
                      {formatDate(exp.startDate)} → {exp.current ? 'now' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-400 mt-2 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mt-auto flex-shrink-0">
            <h2 
              className="font-mono font-bold flex items-center gap-2"
              style={{ fontSize: layout.titleFontSize, marginBottom: layout.itemMargin }}
            >
              <span style={{ color: accentColor }}>#</span> education
            </h2>
            <div className="grid grid-cols-2" style={{ gap: layout.itemMargin }}>
              {education.map((edu) => (
                <div key={edu.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="font-medium text-slate-100">{edu.degree}</h3>
                  <p className="font-mono" style={{ color: accentColor, fontSize: '11px' }}>
                    {edu.institution}
                  </p>
                  <p className="font-mono text-slate-500 mt-1" style={{ fontSize: '10px' }}>
                    {formatDate(edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
});

TechTemplate.displayName = 'TechTemplate';

export default TechTemplate;
