-- D'abord supprimer l'ancienne fonction qui retourne boolean
DROP FUNCTION IF EXISTS public.can_download_resume(uuid, uuid);

-- Recréer la fonction avec le type de retour jsonb
CREATE OR REPLACE FUNCTION public.can_download_resume(p_user_id uuid, p_resume_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_profile RECORD;
    v_resume RECORD;
BEGIN
    -- Get resume details
    SELECT * INTO v_resume FROM public.resumes WHERE id = p_resume_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'can_download', false,
            'is_premium', false,
            'used_ai_import', false,
            'reason', 'CV non trouvé'
        );
    END IF;
    
    -- Check if subscribed
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.is_subscribed AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > now()) THEN
        RETURN jsonb_build_object(
            'can_download', true,
            'is_premium', true,
            'used_ai_import', v_resume.used_ai_import,
            'reason', 'subscription'
        );
    END IF;
    
    -- Check if has download permission for this resume
    IF EXISTS (
        SELECT 1 FROM public.download_permissions 
        WHERE user_id = p_user_id AND resume_id = p_resume_id
    ) THEN
        RETURN jsonb_build_object(
            'can_download', true,
            'is_premium', true,
            'used_ai_import', v_resume.used_ai_import,
            'reason', 'paid'
        );
    END IF;
    
    -- If AI import was used, payment is required (no free option)
    IF v_resume.used_ai_import THEN
        RETURN jsonb_build_object(
            'can_download', false,
            'is_premium', false,
            'used_ai_import', true,
            'reason', 'ai_import_requires_payment'
        );
    END IF;
    
    -- Manual CV: free download with watermark allowed
    RETURN jsonb_build_object(
        'can_download', true,
        'is_premium', false,
        'used_ai_import', false,
        'reason', 'free_with_watermark'
    );
END;
$function$;