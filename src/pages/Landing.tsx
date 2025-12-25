import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { FileText, Star, Check, Download, Zap, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

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
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">ResumeBuilder</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowLogin(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Connexion
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-16">
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
            © 2024 ResumeBuilder. Tous droits réservés.
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
