import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard } from '@/components/admin/StatCard';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export default function AdminAnalytics() {
  const [series, setSeries] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ revenue: 0, orders: 0, aov: 0, customers: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('order_items').select('*, product:products(category_id, category:categories(name))'),
    ]);
    const orders = ordersRes.data || [];
    const items = itemsRes.data || [];
    const valid = orders.filter((o: any) => o.status !== 'cancelled');
    const revenue = valid.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
    const uniqueCustomers = new Set(
      valid.map((o: any) => o.user_id).filter(Boolean)
    ).size;
    setKpis({
      revenue,
      orders: valid.length,
      aov: valid.length ? revenue / valid.length : 0,
      customers: uniqueCustomers,
    });

    // 30 day series
    const days: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = valid.filter((o: any) => o.created_at?.slice(0, 10) === key);
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    setSeries(days);

    // By category
    const catMap = new Map<string, number>();
    items.forEach((it: any) => {
      const name = it.product?.category?.name || 'Uncategorised';
      catMap.set(name, (catMap.get(name) || 0) + Number(it.product_price) * Number(it.quantity));
    });
    setByCategory(Array.from(catMap.entries()).map(([name, revenue]) => ({ name, revenue })));
  };

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your store performance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Revenue" value={`₹${kpis.revenue.toFixed(0)}`} icon={DollarSign} />
          <StatCard title="Orders" value={kpis.orders} icon={ShoppingBag} delay={0.05} />
          <StatCard title="Avg Order" value={`₹${kpis.aov.toFixed(0)}`} icon={TrendingUp} delay={0.1} />
          <StatCard title="Customers" value={kpis.customers} icon={Users} delay={0.15} />
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Revenue & Orders — Last 30 days</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis yAxisId="r" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis yAxisId="o" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line yAxisId="r" type="monotone" dataKey="revenue" stroke="hsl(160 60% 35%)" strokeWidth={2} dot={false} />
              <Line yAxisId="o" type="monotone" dataKey="orders" stroke="hsl(40 90% 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Revenue by Category</h3>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="revenue" fill="hsl(160 60% 35%)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
