import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseDownloadPermissionOptions {
  resumeId?: string | null;
}

interface DownloadPermissionResult {
  canDownload: boolean;
  isPremium: boolean;
  usedAiImport: boolean;
  reason: string;
}

export const useDownloadPermission = (options: UseDownloadPermissionOptions = {}) => {
  const { resumeId } = options;
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check download permission for the CV
   * Returns:
   * - canDownload: true if user can download (free with watermark OR premium)
   * - isPremium: true if user can download without watermark (paid/subscribed)
   * - usedAiImport: true if CV was created using AI import (requires payment, no free option)
   * - reason: explanation of the permission status
   */
  const checkPermission = useCallback(async (): Promise<DownloadPermissionResult> => {
    // Not logged in = free download with watermark (manual CVs only)
    if (!user) {
      return { 
        canDownload: true, 
        isPremium: false, 
        usedAiImport: false,
        reason: 'anonymous'
      };
    }

    // No resumeId = new CV, free download with watermark
    if (!resumeId) {
      return { 
        canDownload: true, 
        isPremium: false, 
        usedAiImport: false,
        reason: 'new_cv'
      };
    }

    setIsChecking(true);
    try {
      // Check download permission using the updated RPC function
      const { data, error } = await supabase.rpc('can_download_resume', {
        p_user_id: user.id,
        p_resume_id: resumeId
      });

      if (error) throw error;

      // The function now returns a JSONB object
      const result = data as {
        can_download: boolean;
        is_premium: boolean;
        used_ai_import: boolean;
        reason: string;
      };

      return { 
        canDownload: result.can_download, 
        isPremium: result.is_premium,
        usedAiImport: result.used_ai_import,
        reason: result.reason
      };
    } catch (error) {
      console.error('Error checking download permission:', error);
      // On error, allow download with watermark (for manual CVs)
      return { 
        canDownload: true, 
        isPremium: false, 
        usedAiImport: false,
        reason: 'error_fallback'
      };
    } finally {
      setIsChecking(false);
    }
  }, [user, resumeId]);

  return { checkPermission, isChecking };
};
