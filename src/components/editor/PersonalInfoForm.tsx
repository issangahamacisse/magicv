import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PersonalInfoForm: React.FC = () => {
  const { cvData, updatePersonalInfo } = useCV();
  const { personalInfo } = cvData;

  const InputWithIcon = ({ 
    icon: Icon, 
    label, 
    field, 
    placeholder, 
    type = 'text' 
  }: { 
    icon: React.ElementType; 
    label: string; 
    field: string; 
    placeholder: string;
    type?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium text-foreground/80">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={field}
          type={type}
          placeholder={placeholder}
          value={personalInfo[field as keyof typeof personalInfo] || ''}
          onChange={(e) => updatePersonalInfo(field, e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={User}
          label="Nom complet"
          field="fullName"
          placeholder="Jean Dupont"
        />
        <InputWithIcon
          icon={User}
          label="Titre professionnel"
          field="jobTitle"
          placeholder="Développeur Full-Stack"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={Mail}
          label="Email"
          field="email"
          placeholder="jean.dupont@email.com"
          type="email"
        />
        <InputWithIcon
          icon={Phone}
          label="Téléphone"
          field="phone"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <InputWithIcon
        icon={MapPin}
        label="Localisation"
        field="location"
        placeholder="Paris, France"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithIcon
          icon={Globe}
          label="Site web (optionnel)"
          field="website"
          placeholder="https://monsite.com"
        />
        <InputWithIcon
          icon={Linkedin}
          label="LinkedIn (optionnel)"
          field="linkedin"
          placeholder="linkedin.com/in/jeandupont"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary" className="text-sm font-medium text-foreground/80">
            Résumé professionnel
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:text-primary/80 ai-shimmer"
            disabled
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Améliorer avec l'IA
          </Button>
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
    </div>
  );
};

export default PersonalInfoForm;
