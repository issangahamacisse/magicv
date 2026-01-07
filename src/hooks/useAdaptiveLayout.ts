import { useMemo } from 'react';
import { CVData } from '@/types/cv';

export interface AdaptiveLayoutResult {
  contentDensity: 'sparse' | 'normal' | 'dense';
  densityScore: number;
  
  // Dynamic pixel-based values for intelligent filling
  headerFontSize: string;
  titleFontSize: string;
  bodyFontSize: string;
  sectionMargin: string;
  itemMargin: string;
  contentPadding: string;
  
  // Expansion factor for spacing multiplier
  expansionFactor: number;
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
    
    // Content density classification
    let contentDensity: 'sparse' | 'normal' | 'dense';
    if (densityScore < 25) {
      contentDensity = 'sparse';
    } else if (densityScore < 55) {
      contentDensity = 'normal';
    } else {
      contentDensity = 'dense';
    }
    
    // Expansion factor: inversely proportional to content
    // Less content = more expansion to fill the page
    const expansionFactor = Math.max(1, 2.5 - (densityScore / 40));
    
    // Dynamic sizing based on density
    let headerFontSize: string;
    let titleFontSize: string;
    let bodyFontSize: string;
    let sectionMargin: string;
    let itemMargin: string;
    let contentPadding: string;
    
    if (densityScore < 20) {
      // Very sparse - maximize everything
      headerFontSize = '36px';
      titleFontSize = '16px';
      bodyFontSize = '13px';
      sectionMargin = `${Math.round(48 * expansionFactor)}px`;
      itemMargin = `${Math.round(24 * expansionFactor)}px`;
      contentPadding = `${Math.round(40 * expansionFactor)}px`;
    } else if (densityScore < 35) {
      // Sparse - enlarge moderately
      headerFontSize = '32px';
      titleFontSize = '14px';
      bodyFontSize = '12px';
      sectionMargin = `${Math.round(36 * expansionFactor)}px`;
      itemMargin = `${Math.round(20 * expansionFactor)}px`;
      contentPadding = `${Math.round(36 * expansionFactor)}px`;
    } else if (densityScore < 55) {
      // Normal
      headerFontSize = '28px';
      titleFontSize = '13px';
      bodyFontSize = '11px';
      sectionMargin = '28px';
      itemMargin = '18px';
      contentPadding = '32px';
    } else if (densityScore < 75) {
      // Dense
      headerFontSize = '24px';
      titleFontSize = '12px';
      bodyFontSize = '10px';
      sectionMargin = '20px';
      itemMargin = '14px';
      contentPadding = '24px';
    } else {
      // Very dense - compact everything
      headerFontSize = '22px';
      titleFontSize = '11px';
      bodyFontSize = '9px';
      sectionMargin = '16px';
      itemMargin = '10px';
      contentPadding = '20px';
    }
    
    return {
      contentDensity,
      densityScore,
      headerFontSize,
      titleFontSize,
      bodyFontSize,
      sectionMargin,
      itemMargin,
      contentPadding,
      expansionFactor,
    };
  }, [data]);
}
