import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ChevronRight, 
  Check, 
  Lock,
  Sparkles,
  FileText,
  Wand2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

interface ResumeScorePanelProps {
  score?: number;
  issues?: Issue[];
  quickWins?: QuickWin[];
  onFixIssue?: (issueId: string) => void;
  onAutoFix?: () => void;
}

const ResumeScorePanel: React.FC<ResumeScorePanelProps> = ({
  score = 72,
  issues = [
    { id: '1', type: 'critical', title: 'Coordonnées manquantes', description: 'Les recruteurs ont besoin d\'un moyen de vous contacter.' },
    { id: '2', type: 'warning', title: 'Résumé trop court', description: 'Visez au moins 3 phrases.' },
  ],
  quickWins = [
    { id: '1', title: 'Police cohérente', completed: true },
    { id: '2', title: 'Ajouter URL LinkedIn', completed: false, action: 'Corriger' },
    { id: '3', title: 'Ajouter photo de profil', completed: false, action: 'Ajouter' },
  ],
  onFixIssue,
  onAutoFix,
}) => {
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
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 352} 352`}
              />
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
            Corrigez {criticalCount} problème{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''} pour atteindre 85+.
          </span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Critical Issues */}
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
                <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  issue.type === 'critical' ? 'text-destructive' : 'text-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Wins */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Gains rapides</h3>
            <span className="text-xs text-muted-foreground">
              {completedWins}/{quickWins.length} fait
            </span>
          </div>
          <div className="space-y-2">
            {quickWins.map((win) => (
              <div
                key={win.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  win.completed ? 'bg-emerald-500' : 'bg-muted'
                }`}>
                  {win.completed && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={`flex-1 text-sm ${win.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {win.title}
                </span>
                {!win.completed && win.action && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    {win.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium">Insights Premium</h3>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Optimisation mots-clés ATS</p>
                <p className="text-xs text-muted-foreground">3 termes clés manquants pour votre poste.</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Débloquer
              </Button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border opacity-60">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Réécriture du résumé</p>
                <p className="text-xs text-muted-foreground">Résumé professionnel suggéré par l'IA.</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={onAutoFix}
          className="w-full gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Corriger automatiquement
        </Button>
      </div>
    </div>
  );
};

export default ResumeScorePanel;
