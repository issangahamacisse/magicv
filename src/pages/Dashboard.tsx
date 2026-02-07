import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText, Plus, Trash2, Copy, ExternalLink, Loader2, LogOut,
  Crown, Clock, CheckCircle, XCircle, Download, Mail, Sparkles, Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useCV } from '@/context/CVContext';

interface Resume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface DownloadPermission {
  id: string;
  resume_id: string;
  granted_at: string;
  granted_by: string;
  resume_title?: string;
}

interface Payment {
  id: string;
  payment_type: string;
  status: string;
  amount: number;
  created_at: string;
  resume_id: string | null;
  resume_title?: string;
}

interface ProfileData {
  full_name: string | null;
  credits_ai: number;
  is_subscribed: boolean;
  subscription_status: string;
  subscription_expires_at: string | null;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { resetCV, loadCV, currentResumeId } = useCV();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [downloadPermissions, setDownloadPermissions] = useState<DownloadPermission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchResumes();
      fetchDownloadPermissions();
      fetchPayments();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, credits_ai, is_subscribed, subscription_status, subscription_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const fetchResumes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('resumes')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setResumes(data || []);
    setIsLoading(false);
  };

  const fetchDownloadPermissions = async () => {
    if (!user) return;
    const { data: permissions } = await supabase
      .from('download_permissions')
      .select('id, resume_id, granted_at, granted_by')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false });

    if (permissions && permissions.length > 0) {
      const resumeIds = permissions.map(p => p.resume_id);
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('id, title')
        .in('id', resumeIds);

      setDownloadPermissions(permissions.map(perm => ({
        ...perm,
        resume_title: resumesData?.find(r => r.id === perm.resume_id)?.title || 'CV sans titre'
      })));
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('id, payment_type, status, amount, created_at, resume_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsData && paymentsData.length > 0) {
      const resumeIds = paymentsData.filter(p => p.resume_id).map(p => p.resume_id as string);
      let resumesData: { id: string; title: string }[] = [];
      if (resumeIds.length > 0) {
        const { data } = await supabase.from('resumes').select('id, title').in('id', resumeIds);
        resumesData = data || [];
      }
      setPayments(paymentsData.map(p => ({
        ...p,
        resume_title: p.resume_id ? resumesData.find(r => r.id === p.resume_id)?.title || 'CV sans titre' : undefined
      })));
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Validé</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'download': return 'Téléchargement CV';
      case 'subscription': return 'Abonnement mensuel';
      default: return type;
    }
  };

  const handleNewCV = () => {
    resetCV();
    navigate('/editor');
  };

  const handleOpenCV = async (resumeId: string) => {
    await loadCV(resumeId);
    navigate('/editor');
  };

  const handleDeleteResume = async (id: string) => {
    const { error } = await supabase.from('resumes').delete().eq('id', id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('CV supprimé');
      setResumes(prev => prev.filter(r => r.id !== id));
      if (id === currentResumeId) resetCV();
    }
  };

  const handleDuplicateResume = async (resume: Resume) => {
    if (!user) return;
    const { data: original } = await supabase
      .from('resumes')
      .select('content, theme_config')
      .eq('id', resume.id)
      .single();

    if (!original) { toast.error('Erreur lors de la duplication'); return; }

    const { error } = await supabase.from('resumes').insert({
      user_id: user.id,
      title: `${resume.title} (copie)`,
      content: original.content,
      theme_config: original.theme_config,
    });

    if (error) toast.error('Erreur lors de la duplication');
    else { toast.success('CV dupliqué'); fetchResumes(); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <>
      <Helmet>
        <title>Mon espace - CV Builder</title>
        <meta name="description" content="Gérez vos CV, votre abonnement et suivez vos téléchargements." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              CV Builder
            </button>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => navigate('/editor')} className="gap-2">
                <Edit3 className="h-4 w-4" />
                Éditeur
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile?.full_name || 'Utilisateur'}</h1>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Subscription */}
              <Card className={profile?.is_subscribed ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800' : ''}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${profile?.is_subscribed ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-muted'}`}>
                    <Crown className={`h-6 w-6 ${profile?.is_subscribed ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Abonnement</p>
                    {profile?.is_subscribed ? (
                      <>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">Actif</p>
                        {profile.subscription_expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expire le {format(new Date(profile.subscription_expires_at), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Gratuit</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate('/payment')}>
                          <Crown className="h-3 w-3" /> S'abonner
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Credits */}
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Crédits IA</p>
                    <p className="text-2xl font-bold">{profile?.credits_ai ?? 5}</p>
                  </div>
                </CardContent>
              </Card>

              {/* CVs count */}
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mes CVs</p>
                    <p className="text-2xl font-bold">{resumes.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CVs section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Mes CVs
                </CardTitle>
                <Button size="sm" onClick={handleNewCV} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Nouveau CV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucun CV sauvegardé</p>
                    <p className="text-sm mt-1">Créez votre premier CV pour commencer</p>
                    <Button className="mt-4 gap-2" onClick={handleNewCV}>
                      <Plus className="h-4 w-4" /> Créer mon premier CV
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                          resume.id === currentResumeId ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{resume.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Modifié le {format(new Date(resume.updated_at), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenCV(resume.id)} title="Ouvrir">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDuplicateResume(resume)} title="Dupliquer">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteResume(resume.id)} title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download permissions */}
            {downloadPermissions.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" /> CVs débloqués ({downloadPermissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {downloadPermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{perm.resume_title}</p>
                        <p className="text-xs text-muted-foreground">
                          Débloqué le {format(new Date(perm.granted_at), 'dd MMM yyyy', { locale: fr })} via {perm.granted_by}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payment history */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Historique des demandes ({payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Aucune demande de paiement</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{getPaymentTypeLabel(payment.payment_type)}</p>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.resume_title && `${payment.resume_title} • `}
                            {format(new Date(payment.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <p className="text-sm font-semibold whitespace-nowrap">{payment.amount}F</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Dashboard;
