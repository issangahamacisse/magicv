import React, { useState } from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Sparkles, Loader2, SpellCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIRewrite } from '@/hooks/useAIRewrite';
import AIRewriteModal from './AIRewriteModal';
import PhotoUpload from './PhotoUpload';
import { toast } from 'sonner';

// Défini en dehors pour éviter la perte de focus
const InputWithIcon = ({ 
  icon: Icon, 
  label, 
  id, 
  placeholder, 
  type = 'text',
  value,
  onChange
}: { 
  icon: React.ElementType; 
  label: string; 
  id: string; 
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-foreground/80">
      {label}
    </Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10"
      />
    </div>
  </div>
);

const PersonalInfoForm: React.FC = () => {
  const { cvData, updatePersonalInfo } = useCV();
  const { personalInfo } = cvData;
  const { rewrite, isLoading } = useAIRewrite();
  const [isSpellchecking, setIsSpellchecking] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');

  const handleAIImprove = async () => {
    if (!personalInfo.summary.trim()) return;
    
    const result = await rewrite(personalInfo.summary, 'summary');
    if (result) {
      setRewrittenText(result);
      setModalOpen(true);
    }
  };

  const handleAccept = () => {
    updatePersonalInfo('summary', rewrittenText);
    setModalOpen(false);
    setRewrittenText('');
  };

  const handleRegenerate = async () => {
    const result = await rewrite(personalInfo.summary, 'summary');
    if (result) {
      setRewrittenText(result);
    }
  };

  const handleSpellcheck = async () => {
    if (!personalInfo.summary.trim()) return;
    setIsSpellchecking(true);
    const result = await rewrite(personalInfo.summary, 'spellcheck');
    if (result) {
      updatePersonalInfo('summary', result);
      toast.success('Orthographe corrigée');
    }
    setIsSpellchecking(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Photo Upload */}
      <div className="pb-4 border-b border-border">
        <Label className="text-sm font-medium text-foreground/80 mb-2 block">
          Photo de profil
        </Label>
        <PhotoUpload />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={User}
          label="Nom complet"
          id="fullName"
          placeholder="Jean Dupont"
          value={personalInfo.fullName || ''}
          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
        />
        <InputWithIcon
          icon={User}
          label="Titre professionnel"
          id="jobTitle"
          placeholder="Développeur Full-Stack"
          value={personalInfo.jobTitle || ''}
          onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={Mail}
          label="Email"
          id="email"
          placeholder="jean.dupont@email.com"
          type="email"
          value={personalInfo.email || ''}
          onChange={(e) => updatePersonalInfo('email', e.target.value)}
        />
        <InputWithIcon
          icon={Phone}
          label="Téléphone"
          id="phone"
          placeholder="+33 6 12 34 56 78"
          value={personalInfo.phone || ''}
          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
        />
      </div>

      <InputWithIcon
        icon={MapPin}
        label="Localisation"
        id="location"
        placeholder="Paris, France"
        value={personalInfo.location || ''}
        onChange={(e) => updatePersonalInfo('location', e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={Globe}
          label="Site web (optionnel)"
          id="website"
          placeholder="https://monsite.com"
          value={personalInfo.website || ''}
          onChange={(e) => updatePersonalInfo('website', e.target.value)}
        />
        <InputWithIcon
          icon={Linkedin}
          label="LinkedIn (optionnel)"
          id="linkedin"
          placeholder="linkedin.com/in/jeandupont"
          value={personalInfo.linkedin || ''}
          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary" className="text-sm font-medium text-foreground/80">
            Résumé professionnel
          </Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleSpellcheck}
              disabled={isSpellchecking || !personalInfo.summary.trim()}
            >
              {isSpellchecking ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <SpellCheck className="h-3 w-3 mr-1" />
              )}
              Orthographe
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:text-primary/80 ai-shimmer"
              onClick={handleAIImprove}
              disabled={isLoading || !personalInfo.summary.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              Améliorer
            </Button>
          </div>
        </div>
        <Textarea
          id="summary"
          placeholder="Développeur passionné avec 5 ans d'expérience dans la création d'applications web modernes..."
          value={personalInfo.summary}
          onChange={(e) => updatePersonalInfo('summary', e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {personalInfo.summary.length}/500 caractères
        </p>
      </div>

      <AIRewriteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        originalText={personalInfo.summary}
        rewrittenText={rewrittenText}
        onAccept={handleAccept}
        onRegenerate={handleRegenerate}
        isRegenerating={isLoading}
      />
    </div>
  );
};

export default PersonalInfoForm;
