import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Crown, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCV } from '@/context/CVContext';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface AISmartFillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISmartFillModal: React.FC<AISmartFillModalProps> = ({ open, onOpenChange }) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { importCVData } = useCV();
  const { user } = useAuth();

  const handleSmartFill = async () => {
    if (!rawText.trim()) {
      toast.error('Veuillez coller du texte à analyser');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour utiliser cette fonctionnalité');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-rewrite', {
        body: { text: rawText, action: 'smart-fill' }
      });

      if (error) {
        console.error('Smart fill error:', error);
        toast.error('Erreur lors du traitement par l\'IA');
        return;
      }

      if (data?.error) {
        if (data.requiresPayment) {
          toast.error(data.error, {
            action: {
              label: 'Acheter des crédits',
              onClick: () => window.location.href = '/payment',
            },
          });
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.cvData) {
        // Add IDs to arrays
        const addIds = (items: any[]) =>
          items?.map((item: any) => ({ ...item, id: crypto.randomUUID() })) || [];

        const importData: any = {};

        if (data.cvData.personalInfo) {
          importData.personalInfo = data.cvData.personalInfo;
        }
        if (data.cvData.experience?.length) {
          importData.experience = addIds(data.cvData.experience);
        }
        if (data.cvData.education?.length) {
          importData.education = addIds(data.cvData.education);
        }
        if (data.cvData.skills?.length) {
          importData.skills = addIds(data.cvData.skills);
        }
        if (data.cvData.languages?.length) {
          importData.languages = addIds(data.cvData.languages);
        }

        importCVData(importData);
        toast.success('CV rempli avec succès à partir de votre texte !');
        setRawText('');
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Smart fill error:', err);
      toast.error('Erreur lors de la communication avec l\'IA');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Remplissage intelligent par IA
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          </DialogTitle>
          <DialogDescription>
            Collez votre texte brut (parcours, expériences, compétences...) et l'IA va automatiquement corriger, reformuler et remplir votre CV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Écrivez librement votre parcours : nom, poste, expériences, formations, compétences... L'IA se charge de tout structurer et corriger.
            </p>
          </div>

          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Exemple :\n\nJe m'appelle Amadou Diallo, je suis développeur web à Niamey. J'ai travaillé chez TechCorp pendant 3 ans comme développeur fullstack où j'ai créé des applications web. Avant ça j'étais stagiaire chez StartupXYZ. J'ai un master en informatique de l'Université de Niamey. Je parle français et anglais. Je connais React, Node.js, Python...`}
            className="min-h-[250px] text-sm resize-none"
          />

          <p className="text-xs text-muted-foreground">
            {rawText.length} caractères • Minimum 50 caractères recommandés
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSmartFill}
            disabled={isProcessing || rawText.trim().length < 20}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Remplir mon CV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISmartFillModal;
