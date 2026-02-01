import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseDownloadPermissionOptions {
  resumeId?: string | null;
}

interface DownloadPermissionResult {
  canDownload: boolean;
  isPremium: boolean;
}

export const useDownloadPermission = (options: UseDownloadPermissionOptions = {}) => {
  const { resumeId } = options;
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check if user has premium download permission (no watermark)
   * Returns: { canDownload: always true, isPremium: true if paid/subscribed }
   */
  const checkPermission = useCallback(async (): Promise<DownloadPermissionResult> => {
    // Everyone can download, but we need to check if they get watermark-free version
    
    // Not logged in = free download with watermark
    if (!user) {
      return { canDownload: true, isPremium: false };
    }

    // No resumeId = new CV, free download with watermark
    if (!resumeId) {
      return { canDownload: true, isPremium: false };
    }

    setIsChecking(true);
    try {
      // Check if user has premium access (subscription or paid for this CV)
      const { data, error } = await supabase.rpc('can_download_resume', {
        p_user_id: user.id,
        p_resume_id: resumeId
      });

      if (error) throw error;

      return { canDownload: true, isPremium: !!data };
    } catch (error) {
      console.error('Error checking download permission:', error);
      // On error, allow download with watermark
      return { canDownload: true, isPremium: false };
    } finally {
      setIsChecking(false);
    }
  }, [user, resumeId]);

  return { checkPermission, isChecking };
};
