import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft, CloudUpload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SavePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const SavePromptModal: React.FC<SavePromptModalProps> = ({ 
  open, 
  onOpenChange,
  onContinueAsGuest 
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', { mode, email, password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <CloudUpload className="h-8 w-8 text-primary" />
            </div>
          </div>

          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-semibold">
              Sauvegardez votre CV
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Créez un compte gratuit pour télécharger votre PDF, synchroniser sur tous vos appareils et débloquer les modèles premium.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-6">
            <Button 
              variant={mode === 'signup' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setMode('signup')}
            >
              Inscription
            </Button>
            <Button 
              variant={mode === 'login' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setMode('login')}
            >
              Connexion
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saveEmail">Adresse email</Label>
              <Input
                id="saveEmail"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="savePassword">Mot de passe</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="savePassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">
                  Au moins 8 caractères
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              {mode === 'signup' ? 'Créer un compte' : 'Se connecter'}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              Ou continuer avec
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => console.log('Google')}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => console.log('Apple')}
            >
              Apple
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Déjà créé un CV ? Nous le lierons automatiquement.
          </p>

          <button
            onClick={onContinueAsGuest}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="underline">Continuer en invité</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavePromptModal;
