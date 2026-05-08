import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderItem } from '@/types/database';
import { Loader2, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  processing: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  shipped: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  delivered: 'bg-green-500/20 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button onClick={() => navigate('/products')} className="glass-button glossy-overlay">Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium uppercase ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 border-t border-border/50 pt-4">
                  {order.order_items?.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span>{it.product_name} × {it.quantity}</span>
                      <span className="font-medium">${(Number(it.product_price) * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span className="text-primary">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}