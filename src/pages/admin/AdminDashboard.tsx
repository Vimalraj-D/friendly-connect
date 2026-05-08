import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Stats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  pending: number;
  lowStock: number;
}

const COLORS = ['hsl(160 60% 35%)', 'hsl(40 90% 55%)', 'hsl(200 60% 50%)', 'hsl(280 50% 55%)', 'hsl(0 70% 55%)'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0, orders: 0, products: 0, customers: 0, pending: 0, lowStock: 0,
  });
  const [salesData, setSalesData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [ordersRes, productsRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, stock'),
      supabase.from('order_items').select('product_name, quantity, product_price'),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const items = itemsRes.data || [];

    const validOrders = orders.filter((o: any) => o.status !== 'cancelled');
    const revenue = validOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
    const pending = orders.filter((o: any) => o.status === 'pending').length;
    const lowStock = products.filter((p: any) => (p.stock ?? 0) < 5).length;
    const uniqueCustomers = new Set(
      validOrders.map((o: any) => o.user_id).filter(Boolean)
    ).size;

    setStats({
      revenue,
      orders: orders.length,
      products: products.length,
      customers: uniqueCustomers,
      pending,
      lowStock,
    });

    // Sales last 7 days
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o: any) => o.created_at?.slice(0, 10) === key);
      days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    setSalesData(days);

    // Top products
    const map = new Map<string, number>();
    items.forEach((it: any) => {
      map.set(it.product_name, (map.get(it.product_name) || 0) + Number(it.quantity || 0));
    });
    setTopProducts(
      Array.from(map.entries())
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5),
    );

    // Status distribution
    const statusMap = new Map<string, number>();
    orders.forEach((o: any) => {
      statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
    });
    setStatusData(Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })));

    setRecentOrders(orders.slice(0, 5));
    setLoading(false);
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground">Here's what's happening in your store today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Revenue" value={`₹${stats.revenue.toFixed(0)}`} icon={DollarSign} delta="All time" trend="up" delay={0.0} />
          <StatCard title="Orders" value={stats.orders} icon={ShoppingBag} delta={`${stats.pending} pending`} delay={0.05} />
          <StatCard title="Products" value={stats.products} icon={Package} delay={0.1} />
          <StatCard title="Customers" value={stats.customers} icon={Users} delay={0.15} />
          <StatCard title="Pending" value={stats.pending} icon={TrendingUp} trend={stats.pending > 0 ? 'up' : 'neutral'} delay={0.2} />
          <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} trend={stats.lowStock > 0 ? 'down' : 'neutral'} delay={0.25} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-5 lg:col-span-2"
          >
            <h3 className="font-display font-semibold mb-4">Sales — Last 7 days</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 60% 35%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(160 60% 35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(160 60% 35%)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold mb-4">Order status</h3>
            {statusData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold mb-4">Top selling products</h3>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="sold" fill="hsl(40 90% 55%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Recent orders</h3>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border/50">
              {recentOrders.length === 0 && <p className="text-muted-foreground text-sm">No orders yet.</p>}
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">#{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{Number(o.total).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center">Loading...</p>}
      </div>
    </AdminLayout>
  );
}
