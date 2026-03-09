import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Shield, CreditCard, Gift, CheckCircle, XCircle, Loader2, ArrowLeft,
  Plus, RefreshCw, BarChart3, Users, FileText, TrendingUp, Zap,
  Clock, Eye, Sparkles, Crown, Search, UserCog, Send
} from 'lucide-react';
import logoMagiCV from '@/assets/logo-magicv.svg';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: string;
  status: string;
  payment_method: string | null;
  phone_number: string | null;
  created_at: string;
  profiles?: { email: string | null; full_name: string | null };
}

interface Coupon {
  id: string;
  code: string;
  credit_amount: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Stats {
  totalRevenue: number;
  revenueSubscriptions: number;
  revenueDownloads: number;
  totalUsers: number;
  subscribedUsers: number;
  totalResumes: number;
  pendingPayments: number;
  validatedPayments: number;
  rejectedPayments: number;
  totalAiCredits: number;
  activeCoupons: number;
  totalCouponUses: number;
  signupsByDay: { date: string; count: number }[];
  revenueByDay: { date: string; amount: number }[];
  visitsByDay: { date: string; count: number }[];
  todayVisits: number;
  visits7days: number;
  visits30days: number;
}

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payments state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [validatingPayment, setValidatingPayment] = useState<string | null>(null);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', credit_amount: 1, max_uses: 1 });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<7 | 30>(7);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) { setIsAdmin(false); setIsLoading(false); return; }
    try {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      setIsAdmin(!!data);
      if (data) {
        fetchPayments();
        fetchCoupons();
        fetchStats();
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30).toISOString();
      const sevenDaysAgo = subDays(now, 7).toISOString();
      const todayStart = startOfDay(now).toISOString();

      const [paymentsRes, profilesRes, resumesRes, couponUsesRes, couponsRes, pageViewsRes] = await Promise.all([
        supabase.from('payments').select('amount, payment_type, status, created_at'),
        supabase.from('profiles').select('credits_ai, is_subscribed, created_at'),
        supabase.from('resumes').select('created_at'),
        supabase.from('coupon_uses').select('used_at'),
        supabase.from('coupons').select('is_active'),
        supabase.from('page_views').select('visited_at').eq('page', '/'),
      ]);

      const allPayments = paymentsRes.data || [];
      const allProfiles = profilesRes.data || [];
      const allResumes = resumesRes.data || [];
      const allCouponUses = couponUsesRes.data || [];
      const allCoupons = couponsRes.data || [];
      const allViews = pageViewsRes.data || [];

      // Revenue
      const validated = allPayments.filter(p => p.status === 'validated');
      const totalRevenue = validated.reduce((s, p) => s + p.amount, 0);
      const revenueSubscriptions = validated.filter(p => p.payment_type === 'subscription').reduce((s, p) => s + p.amount, 0);
      const revenueDownloads = validated.filter(p => p.payment_type === 'download').reduce((s, p) => s + p.amount, 0);

      // Payment counts
      const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
      const validatedPayments = validated.length;
      const rejectedPayments = allPayments.filter(p => p.status === 'rejected').length;

      // Users
      const totalUsers = allProfiles.length;
      const subscribedUsers = allProfiles.filter(p => p.is_subscribed).length;
      const totalAiCredits = allProfiles.reduce((s, p) => s + (p.credits_ai || 0), 0);

      // Resumes & coupons
      const totalResumes = allResumes.length;
      const activeCoupons = allCoupons.filter(c => c.is_active).length;
      const totalCouponUses = allCouponUses.length;

      // Signups last 30 days
      const signupsByDayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), 'dd/MM');
        signupsByDayMap[d] = 0;
      }
      allProfiles.filter(p => p.created_at >= thirtyDaysAgo).forEach(p => {
        const d = format(new Date(p.created_at), 'dd/MM');
        if (signupsByDayMap[d] !== undefined) signupsByDayMap[d]++;
      });
      const signupsByDay = Object.entries(signupsByDayMap).map(([date, count]) => ({ date, count }));

      // Revenue last 30 days
      const revenueByDayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), 'dd/MM');
        revenueByDayMap[d] = 0;
      }
      validated.filter(p => p.created_at >= thirtyDaysAgo).forEach(p => {
        const d = format(new Date(p.created_at), 'dd/MM');
        if (revenueByDayMap[d] !== undefined) revenueByDayMap[d] += p.amount;
      });
      const revenueByDay = Object.entries(revenueByDayMap).map(([date, amount]) => ({ date, amount }));

      // Page views
      const todayVisits = allViews.filter(v => v.visited_at >= todayStart).length;
      const visits7days = allViews.filter(v => v.visited_at >= sevenDaysAgo).length;
      const visits30days = allViews.filter(v => v.visited_at >= thirtyDaysAgo).length;

      const visitsByDayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), 'dd/MM');
        visitsByDayMap[d] = 0;
      }
      allViews.filter(v => v.visited_at >= thirtyDaysAgo).forEach(v => {
        const d = format(new Date(v.visited_at), 'dd/MM');
        if (visitsByDayMap[d] !== undefined) visitsByDayMap[d]++;
      });
      const visitsByDay = Object.entries(visitsByDayMap).map(([date, count]) => ({ date, count }));

      setStats({
        totalRevenue, revenueSubscriptions, revenueDownloads,
        totalUsers, subscribedUsers, totalResumes,
        pendingPayments, validatedPayments, rejectedPayments,
        totalAiCredits, activeCoupons, totalCouponUses,
        signupsByDay, revenueByDay, visitsByDay,
        todayVisits, visits7days, visits30days,
      });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const { data: paymentsData, error: paymentsError } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (paymentsError) throw paymentsError;
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase.from('profiles').select('user_id, email, full_name').in('user_id', userIds);
      setPayments((paymentsData || []).map(payment => ({ ...payment, profiles: profilesData?.find(p => p.user_id === payment.user_id) || null })) as Payment[]);
    } catch {
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch {
      toast.error('Erreur lors du chargement des coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId: string) => {
    setValidatingPayment(paymentId);
    try {
      const { data, error } = await supabase.rpc('validate_payment', { payment_id: paymentId });
      if (error) throw error;
      if (data) { toast.success('Paiement validé avec succès !'); fetchPayments(); fetchStats(); }
      else toast.error('Impossible de valider ce paiement');
    } catch { toast.error('Erreur lors de la validation'); }
    finally { setValidatingPayment(null); }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
      if (error) throw error;
      toast.success('Paiement rejeté');
      fetchPayments(); fetchStats();
    } catch { toast.error('Erreur lors du rejet'); }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) { toast.error('Veuillez entrer un code coupon'); return; }
    setCreatingCoupon(true);
    try {
      const { error } = await supabase.from('coupons').insert({ code: newCoupon.code.toUpperCase(), credit_amount: newCoupon.credit_amount, max_uses: newCoupon.max_uses, created_by: user?.id });
      if (error) throw error;
      toast.success('Coupon créé avec succès !');
      setNewCoupon({ code: '', credit_amount: 1, max_uses: 1 });
      fetchCoupons();
    } catch { toast.error('Erreur lors de la création du coupon'); }
    finally { setCreatingCoupon(false); }
  };

  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !isActive }).eq('id', couponId);
      if (error) throw error;
      fetchCoupons();
    } catch { toast.error('Erreur lors de la modification'); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
          <CardTitle>Accès restreint</CardTitle>
          <CardDescription>Vous devez être connecté pour accéder à cette page.</CardDescription>
        </CardHeader>
        <CardContent><Button onClick={() => navigate('/auth')}>Se connecter</Button></CardContent>
      </Card>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <Shield className="h-12 w-12 mx-auto text-destructive" />
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>Vous n'avez pas les droits d'accès à cette page.</CardDescription>
        </CardHeader>
        <CardContent><Button onClick={() => navigate('/')}>Retour à l'accueil</Button></CardContent>
      </Card>
    </div>
  );

  const totalPayments = (stats?.pendingPayments ?? 0) + (stats?.validatedPayments ?? 0) + (stats?.rejectedPayments ?? 0);
  const pendingPaymentsList = payments.filter(p => p.status === 'pending');
  const revenueChartData = stats ? (revenuePeriod === 7 ? stats.revenueByDay.slice(-7) : stats.revenueByDay) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <img src={logoMagiCV} alt="MagiCV" className="h-12 w-auto" />
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Admin
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats">
          <TabsList className="mb-6">
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Paiements
              {pendingPaymentsList.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingPaymentsList.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Gift className="h-4 w-4" />
              Coupons
            </TabsTrigger>
          </TabsList>

          {/* ===================== STATISTICS TAB ===================== */}
          <TabsContent value="stats">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Vue d'ensemble</h2>
              <Button variant="outline" size="sm" onClick={fetchStats} disabled={statsLoading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* KPI Grid — Row 1: core metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">Revenus</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('fr-FR')} F</p>
                      <p className="text-xs text-muted-foreground mt-1">{stats.validatedPayments} paiement(s) validé(s)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Utilisateurs</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Crown className="inline h-3 w-3 text-amber-500 mr-1" />
                        {stats.subscribedUsers} abonné(s)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">CVs créés</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalResumes}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalUsers > 0 ? (stats.totalResumes / stats.totalUsers).toFixed(1) : 0} moy./utilisateur
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={stats.pendingPayments > 0 ? 'border-amber-400 dark:border-amber-600' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">En attente</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                      <p className="text-xs text-muted-foreground mt-1">paiement(s) à traiter</p>
                    </CardContent>
                  </Card>
                </div>

                {/* KPI Grid — Row 2: signups & revenue by plan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* New signups — last 7 days */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-primary/15">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">7 derniers jours</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {stats.signupsByDay.slice(-7).reduce((s, d) => s + d.count, 0)}
                      </p>
                      <p className="text-sm font-medium mt-1">Nouvelles inscriptions</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stats.signupsByDay.slice(-30).reduce((s, d) => s + d.count, 0)} ce mois
                      </p>
                    </CardContent>
                  </Card>

                  {/* Revenue — Subscription plan */}
                  <Card className="border-amber-400/30 bg-amber-500/5">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/15">
                          <Crown className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Abonnements</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.revenueSubscriptions.toLocaleString('fr-FR')} F</p>
                      <p className="text-sm font-medium mt-1">Plan mensuel 3 000 F</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stats.subscribedUsers} abonné(s) actif(s)
                      </p>
                    </CardContent>
                  </Card>

                  {/* Revenue — Download plan */}
                  <Card className="border-blue-400/30 bg-blue-500/5">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/15">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">Téléchargements</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.revenueDownloads.toLocaleString('fr-FR')} F</p>
                      <p className="text-sm font-medium mt-1">Par CV — 1 000 F/unité</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Math.round(stats.revenueDownloads / 1000)} téléchargement(s) payant(s)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Visits + Revenue detail */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Landing page visits */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Visites de la landing page
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{stats.todayVisits}</p>
                          <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{stats.visits7days}</p>
                          <p className="text-xs text-muted-foreground">7 jours</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{stats.visits30days}</p>
                          <p className="text-xs text-muted-foreground">30 jours</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={stats.visitsByDay.slice(-14)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={2} />
                          <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Visites" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue breakdown */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Détail des revenus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                          <Crown className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                          <p className="text-lg font-bold">{stats.revenueSubscriptions.toLocaleString('fr-FR')} F</p>
                          <p className="text-xs text-muted-foreground">Abonnements</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                          <FileText className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                          <p className="text-lg font-bold">{stats.revenueDownloads.toLocaleString('fr-FR')} F</p>
                          <p className="text-xs text-muted-foreground">Téléchargements</p>
                        </div>
                      </div>

                      {/* Payment status breakdown */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Répartition des paiements</p>
                        {totalPayments > 0 && (
                          <>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-emerald-600">Validés</span>
                                <span className="text-muted-foreground">{stats.validatedPayments} ({Math.round(stats.validatedPayments / totalPayments * 100)}%)</span>
                              </div>
                              <Progress value={stats.validatedPayments / totalPayments * 100} className="h-2 [&>div]:bg-emerald-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-amber-600">En attente</span>
                                <span className="text-muted-foreground">{stats.pendingPayments} ({Math.round(stats.pendingPayments / totalPayments * 100)}%)</span>
                              </div>
                              <Progress value={stats.pendingPayments / totalPayments * 100} className="h-2 [&>div]:bg-amber-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-destructive">Rejetés</span>
                                <span className="text-muted-foreground">{stats.rejectedPayments} ({Math.round(stats.rejectedPayments / totalPayments * 100)}%)</span>
                              </div>
                              <Progress value={stats.rejectedPayments / totalPayments * 100} className="h-2 [&>div]:bg-destructive" />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue over time */}
                <Card>
                  <CardHeader className="flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Évolution des revenus
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant={revenuePeriod === 7 ? 'default' : 'outline'} onClick={() => setRevenuePeriod(7)} className="h-7 text-xs">7j</Button>
                      <Button size="sm" variant={revenuePeriod === 30 ? 'default' : 'outline'} onClick={() => setRevenuePeriod(30)} className="h-7 text-xs">30j</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={revenueChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={revenuePeriod === 7 ? 0 : 4} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                          formatter={(value: number) => [`${value.toLocaleString('fr-FR')} F`, 'Revenus']}
                        />
                        <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Signups over 30 days */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Inscriptions — 30 derniers jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.signupsByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                          formatter={(value: number) => [value, 'Inscriptions']}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Inscriptions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI & Coupons stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Crédits IA restants</p>
                        <p className="text-2xl font-bold">{stats.totalAiCredits}</p>
                        <p className="text-xs text-muted-foreground">dans tous les profils</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Gift className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coupons actifs</p>
                        <p className="text-2xl font-bold">{stats.activeCoupons}</p>
                        <p className="text-xs text-muted-foreground">codes promo disponibles</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Utilisations coupons</p>
                        <p className="text-2xl font-bold">{stats.totalCouponUses}</p>
                        <p className="text-xs text-muted-foreground">total historique</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* ===================== PAYMENTS TAB ===================== */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des paiements</CardTitle>
                  <CardDescription>Validez ou rejetez les demandes de paiement</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPayments} disabled={paymentsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${paymentsLoading ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré</p>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card key={payment.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{payment.profiles?.full_name || payment.profiles?.email || 'Utilisateur inconnu'}</p>
                                <Badge variant={payment.status === 'pending' ? 'secondary' : payment.status === 'validated' ? 'default' : 'destructive'}>
                                  {payment.status === 'pending' ? 'En attente' : payment.status === 'validated' ? 'Validé' : 'Rejeté'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_type === 'download' ? 'Téléchargement' : 'Abonnement'} • {payment.amount} F
                              </p>
                              <p className="text-sm text-muted-foreground">{payment.payment_method} • {payment.phone_number}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(payment.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                            </div>
                            {payment.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleValidatePayment(payment.id)} disabled={validatingPayment === payment.id}>
                                  {validatingPayment === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Valider</>}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectPayment(payment.id)}>
                                  <XCircle className="h-4 w-4 mr-1" />Rejeter
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== COUPONS TAB ===================== */}
          <TabsContent value="coupons">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau coupon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="EX: PROMO2026" />
                  </div>
                  <div className="space-y-2">
                    <Label>Crédits IA</Label>
                    <Input type="number" min={1} value={newCoupon.credit_amount} onChange={(e) => setNewCoupon({ ...newCoupon, credit_amount: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Utilisations max</Label>
                    <Input type="number" min={1} value={newCoupon.max_uses} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) || 1 })} />
                  </div>
                  <Button onClick={handleCreateCoupon} disabled={creatingCoupon} className="w-full">
                    {creatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer le coupon'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Coupons existants</CardTitle>
                    <CardDescription>Gérez vos codes promo</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={couponsLoading}>
                    <RefreshCw className={`h-4 w-4 ${couponsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {coupons.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucun coupon créé</p>
                    ) : (
                      <div className="space-y-3">
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="font-mono font-bold">{coupon.code}</code>
                                <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                                  {coupon.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {coupon.credit_amount} crédit(s) • {coupon.used_count}/{coupon.max_uses} utilisations
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}>
                              {coupon.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPortal;
