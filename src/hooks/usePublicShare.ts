import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const generateSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
};

export const usePublicShare = (resumeId: string | null) => {
  const [isPublic, setIsPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPublicStatus = useCallback(async () => {
    if (!resumeId) return;
    const { data } = await supabase
      .from('resumes')
      .select('is_public, public_slug')
      .eq('id', resumeId)
      .single();
    
    if (data) {
      setIsPublic((data as any).is_public ?? false);
      setPublicSlug((data as any).public_slug ?? null);
    }
  }, [resumeId]);

  const togglePublic = useCallback(async () => {
    if (!resumeId) return;
    setIsLoading(true);

    try {
      const newIsPublic = !isPublic;
      const slug = newIsPublic && !publicSlug ? generateSlug() : publicSlug;

      const { error } = await supabase
        .from('resumes')
        .update({ 
          is_public: newIsPublic, 
          public_slug: slug 
        } as Record<string, unknown>)
        .eq('id', resumeId);

      if (error) throw error;

      setIsPublic(newIsPublic);
      setPublicSlug(slug);

      if (newIsPublic) {
        toast.success('CV rendu public ! Lien copié.');
        const url = `${window.location.origin}/cv/${slug}`;
        await navigator.clipboard.writeText(url).catch(() => {});
      } else {
        toast.success('CV rendu privé');
      }
    } catch (error) {
      console.error('Toggle public error:', error);
      toast.error('Erreur lors du changement de visibilité');
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, isPublic, publicSlug]);

  const getPublicUrl = useCallback(() => {
    if (!publicSlug) return null;
    return `${window.location.origin}/cv/${publicSlug}`;
  }, [publicSlug]);

  return { isPublic, publicSlug, isLoading, loadPublicStatus, togglePublic, getPublicUrl };
};
