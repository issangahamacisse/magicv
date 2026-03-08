import { useState, useCallback } from 'react';
import { CVData } from '@/types/cv';
import { toast } from 'sonner';

export const useDocxExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToDocx = useCallback(async (cvData: CVData) => {
    setIsExporting(true);

    try {
      const docx = await import('docx');
      const { saveAs } = await import('file-saver');

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

      const children: any[] = [];

      // Name
      if (cvData.personalInfo.fullName) {
        children.push(new Paragraph({
          children: [new TextRun({ text: cvData.personalInfo.fullName, bold: true, size: 32, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }));
      }

      // Job title
      if (cvData.personalInfo.jobTitle) {
        children.push(new Paragraph({
          children: [new TextRun({ text: cvData.personalInfo.jobTitle, size: 24, color: '666666', font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }));
      }

      // Contact line
      const contactParts = [
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.location,
        cvData.personalInfo.linkedin,
        cvData.personalInfo.website,
      ].filter(Boolean);

      if (contactParts.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: contactParts.join(' • '), size: 18, color: '888888', font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }));
      }

      // Divider helper
      const addSection = (title: string) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: '333333', font: 'Calibri' })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        }));
      };

      // Summary
      if (cvData.personalInfo.summary) {
        addSection('Profil');
        children.push(new Paragraph({
          children: [new TextRun({ text: cvData.personalInfo.summary, size: 20, font: 'Calibri' })],
          spacing: { after: 200 },
        }));
      }

      // Experience
      if (cvData.experience.length > 0) {
        addSection('Expérience professionnelle');
        cvData.experience.forEach(exp => {
          const dates = exp.current ? `${exp.startDate} - Présent` : `${exp.startDate} - ${exp.endDate}`;
          children.push(new Paragraph({
            children: [
              new TextRun({ text: exp.position, bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: ` — ${exp.company}`, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 100 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: `${dates}${exp.location ? ` | ${exp.location}` : ''}`, size: 18, color: '888888', font: 'Calibri', italics: true })],
            spacing: { after: 50 },
          }));
          if (exp.description) {
            exp.description.split('\n').forEach(line => {
              const trimmed = line.trim();
              if (trimmed) {
                children.push(new Paragraph({
                  children: [new TextRun({ text: trimmed.startsWith('•') ? trimmed : `• ${trimmed}`, size: 20, font: 'Calibri' })],
                  spacing: { after: 30 },
                  indent: { left: 360 },
                }));
              }
            });
          }
        });
      }

      // Education
      if (cvData.education.length > 0) {
        addSection('Formation');
        cvData.education.forEach(edu => {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `${edu.degree} ${edu.field}`.trim(), bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: ` — ${edu.institution}`, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 100 },
          }));
          const dates = `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`;
          children.push(new Paragraph({
            children: [new TextRun({ text: dates, size: 18, color: '888888', font: 'Calibri', italics: true })],
            spacing: { after: 50 },
          }));
          if (edu.description) {
            children.push(new Paragraph({
              children: [new TextRun({ text: edu.description, size: 20, font: 'Calibri' })],
              spacing: { after: 50 },
              indent: { left: 360 },
            }));
          }
        });
      }

      // Skills
      if (cvData.skills.length > 0) {
        addSection('Compétences');
        children.push(new Paragraph({
          children: [new TextRun({ text: cvData.skills.map(s => s.name).join(' • '), size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        }));
      }

      // Languages
      if (cvData.languages.length > 0) {
        addSection('Langues');
        const levelLabels: Record<string, string> = {
          basic: 'Débutant', conversational: 'Intermédiaire', professional: 'Professionnel', fluent: 'Courant', native: 'Langue maternelle',
        };
        children.push(new Paragraph({
          children: [new TextRun({
            text: cvData.languages.map(l => `${l.name} (${levelLabels[l.level] || l.level})`).join(' • '),
            size: 20, font: 'Calibri',
          })],
          spacing: { after: 100 },
        }));
      }

      // Projects
      if (cvData.projects.length > 0) {
        addSection('Projets');
        cvData.projects.forEach(proj => {
          children.push(new Paragraph({
            children: [new TextRun({ text: proj.name, bold: true, size: 20, font: 'Calibri' })],
            spacing: { before: 100 },
          }));
          if (proj.description) {
            children.push(new Paragraph({
              children: [new TextRun({ text: proj.description, size: 20, font: 'Calibri' })],
              indent: { left: 360 },
            }));
          }
          if (proj.technologies.length > 0) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, size: 18, italics: true, color: '888888', font: 'Calibri' })],
              indent: { left: 360 },
              spacing: { after: 50 },
            }));
          }
        });
      }

      // Certifications
      if (cvData.certifications.length > 0) {
        addSection('Certifications');
        cvData.certifications.forEach(cert => {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: ` — ${cert.issuer}`, size: 20, font: 'Calibri' }),
              new TextRun({ text: cert.date ? ` (${cert.date})` : '', size: 18, color: '888888', font: 'Calibri' }),
            ],
            spacing: { before: 50, after: 50 },
          }));
        });
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fname = cvData.personalInfo.fullName
        ? `CV-${cvData.personalInfo.fullName.replace(/\s+/g, '-')}.docx`
        : 'mon-cv.docx';
      saveAs(blob, fname);
      toast.success('CV exporté en Word !');
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error("Erreur lors de l'export Word");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToDocx, isExporting };
};
