import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface UseDownloadPermissionOptions {
  resumeId?: string | null;
}

export const useDownloadPermission = (options: UseDownloadPermissionOptions = {}) => {
  const { resumeId } = options;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    // If no user is logged in, redirect to auth
    if (!user) {
      toast.error('Vous devez être connecté pour télécharger votre CV');
      navigate('/auth');
      return false;
    }

    // If no resumeId, assume it's a new CV and redirect to payment
    if (!resumeId) {
      toast.error('Veuillez d\'abord sauvegarder votre CV pour le télécharger');
      return false;
    }

    setIsChecking(true);
    try {
      // Check if user can download this resume
      const { data, error } = await supabase.rpc('can_download_resume', {
        p_user_id: user.id,
        p_resume_id: resumeId
      });

      if (error) throw error;

      if (data) {
        return true;
      } else {
        toast.info('Débloquez le téléchargement pour récupérer votre CV');
        navigate(`/payment?resumeId=${resumeId}`);
        return false;
      }
    } catch (error) {
      console.error('Error checking download permission:', error);
      // On error, redirect to payment as fallback
      navigate(`/payment?resumeId=${resumeId}`);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, resumeId, navigate]);

  return { checkPermission, isChecking };
};
