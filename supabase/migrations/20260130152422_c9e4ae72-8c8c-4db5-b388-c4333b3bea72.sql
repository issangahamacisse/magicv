-- Add monetization columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_subscribed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS free_usage_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles (only admins can see roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create payments table
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    payment_type text NOT NULL CHECK (payment_type IN ('download', 'subscription')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
    payment_method text,
    proof_url text,
    phone_number text,
    resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
    validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    validated_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only admins can update payments
CREATE POLICY "Admins can update payments"
ON public.payments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create coupons table
CREATE TABLE public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    credit_amount integer NOT NULL DEFAULT 1,
    max_uses integer NOT NULL DEFAULT 1,
    used_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- Only admins can manage coupons
CREATE POLICY "Admins can insert coupons"
ON public.coupons
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coupons"
ON public.coupons
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons"
ON public.coupons
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create coupon_uses table to track usage
CREATE TABLE public.coupon_uses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    used_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (coupon_id, user_id)
);

ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupon uses"
ON public.coupon_uses
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can use coupons"
ON public.coupon_uses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create download_permissions table
CREATE TABLE public.download_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    granted_by text NOT NULL CHECK (granted_by IN ('payment', 'coupon', 'subscription', 'admin')),
    UNIQUE (user_id, resume_id)
);

ALTER TABLE public.download_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions"
ON public.download_permissions
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage permissions"
ON public.download_permissions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate payment and grant credits
CREATE OR REPLACE FUNCTION public.validate_payment(payment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payment RECORD;
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RETURN false;
    END IF;
    
    -- Get payment details
    SELECT * INTO v_payment FROM public.payments WHERE id = payment_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Update payment status
    UPDATE public.payments 
    SET status = 'validated', 
        validated_by = auth.uid(), 
        validated_at = now()
    WHERE id = payment_id;
    
    -- Grant credits based on payment type
    IF v_payment.payment_type = 'download' THEN
        -- Add 1 AI credit
        UPDATE public.profiles 
        SET credits_ai = credits_ai + 1
        WHERE user_id = v_payment.user_id;
        
        -- Grant download permission for the resume
        IF v_payment.resume_id IS NOT NULL THEN
            INSERT INTO public.download_permissions (user_id, resume_id, granted_by)
            VALUES (v_payment.user_id, v_payment.resume_id, 'payment')
            ON CONFLICT (user_id, resume_id) DO NOTHING;
        END IF;
    ELSIF v_payment.payment_type = 'subscription' THEN
        -- Set subscription and add 3 AI credits
        UPDATE public.profiles 
        SET is_subscribed = true, 
            credits_ai = credits_ai + 3,
            subscription_expires_at = now() + interval '30 days'
        WHERE user_id = v_payment.user_id;
    END IF;
    
    RETURN true;
END;
$$;

-- Function to use coupon
CREATE OR REPLACE FUNCTION public.use_coupon(coupon_code text, p_resume_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon RECORD;
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Non authentifié');
    END IF;
    
    -- Get coupon
    SELECT * INTO v_coupon 
    FROM public.coupons 
    WHERE code = coupon_code 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND used_count < max_uses;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Code coupon invalide ou expiré');
    END IF;
    
    -- Check if user already used this coupon
    IF EXISTS (SELECT 1 FROM public.coupon_uses WHERE coupon_id = v_coupon.id AND user_id = v_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vous avez déjà utilisé ce coupon');
    END IF;
    
    -- Use coupon
    INSERT INTO public.coupon_uses (coupon_id, user_id) VALUES (v_coupon.id, v_user_id);
    
    -- Increment used_count
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
    
    -- Add credits
    UPDATE public.profiles SET credits_ai = credits_ai + v_coupon.credit_amount WHERE user_id = v_user_id;
    
    -- Grant download permission if resume_id provided
    IF p_resume_id IS NOT NULL THEN
        INSERT INTO public.download_permissions (user_id, resume_id, granted_by)
        VALUES (v_user_id, p_resume_id, 'coupon')
        ON CONFLICT (user_id, resume_id) DO NOTHING;
    END IF;
    
    RETURN jsonb_build_object('success', true, 'credits_added', v_coupon.credit_amount);
END;
$$;

-- Function to check if user can use AI (free quota or credits)
CREATE OR REPLACE FUNCTION public.can_use_ai(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Profil non trouvé');
    END IF;
    
    -- Check if subscribed
    IF v_profile.is_subscribed AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > now()) THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'subscription');
    END IF;
    
    -- Check if has credits
    IF v_profile.credits_ai > 0 THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'credits', 'remaining', v_profile.credits_ai);
    END IF;
    
    -- Check free quota (2 free uses)
    IF v_profile.free_usage_count < 2 THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'free_quota', 'remaining', 2 - v_profile.free_usage_count);
    END IF;
    
    RETURN jsonb_build_object('allowed', false, 'reason', 'Quota gratuit épuisé. Achetez des crédits.');
END;
$$;

-- Function to consume AI usage
CREATE OR REPLACE FUNCTION public.consume_ai_usage(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- If subscribed, don't consume anything
    IF v_profile.is_subscribed AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > now()) THEN
        RETURN true;
    END IF;
    
    -- If has credits, consume one
    IF v_profile.credits_ai > 0 THEN
        UPDATE public.profiles SET credits_ai = credits_ai - 1 WHERE user_id = p_user_id;
        RETURN true;
    END IF;
    
    -- If free quota available, consume it
    IF v_profile.free_usage_count < 2 THEN
        UPDATE public.profiles SET free_usage_count = free_usage_count + 1 WHERE user_id = p_user_id;
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- Function to check download permission
CREATE OR REPLACE FUNCTION public.can_download_resume(p_user_id uuid, p_resume_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
BEGIN
    -- Check if subscribed
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.is_subscribed AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > now()) THEN
        RETURN true;
    END IF;
    
    -- Check if has download permission for this resume
    RETURN EXISTS (
        SELECT 1 FROM public.download_permissions 
        WHERE user_id = p_user_id AND resume_id = p_resume_id
    );
END;
$$;