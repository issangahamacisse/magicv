import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ChevronRight, 
  Check, 
  Lock,
  Sparkles,
  FileText,
  Wand2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { toast } from 'sonner';

interface Issue {
  id: string;
  type: 'critical' | 'warning';
  title: string;
  description: string;
}

interface QuickWin {
  id: string;
  title: string;
  completed: boolean;
  action?: string;
}

interface ATSKeyword {
  keyword: string;
  importance: 'high' | 'medium';
  reason: string;
}

interface ATSResult {
  ats_score: number;
  missing_keywords: ATSKeyword[];
  suggestions: string[];
}

interface ResumeScorePanelProps {
  score?: number;
  issues?: Issue[];
  quickWins?: QuickWin[];
  onFixIssue?: (issueId: string) => void;
  onQuickWinAction?: (quickWinId: string) => void;
  onAutoFix?: () => void;
}

const ResumeScorePanel: React.FC<ResumeScorePanelProps> = ({
  score = 72,
  issues = [],
  quickWins = [],
  onFixIssue,
  onQuickWinAction,
  onAutoFix,
}) => {
  const { user } = useAuth();
  const { cvData, setCVData } = useCV();
  const [atsLoading, setAtsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  const completedWins = quickWins.filter(w => w.completed).length;
  const criticalCount = issues.filter(i => i.type === 'critical').length;

  const getScoreColor = () => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  const getScoreLabel = () => {
    if (score >= 85) return 'Excellent !';
    if (score >= 60) return 'Bon début !';
    return 'À améliorer';
  };

  const cvJsonText = JSON.stringify({
    personalInfo: cvData.personalInfo,
    experience: cvData.experience,
    education: cvData.education,
    skills: cvData.skills,
    languages: cvData.languages,
    projects: cvData.projects,
    certifications: cvData.certifications,
  });

  const handleATSAnalysis = async () => {
    if (!user) {
      toast.error('Connectez-vous pour utiliser cette fonctionnalité');
      return;
    }

    setAtsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rewrite', {
        body: { text: cvJsonText, action: 'ats-keywords' }
      });

      if (error) {
        if (error.message?.includes('402')) {
          toast.error('Cette fonctionnalité est réservée aux utilisateurs premium.');
          return;
        }
        throw error;
      }

      if (data?.error) {
        if (data.requiresPayment) {
          toast.error(data.error);
          return;
        }
        throw new Error(data.error);
      }

      if (data?.atsData) {
        setAtsResult(data.atsData);
        toast.success('Analyse ATS terminée !');
      }
    } catch (err) {
      console.error('ATS analysis error:', err);
      toast.error('Erreur lors de l\'analyse ATS');
    } finally {
      setAtsLoading(false);
    }
  };

  const handleSummaryRewrite = async () => {
    if (!user) {
      toast.error('Connectez-vous pour utiliser cette fonctionnalité');
      return;
    }

    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rewrite', {
        body: { text: cvJsonText, action: 'rewrite-summary' }
      });

      if (error) {
        if (error.message?.includes('402')) {
          toast.error('Cette fonctionnalité est réservée aux utilisateurs premium.');
          return;
        }
        throw error;
      }

      if (data?.error) {
        if (data.requiresPayment) {
          toast.error(data.error);
          return;
        }
        throw new Error(data.error);
      }

      if (data?.rewrittenText) {
        setGeneratedSummary(data.rewrittenText);
        toast.success('Résumé professionnel généré !');
      }
    } catch (err) {
      console.error('Summary rewrite error:', err);
      toast.error('Erreur lors de la génération du résumé');
    } finally {
      setSummaryLoading(false);
    }
  };

  const applySummary = () => {
    if (!generatedSummary) return;
    setCVData({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        summary: generatedSummary,
      },
    });
    setGeneratedSummary(null);
    toast.success('Résumé appliqué à votre CV !');
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Score du CV</h2>
        <div className={`text-2xl font-bold ${getScoreColor()}`}>
          {score}<span className="text-sm font-normal text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Score visualization */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--primary))" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * 352} 352`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          </div>
        </div>
        <p className="text-center">
          <span className={`font-medium ${getScoreColor()}`}>{getScoreLabel()}</span>
          <br />
          <span className="text-sm text-muted-foreground">
            {criticalCount > 0
              ? `Corrigez ${criticalCount} problème${criticalCount > 1 ? 's' : ''} critique${criticalCount > 1 ? 's' : ''} pour atteindre 85+.`
              : 'Votre CV est en bonne voie !'}
          </span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Critical Issues */}
        {issues.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Problèmes critiques</h3>
              <span className="text-xs text-destructive font-medium">
                {criticalCount} trouvé{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {issues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => onFixIssue?.(issue.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${issue.type === 'critical' ? 'text-destructive' : 'text-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Wins */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Gains rapides</h3>
            <span className="text-xs text-muted-foreground">{completedWins}/{quickWins.length} fait</span>
          </div>
          <div className="space-y-2">
            {quickWins.map((win) => (
              <div key={win.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${win.completed ? 'bg-emerald-500' : 'bg-muted'}`}>
                  {win.completed && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={`flex-1 text-sm ${win.completed ? 'line-through text-muted-foreground' : ''}`}>{win.title}</span>
                {!win.completed && win.action && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onQuickWinAction?.(win.id)}>
                    {win.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Insights - ATS Keywords */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium">Insights Premium</h3>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="space-y-2">
            {/* ATS Keywords */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Optimisation mots-clés ATS</p>
                  <p className="text-xs text-muted-foreground">
                    {atsResult
                      ? `Score ATS : ${atsResult.ats_score}/100 · ${atsResult.missing_keywords.length} mots-clés manquants`
                      : 'Analysez votre CV pour identifier les mots-clés manquants.'}
                  </p>
                </div>
                {!atsResult && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleATSAnalysis} disabled={atsLoading}>
                    {atsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyser'}
                  </Button>
                )}
              </div>
              
              {/* ATS Results */}
              {atsResult && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missing_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          kw.importance === 'high'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                        title={kw.reason}
                      >
                        {kw.keyword}
                      </span>
                    ))}
                  </div>
                  {atsResult.suggestions.length > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border">
                      {atsResult.suggestions.map((s, i) => (
                        <p key={i} className="flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                          {s}
                        </p>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => setAtsResult(null)}>
                    Relancer l'analyse
                  </Button>
                </div>
              )}
            </div>

            {/* Summary Rewrite */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Réécriture du résumé</p>
                  <p className="text-xs text-muted-foreground">
                    {generatedSummary
                      ? 'Résumé professionnel généré. Cliquez pour l\'appliquer.'
                      : 'Générez un résumé professionnel optimisé par l\'IA.'}
                  </p>
                </div>
                {!generatedSummary && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleSummaryRewrite} disabled={summaryLoading}>
                    {summaryLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Générer'}
                  </Button>
                )}
              </div>

              {/* Generated Summary */}
              {generatedSummary && (
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-xs text-foreground bg-muted/50 rounded-md p-2 leading-relaxed">
                    {generatedSummary}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs flex-1" onClick={applySummary}>
                      Appliquer au CV
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setGeneratedSummary(null)}>
                      Ignorer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button onClick={onAutoFix} className="w-full gap-2">
          <Wand2 className="h-4 w-4" />
          Corriger automatiquement
        </Button>
      </div>
    </div>
  );
};

export default ResumeScorePanel;
