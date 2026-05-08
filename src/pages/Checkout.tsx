import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/types/database';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();
  const [shipping, setShipping] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('address, phone').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.address) setShipping(data.address);
      if (data?.phone) setPhone(data.phone);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    if (!shipping.trim()) { toast.error('Shipping address required'); return; }

    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ user_id: user.id, total, shipping_address: shipping, notes, status: 'pending' })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((it) => {
        const p = it.product as Product;
        return {
          order_id: order.id,
          product_id: p.id,
          product_name: p.name,
          product_price: p.price,
          quantity: it.quantity,
        };
      });
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/products')} className="glass-button glossy-overlay">Continue Shopping</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 space-y-4"
          >
            <h2 className="text-xl font-display font-bold mb-2">Shipping Details</h2>
            <div>
              <Label htmlFor="address">Shipping Address *</Label>
              <Textarea id="address" value={shipping} onChange={(e) => setShipping(e.target.value)} required rows={3} placeholder="Street, city, postal code, country" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact number" />
            </div>
            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Special instructions (optional)" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full glass-button glossy-overlay" size="lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Place Order — ${total.toFixed(2)}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 h-fit"
          >
            <h2 className="text-xl font-display font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((it) => {
                const p = it.product as Product;
                if (!p) return null;
                return (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="flex-1">{p.name} × {it.quantity}</span>
                    <span className="font-medium">${(p.price * it.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}