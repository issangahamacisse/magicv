import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CVData, defaultCVData } from '@/types/cv';
import ModernTemplate from '@/components/preview/ModernTemplate';
import ClassicTemplate from '@/components/preview/ClassicTemplate';
import CreativeTemplate from '@/components/preview/CreativeTemplate';
import MinimalTemplate from '@/components/preview/MinimalTemplate';
import ElegantTemplate from '@/components/preview/ElegantTemplate';
import BoldTemplate from '@/components/preview/BoldTemplate';
import ExecutiveTemplate from '@/components/preview/ExecutiveTemplate';
import TechTemplate from '@/components/preview/TechTemplate';
import ArtisticTemplate from '@/components/preview/ArtisticTemplate';
import CompactTemplate from '@/components/preview/CompactTemplate';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const templateComponents: Record<string, React.ForwardRefExoticComponent<{ data: CVData } & React.RefAttributes<HTMLDivElement>>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  artistic: ArtisticTemplate,
  compact: CompactTemplate,
};

const PublicCV: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await supabase
        .from('resumes')
        .select('content, theme_config, title')
        .eq('public_slug', slug as any)
        .eq('is_public', true as any)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        const content = data.content as Record<string, unknown>;
        const themeConfig = data.theme_config as Record<string, unknown>;
        setCvData({ ...content, theme: themeConfig } as unknown as CVData);
      }
      setLoading(false);
    };
    fetchCV();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !cvData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-4">
        <h1 className="text-2xl font-bold">CV introuvable</h1>
        <p className="text-muted-foreground">Ce CV n'existe pas ou n'est plus public.</p>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  const TemplateComponent = templateComponents[cvData.theme?.template] || ModernTemplate;
  const name = cvData.personalInfo?.fullName || 'CV';
  const title = cvData.personalInfo?.jobTitle || '';

  return (
    <>
      <Helmet>
        <title>{`${name}${title ? ` - ${title}` : ''} | MagiCV`}</title>
        <meta name="description" content={`CV professionnel de ${name}${title ? ` - ${title}` : ''}`} />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        {/* Header bar */}
        <div className="max-w-4xl mx-auto mb-4 px-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Créer mon CV sur MagiCV
          </Link>
        </div>

        {/* CV Display */}
        <div className="flex justify-center px-4">
          <div
            className="bg-white shadow-xl"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <TemplateComponent data={cvData} />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-8 px-4 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            Créez votre CV professionnel gratuitement
          </p>
          <Link to="/">
            <Button size="lg">Créer mon CV</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PublicCV;
