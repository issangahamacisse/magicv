import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Loader2,
  Gift,
  Crown
} from 'lucide-react';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const resumeId = searchParams.get('resumeId');
  
  const [paymentType, setPaymentType] = useState<'download' | 'subscription'>('download');
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'moov'>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const prices = {
    download: 1000,
    subscription: 3000,
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Veuillez entrer un code coupon');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour utiliser un coupon');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const { data, error } = await supabase.rpc('use_coupon', {
        coupon_code: couponCode.trim().toUpperCase(),
        p_resume_id: resumeId || null
      });

      if (error) throw error;

      const result = data as { success: boolean; credits_added?: number; error?: string } | null;

      if (result?.success) {
        toast.success(`Coupon appliqué ! ${result.credits_added} crédit(s) IA ajouté(s).`);
        navigate('/editor');
      } else {
        toast.error(result?.error || 'Code coupon invalide');
      }
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error('Erreur lors de l\'application du coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour effectuer un paiement');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        amount: prices[paymentType],
        payment_type: paymentType,
        payment_method: paymentMethod === 'orange' ? 'Orange Money' : 'Moov Money',
        phone_number: phoneNumber,
        resume_id: resumeId || null,
        status: 'pending'
      });

      if (error) throw error;

      setPaymentSubmitted(true);
      toast.success('Demande de paiement envoyée !');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Demande envoyée !</CardTitle>
            <CardDescription>
              Votre demande de paiement a été enregistrée. 
              Effectuez le transfert aux numéros indiqués ci-dessous.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Montant:</strong> {prices[paymentType]} FCFA</p>
              <p><strong>Orange Money:</strong> 07 07 07 07 07</p>
              <p><strong>Moov Money:</strong> 05 05 05 05 05</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Une fois le paiement confirmé, votre CV sera débloqué et vous recevrez vos crédits IA.
              La validation peut prendre quelques minutes.
            </p>
            <Button onClick={() => navigate('/editor')} className="w-full">
              Retour à l'éditeur
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Débloquez votre CV</h1>
          <p className="text-muted-foreground">
            Choisissez une option pour télécharger votre CV en PDF
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Download Option */}
          <Card 
            className={`cursor-pointer transition-all ${paymentType === 'download' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setPaymentType('download')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CreditCard className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">{prices.download} F</span>
              </div>
              <CardTitle>Téléchargement unique</CardTitle>
              <CardDescription>
                Téléchargez ce CV en PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Téléchargement PDF illimité pour ce CV
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  1 crédit IA inclus
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Subscription Option */}
          <Card 
            className={`cursor-pointer transition-all ${paymentType === 'subscription' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setPaymentType('subscription')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Crown className="h-8 w-8 text-amber-500" />
                <div className="text-right">
                  <span className="text-2xl font-bold">{prices.subscription} F</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
              </div>
              <CardTitle>Abonnement Premium</CardTitle>
              <CardDescription>
                Accès illimité pendant 30 jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Téléchargements illimités
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  3 crédits IA inclus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Tous les templates premium
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Paiement Mobile Money
            </CardTitle>
            <CardDescription>
              Effectuez un transfert vers l'un de nos numéros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Numbers */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="font-semibold text-orange-700 dark:text-orange-400 mb-1">Orange Money</p>
                <p className="text-2xl font-mono">07 07 07 07 07</p>
                <p className="text-sm text-muted-foreground mt-1">Nom: MagiCV</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Moov Money</p>
                <p className="text-2xl font-mono">05 05 05 05 05</p>
                <p className="text-sm text-muted-foreground mt-1">Nom: MagiCV</p>
              </div>
            </div>

            <Separator />

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Méthode de paiement utilisée</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'orange' | 'moov')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="orange" id="orange" />
                  <Label htmlFor="orange">Orange Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moov" id="moov" />
                  <Label htmlFor="moov">Moov Money</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone utilisé pour le paiement</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="07 XX XX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSubmitPayment} 
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Confirmer le paiement de {prices[paymentType]} F
                </>
              )}
            </Button>

            <Separator />

            {/* Coupon Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Vous avez un code promo ?
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez votre code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Appliquer'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payment;
