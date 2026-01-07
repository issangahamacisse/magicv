import { useMemo } from 'react';
import { CVData } from '@/types/cv';

export interface AdaptiveLayoutResult {
  contentDensity: 'sparse' | 'normal' | 'dense';
  densityScore: number;
  headerSize: string;
  sectionGap: string;
  itemGap: string;
  fontSize: string;
  titleSize: string;
  subtitleSize: string;
  shouldDistribute: boolean;
  containerClass: string;
}

function calculateDensity(data: CVData): number {
  let score = 0;
  
  // Personal info (20 points max)
  if (data.personalInfo.fullName) score += 3;
  if (data.personalInfo.jobTitle) score += 3;
  if (data.personalInfo.email) score += 2;
  if (data.personalInfo.phone) score += 2;
  if (data.personalInfo.location) score += 2;
  if (data.personalInfo.website) score += 1;
  if (data.personalInfo.linkedin) score += 1;
  if (data.personalInfo.summary) {
    score += Math.min(6, data.personalInfo.summary.length / 80);
  }
  
  // Experience (40 points max)
  data.experience.forEach(exp => {
    score += 4;
    if (exp.company) score += 1;
    if (exp.position) score += 1;
    if (exp.description) {
      score += Math.min(8, exp.description.length / 100);
    }
  });
  
  // Education (20 points max)
  data.education.forEach(edu => {
    score += 3;
    if (edu.institution) score += 1;
    if (edu.degree) score += 1;
    if (edu.description) {
      score += Math.min(3, edu.description.length / 100);
    }
  });
  
  // Skills (10 points max)
  score += Math.min(10, data.skills.length * 1.5);
  
  // Languages (10 points max)
  score += Math.min(10, data.languages.length * 2.5);
  
  return Math.min(100, score);
}

export function useAdaptiveLayout(data: CVData): AdaptiveLayoutResult {
  return useMemo(() => {
    const densityScore = calculateDensity(data);
    
    // Sparse: < 25, Normal: 25-55, Dense: > 55
    let contentDensity: 'sparse' | 'normal' | 'dense';
    let headerSize: string;
    let sectionGap: string;
    let itemGap: string;
    let fontSize: string;
    let titleSize: string;
    let subtitleSize: string;
    let shouldDistribute: boolean;
    
    if (densityScore < 25) {
      // Très peu de contenu - agrandir tout et distribuer
      contentDensity = 'sparse';
      headerSize = 'text-4xl';
      titleSize = 'text-lg';
      subtitleSize = 'text-base';
      sectionGap = 'gap-8';
      itemGap = 'gap-6';
      fontSize = 'text-[12px]';
      shouldDistribute = true;
    } else if (densityScore < 55) {
      // Contenu normal
      contentDensity = 'normal';
      headerSize = 'text-3xl';
      titleSize = 'text-base';
      subtitleSize = 'text-sm';
      sectionGap = 'gap-6';
      itemGap = 'gap-4';
      fontSize = 'text-[11px]';
      shouldDistribute = densityScore < 40;
    } else {
      // Beaucoup de contenu - compacter
      contentDensity = 'dense';
      headerSize = 'text-2xl';
      titleSize = 'text-sm';
      subtitleSize = 'text-xs';
      sectionGap = 'gap-4';
      itemGap = 'gap-3';
      fontSize = 'text-[10px]';
      shouldDistribute = false;
    }
    
    const containerClass = shouldDistribute 
      ? 'flex flex-col justify-between h-full' 
      : 'flex flex-col h-full';
    
    return {
      contentDensity,
      densityScore,
      headerSize,
      sectionGap,
      itemGap,
      fontSize,
      titleSize,
      subtitleSize,
      shouldDistribute,
      containerClass,
    };
  }, [data]);
}
