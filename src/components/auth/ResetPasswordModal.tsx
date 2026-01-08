import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const emailSchema = z.string().email('Adresse email invalide');

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onOpenChange,
  onBackToLogin,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message);
        setError(error.message);
      } else {
        setEmailSent(true);
        toast.success('Email de réinitialisation envoyé !');
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setEmailSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {emailSent ? 'Email envoyé !' : 'Mot de passe oublié'}
          </DialogTitle>
        </DialogHeader>

        {emailSent ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. 
              Vérifiez votre boîte de réception.
            </p>
            <Button 
              onClick={onBackToLogin} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </Button>

            <Button 
              type="button"
              onClick={onBackToLogin} 
              variant="ghost" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
