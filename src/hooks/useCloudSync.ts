import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CVData } from '@/types/cv';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface UseCloudSyncOptions {
  cvData: CVData;
  onDataLoaded?: (data: CVData) => void;
}

export const useCloudSync = ({ cvData, onDataLoaded }: UseCloudSyncOptions) => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const lastSyncedRef = useRef<string>('');
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Load user's resumes on login
  useEffect(() => {
    if (user) {
      loadLatestResume();
      setIsCloudEnabled(true);
    } else {
      setCurrentResumeId(null);
      setIsCloudEnabled(false);
    }
  }, [user]);

  // Auto-sync to cloud when data changes (debounced)
  useEffect(() => {
    if (!user || !isCloudEnabled) return;

    const dataString = JSON.stringify(cvData);
    if (dataString === lastSyncedRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToCloud(cvData);
    }, 2000); // 2 second debounce

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cvData, user, isCloudEnabled]);

  const loadLatestResume = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('resumes')
      .select('id, content, theme_config')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not "no rows returned"
        console.error('Error loading resume:', error);
      }
      return;
    }

    if (data && onDataLoaded) {
      setCurrentResumeId(data.id);
      const content = data.content as Record<string, unknown>;
      const themeConfig = data.theme_config as Record<string, unknown>;
      
      // Merge loaded data with theme
      const loadedData = {
        ...content,
        theme: themeConfig,
      } as unknown as CVData;
      
      lastSyncedRef.current = JSON.stringify(loadedData);
      onDataLoaded(loadedData);
    }
  }, [user, onDataLoaded]);

  const syncToCloud = useCallback(async (data: CVData) => {
    if (!user) return;

    setIsSyncing(true);

    const { theme, ...content } = data;
    const title = data.personalInfo.fullName 
      ? `CV - ${data.personalInfo.fullName}`
      : 'Mon CV';

    // Convert to JSON-compatible format
    const contentJson = JSON.parse(JSON.stringify(content)) as Json;
    const themeJson = JSON.parse(JSON.stringify(theme)) as Json;

    try {
      if (currentResumeId) {
        // Update existing resume
        const { error } = await supabase
          .from('resumes')
          .update({
            title,
            content: contentJson,
            theme_config: themeJson,
          })
          .eq('id', currentResumeId);

        if (error) throw error;
      } else {
        // Create new resume
        const { data: newResume, error } = await supabase
          .from('resumes')
          .insert([{
            user_id: user.id,
            title,
            content: contentJson,
            theme_config: themeJson,
          }])
          .select('id')
          .single();

        if (error) throw error;
        if (newResume) {
          setCurrentResumeId(newResume.id);
        }
      }

      lastSyncedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, currentResumeId]);

  const forceSyncNow = useCallback(() => {
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder dans le cloud');
      return;
    }
    syncToCloud(cvData);
    toast.success('CV synchronisé');
  }, [user, cvData, syncToCloud]);

  return {
    isSyncing,
    isCloudEnabled,
    currentResumeId,
    forceSyncNow,
    loadLatestResume,
  };
};
