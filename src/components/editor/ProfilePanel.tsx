import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  LogOut, 
  FileText, 
  Plus, 
  Trash2, 
  Copy,
  Loader2,
  Cloud,
  CloudOff,
  ExternalLink,
  Download,
  CheckCircle,
  Crown,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const ProfilePanel: React.FC = () => {
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
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, credits_ai, is_subscribed, subscription_status, subscription_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
    } else {
      setResumes(data || []);
    }
    setIsLoading(false);
  };

  const fetchDownloadPermissions = async () => {
    if (!user) return;
    
    const { data: permissions, error } = await supabase
      .from('download_permissions')
      .select('id, resume_id, granted_at, granted_by')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('Error fetching download permissions:', error);
      return;
    }

    // Fetch resume titles for each permission
    if (permissions && permissions.length > 0) {
      const resumeIds = permissions.map(p => p.resume_id);
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('id, title')
        .in('id', resumeIds);

      const permissionsWithTitles = permissions.map(perm => ({
        ...perm,
        resume_title: resumesData?.find(r => r.id === perm.resume_id)?.title || 'CV sans titre'
      }));

      setDownloadPermissions(permissionsWithTitles);
    } else {
      setDownloadPermissions([]);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    const { data: paymentsData, error } = await supabase
      .from('payments')
      .select('id, payment_type, status, amount, created_at, resume_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }

    if (paymentsData && paymentsData.length > 0) {
      // Fetch resume titles for payments with resume_id
      const resumeIds = paymentsData.filter(p => p.resume_id).map(p => p.resume_id as string);
      let resumesData: { id: string; title: string }[] = [];
      
      if (resumeIds.length > 0) {
        const { data } = await supabase
          .from('resumes')
          .select('id, title')
          .in('id', resumeIds);
        resumesData = data || [];
      }

      const paymentsWithTitles = paymentsData.map(payment => ({
        ...payment,
        resume_title: payment.resume_id 
          ? resumesData.find(r => r.id === payment.resume_id)?.title || 'CV sans titre'
          : undefined
      }));

      setPayments(paymentsWithTitles);
    } else {
      setPayments([]);
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
      case 'download':
        return 'Téléchargement CV';
      case 'subscription':
        return 'Abonnement mensuel';
      default:
        return type;
    }
  };

  const handleNewCV = () => {
    resetCV();
    fetchResumes(); // Refresh list after creating new
  };

  const handleOpenCV = async (resumeId: string) => {
    await loadCV(resumeId);
  };

  const handleDeleteResume = async (id: string) => {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('CV supprimé');
      setResumes(resumes.filter(r => r.id !== id));
      // If we deleted the current resume, create a new one
      if (id === currentResumeId) {
        resetCV();
      }
    }
  };

  const handleDuplicateResume = async (resume: Resume) => {
    if (!user) return;

    const { data: original, error: fetchError } = await supabase
      .from('resumes')
      .select('content, theme_config')
      .eq('id', resume.id)
      .single();

    if (fetchError || !original) {
      toast.error('Erreur lors de la duplication');
      return;
    }

    const { error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: `${resume.title} (copie)`,
        content: original.content,
        theme_config: original.theme_config,
      });

    if (error) {
      toast.error('Erreur lors de la duplication');
    } else {
      toast.success('CV dupliqué');
      fetchResumes();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <CloudOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Non connecté</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connectez-vous pour sauvegarder vos CVs dans le cloud et y accéder depuis n'importe où.
        </p>
        <Button onClick={() => navigate('/auth')}>
          Se connecter
        </Button>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {profile?.full_name || 'Utilisateur'}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Cloud className="h-3 w-3 text-emerald-500" />
                Synchronisé avec le cloud
              </p>
            </div>
          </div>
        </Card>

        {/* Subscription Status */}
        <Card className={`p-4 ${profile?.is_subscribed ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${profile?.is_subscribed ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-muted'}`}>
                <Crown className={`h-5 w-5 ${profile?.is_subscribed ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Abonnement</p>
                {profile?.is_subscribed ? (
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">Actif</p>
                    {profile.subscription_expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expire le {format(new Date(profile.subscription_expires_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Gratuit</p>
                )}
              </div>
            </div>
            {!profile?.is_subscribed && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate('/payment')}>
                <Crown className="h-3 w-3" />
                S'abonner
              </Button>
            )}
          </div>
        </Card>

        {/* AI Credits */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Crédits IA</p>
              <p className="text-2xl font-bold">{profile?.credits_ai ?? 5}</p>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              <p>Utilisez l'IA pour</p>
              <p>améliorer votre CV</p>
            </div>
          </div>
        </Card>

        {/* Download Permissions */}
        {downloadPermissions.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Download className="h-4 w-4" />
              CVs débloqués ({downloadPermissions.length})
            </h4>
            <div className="space-y-2">
              {downloadPermissions.map((perm) => (
                <Card key={perm.id} className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{perm.resume_title}</p>
                      <p className="text-xs text-muted-foreground">
                        Débloqué le {format(new Date(perm.granted_at), 'dd MMM yyyy', { locale: fr })} via {perm.granted_by}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved CVs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mes CVs ({resumes.length})
            </h4>
            <Button size="sm" variant="outline" className="gap-1" onClick={handleNewCV}>
              <Plus className="h-3 w-3" />
              Nouveau
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : resumes.length === 0 ? (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              <p>Aucun CV sauvegardé</p>
              <p className="text-xs mt-1">Votre CV actuel sera synchronisé automatiquement</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume) => (
                <Card 
                  key={resume.id} 
                  className={`p-3 ${resume.id === currentResumeId ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{resume.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Modifié le {format(new Date(resume.updated_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {resume.id !== currentResumeId && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => handleOpenCV(resume.id)}
                          title="Ouvrir ce CV"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handleDuplicateResume(resume)}
                        title="Dupliquer"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteResume(resume.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              Historique des demandes ({payments.length})
            </h4>
            <div className="space-y-2">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
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
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </ScrollArea>
  );
};

export default ProfilePanel;
