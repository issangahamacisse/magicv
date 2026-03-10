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

// Minimum print-safe sizes (in px)
const MIN_BODY = 10;
const MIN_TITLE = 11;
const MIN_HEADER = 20;

// Maximum sizes for sparse content
const MAX_BODY = 14;
const MAX_TITLE = 18;
const MAX_HEADER = 38;

function lerp(min: number, max: number, t: number): number {
  return Math.round(min + (max - min) * t);
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
    
    // t goes from 1 (empty) to 0 (very full) — controls how much to expand
    const t = Math.max(0, Math.min(1, 1 - densityScore / 80));
    
    // Expansion factor for spacing multiplier
    const expansionFactor = 1 + t * 1.8;
    
    // Font sizes: lerp between min (dense) and max (sparse), always print-safe
    const headerFontSize = `${lerp(MIN_HEADER, MAX_HEADER, t)}px`;
    const titleFontSize = `${lerp(MIN_TITLE, MAX_TITLE, t)}px`;
    const bodyFontSize = `${lerp(MIN_BODY, MAX_BODY, t)}px`;
    
    // Spacing: base values scaled by expansion
    const sectionMargin = `${Math.round(lerp(16, 48, t) * Math.min(expansionFactor, 2.2))}px`;
    const itemMargin = `${Math.round(lerp(10, 24, t) * Math.min(expansionFactor, 2))}px`;
    const contentPadding = `${Math.round(lerp(20, 42, t) * Math.min(expansionFactor, 2))}px`;
    
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
