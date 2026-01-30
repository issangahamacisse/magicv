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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Shield, 
  CreditCard, 
  Gift, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Plus,
  RefreshCw
} from 'lucide-react';

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
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    credit_amount: 1,
    max_uses: 1,
  });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
      
      if (data) {
        fetchPayments();
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch profiles for each payment user
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      // Merge profiles with payments
      const paymentsWithProfiles = (paymentsData || []).map(payment => ({
        ...payment,
        profiles: profilesData?.find(p => p.user_id === payment.user_id) || null
      }));

      setPayments(paymentsWithProfiles as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erreur lors du chargement des coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId: string) => {
    setValidatingPayment(paymentId);
    try {
      const { data, error } = await supabase.rpc('validate_payment', {
        payment_id: paymentId
      });

      if (error) throw error;
      
      if (data) {
        toast.success('Paiement validé avec succès !');
        fetchPayments();
      } else {
        toast.error('Impossible de valider ce paiement');
      }
    } catch (error) {
      console.error('Error validating payment:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setValidatingPayment(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);

      if (error) throw error;
      
      toast.success('Paiement rejeté');
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Erreur lors du rejet');
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error('Veuillez entrer un code coupon');
      return;
    }

    setCreatingCoupon(true);
    try {
      const { error } = await supabase.from('coupons').insert({
        code: newCoupon.code.toUpperCase(),
        credit_amount: newCoupon.credit_amount,
        max_uses: newCoupon.max_uses,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success('Coupon créé avec succès !');
      setNewCoupon({ code: '', credit_amount: 1, max_uses: 1 });
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Erreur lors de la création du coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !isActive })
        .eq('id', couponId);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <CardTitle>Accès restreint</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="h-12 w-12 mx-auto text-destructive" />
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les droits d'accès à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Portail Admin</h1>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Admin
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="payments">
          <TabsList className="mb-6">
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Paiements
              {pendingPayments.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingPayments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Gift className="h-4 w-4" />
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des paiements</CardTitle>
                  <CardDescription>
                    Validez ou rejetez les demandes de paiement
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPayments} disabled={paymentsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${paymentsLoading ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun paiement enregistré
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card key={payment.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {payment.profiles?.full_name || payment.profiles?.email || 'Utilisateur inconnu'}
                                </p>
                                <Badge
                                  variant={
                                    payment.status === 'pending' ? 'secondary' :
                                    payment.status === 'validated' ? 'default' : 'destructive'
                                  }
                                >
                                  {payment.status === 'pending' ? 'En attente' :
                                   payment.status === 'validated' ? 'Validé' : 'Rejeté'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_type === 'download' ? 'Téléchargement' : 'Abonnement'} • {payment.amount} F
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_method} • {payment.phone_number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(payment.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                              </p>
                            </div>
                            
                            {payment.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleValidatePayment(payment.id)}
                                  disabled={validatingPayment === payment.id}
                                >
                                  {validatingPayment === payment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Valider
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectPayment(payment.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
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

          <TabsContent value="coupons">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Create Coupon Form */}
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
                    <Input
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      placeholder="EX: PROMO2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Crédits IA</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newCoupon.credit_amount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, credit_amount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Utilisations max</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newCoupon.max_uses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateCoupon} 
                    disabled={creatingCoupon}
                    className="w-full"
                  >
                    {creatingCoupon ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Créer le coupon'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Coupons List */}
              <Card className="md:col-span-2">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Coupons existants</CardTitle>
                    <CardDescription>
                      Gérez vos codes promo
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={couponsLoading}>
                    <RefreshCw className={`h-4 w-4 ${couponsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {coupons.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun coupon créé
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {coupons.map((coupon) => (
                          <div 
                            key={coupon.id} 
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                            >
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
