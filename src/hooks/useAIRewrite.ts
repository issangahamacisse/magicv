import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ActionType = 'summary' | 'bullets' | 'education' | 'spellcheck';

export function useAIRewrite() {
  const [isLoading, setIsLoading] = useState(false);

  const rewrite = async (text: string, action: ActionType): Promise<string | null> => {
    if (!text.trim()) {
      toast.error('Veuillez entrer du texte à améliorer');
      return null;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-rewrite', {
        body: { text, action }
      });

      if (error) {
        console.error('AI rewrite error:', error);
        toast.error('Erreur lors de la reformulation');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      return data?.rewrittenText || null;
    } catch (err) {
      console.error('AI rewrite error:', err);
      toast.error('Erreur lors de la communication avec l\'IA');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { rewrite, isLoading };
}
