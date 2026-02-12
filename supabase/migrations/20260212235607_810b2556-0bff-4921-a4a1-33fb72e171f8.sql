
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
    SELECT * INTO v_resume FROM public.resumes WHERE id = p_resume_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'can_download', false,
            'reason', 'CV non trouvé'
        );
    END IF;
    
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.is_subscribed AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > now()) THEN
        RETURN jsonb_build_object(
            'can_download', true,
            'is_premium', true,
            'reason', 'subscription'
        );
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM public.download_permissions 
        WHERE user_id = p_user_id AND resume_id = p_resume_id
    ) THEN
        RETURN jsonb_build_object(
            'can_download', true,
            'is_premium', true,
            'reason', 'paid'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'can_download', true,
        'is_premium', false,
        'reason', 'free_with_watermark'
    );
END;
$function$;
