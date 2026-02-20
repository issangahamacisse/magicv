import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Star, Check, Download, Zap, Edit, Eye, TrendingUp } from 'lucide-react';
import logoMagiCV from '@/assets/logo-magicv.svg';
import { useNavigate } from 'react-router-dom';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';
import { supabase } from '@/integrations/supabase/client';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [visits, setVisits] = useState<{ today: number; week: number; month: number } | null>(null);

  useEffect(() => {
    // Track page view anonymously
    supabase.from('page_views').insert({
      page: '/',
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {/* silent */});

    // Load visit counts
    const fetchVisits = async () => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const { data } = await supabase
        .from('page_views')
        .select('visited_at')
        .eq('page', '/')
        .gte('visited_at', thirtyDaysAgo.toISOString());

      if (data) {
        const today = data.filter(v => v.visited_at >= todayStart.toISOString()).length;
        const week = data.filter(v => v.visited_at >= sevenDaysAgo.toISOString()).length;
        const month = data.length;
        setVisits({ today, week, month });
      }
    };
    fetchVisits();
  }, []);

  const handleCreateResume = () => {
    navigate('/editor');
  };

  return (
    <>
      <Helmet>
        <title>CV Builder - Créez votre CV professionnel gratuitement</title>
        <meta 
          name="description" 
          content="Créez un CV professionnel en quelques minutes. Pas de compte requis. Modèles ATS-friendly et export PDF gratuit." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          {/* Guest promo banner */}
          <div className="bg-primary text-primary-foreground text-center py-1.5 px-4 text-xs sm:text-sm font-medium">
            ✨ Mode invité disponible — Créez votre CV maintenant, sauvegardez-le après !&nbsp;
            <button onClick={() => setShowSignUp(true)} className="underline font-bold hover:opacity-80 transition-opacity">
              S'inscrire gratuitement →
            </button>
          </div>
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoMagiCV} alt="MagiCV" className="h-14 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLogin(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                Connexion
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSignUp(true)}
                className="hidden sm:flex gap-1.5 shadow-sm shadow-primary/20"
              >
                S'inscrire gratuitement
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-24">
          <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">4.9/5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">ATS Friendly</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Export PDF</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Instantané</span>
                  </div>
                </div>

                {/* Main headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="block">Décrochez le job</span>
                  <span className="block gradient-text">de vos rêves</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                  Pas de compte requis. Choisissez un modèle professionnel et commencez à éditer immédiatement.
                </p>

                {/* CTA Button */}
                <Button 
                  size="lg" 
                  onClick={handleCreateResume}
                  className="h-14 px-8 text-lg gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Edit className="h-5 w-5" />
                  Créer mon CV gratuitement
                </Button>

                {/* Social proof */}
                <div className="mt-10 flex items-center justify-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-primary">
                          {String.fromCharCode(64 + i)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rejoint par <span className="font-semibold text-foreground">10,000+</span> candidats
                  </p>
                </div>

                {/* Real-time visitor counter */}
                {visits && (
                  <div className="mt-8 inline-flex items-center gap-1 flex-wrap justify-center">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{visits.today}</span>
                      <span className="text-xs text-muted-foreground">visiteur(s) aujourd'hui</span>
                      <span className="mx-1 text-border">·</span>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{visits.week}</span>
                      <span className="text-xs text-muted-foreground">cette semaine</span>
                      <span className="mx-1 text-border">·</span>
                      <span className="text-sm font-semibold">{visits.month}</span>
                      <span className="text-xs text-muted-foreground">ce mois</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Pourquoi nous choisir ?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Des outils puissants pour créer un CV qui se démarque
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <FeatureCard
                  icon={<Zap className="h-6 w-6" />}
                  title="Rapide et Simple"
                  description="Créez votre CV en quelques minutes. Interface intuitive, aucune compétence technique requise."
                />
                <FeatureCard
                  icon={<Check className="h-6 w-6" />}
                  title="100% ATS Compatible"
                  description="Nos modèles sont optimisés pour passer les systèmes de suivi des candidatures."
                />
                <FeatureCard
                  icon={<Star className="h-6 w-6" />}
                  title="Modèles Premium"
                  description="Accédez à une collection de modèles professionnels conçus par des experts."
                />
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 MagiCV — Issa N'gahama Cissé. Tous droits réservés.
          </div>
        </footer>
      </div>

      {/* Modals */}
      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onSwitchToSignUp={() => {
          setShowLogin(false);
          setShowSignUp(true);
        }}
        onForgotPassword={() => {
          setShowLogin(false);
          setShowResetPassword(true);
        }}
      />
      <SignUpModal 
        open={showSignUp} 
        onOpenChange={setShowSignUp}
        onSwitchToLogin={() => {
          setShowSignUp(false);
          setShowLogin(true);
        }}
        onContinueAsGuest={handleCreateResume}
      />
      <ResetPasswordModal
        open={showResetPassword}
        onOpenChange={setShowResetPassword}
        onBackToLogin={() => {
          setShowResetPassword(false);
          setShowLogin(true);
        }}
      />
    </>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
