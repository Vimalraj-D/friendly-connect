import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PackageX, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

export default function AdminStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('stock', { ascending: true });
    setProducts((data as any) || []);
  };

  const adjust = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    if (error) toast.error(error.message);
    else { setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, stock: newStock } : x)); }
  };

  const setStock = async (p: Product, val: number) => {
    const { error } = await supabase.from('products').update({ stock: val }).eq('id', p.id);
    if (error) toast.error(error.message);
    else setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, stock: val } : x));
  };

  const out = products.filter((p) => p.stock === 0);
  const low = products.filter((p) => p.stock > 0 && p.stock < threshold);
  const ok = products.filter((p) => p.stock >= threshold);

  const Section = ({ title, icon: Icon, color, list }: any) => (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-display font-semibold flex items-center gap-2 ${color}`}>
          <Icon className="h-4 w-4" /> {title} ({list.length})
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {list.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">None</p>}
        {list.map((p: Product) => (
          <div key={p.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {p.image_url ? <img src={p.image_url} className="h-10 w-10 object-cover" alt="" /> : <div className="h-10 w-10 bg-muted" />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">₹{Number(p.price).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjust(p, -1)}>-</Button>
              <Input
                type="number"
                className="w-16 text-center"
                defaultValue={p.stock}
                key={p.stock}
                onBlur={(e) => { const v = Number(e.target.value); if (v !== p.stock) setStock(p, v); }}
              />
              <Button size="sm" variant="ghost" onClick={() => adjust(p, 1)}>+</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Stock">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">Stock Management</h1>
            <p className="text-muted-foreground text-sm">Track and adjust inventory levels</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Low stock threshold:</span>
            <Input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 0)} className="w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Section title="Out of Stock" icon={PackageX} color="text-destructive" list={out} />
          <Section title="Low Stock" icon={AlertTriangle} color="text-accent-foreground" list={low} />
          <Section title="In Stock" icon={PackageCheck} color="text-primary" list={ok} />
        </div>
      </div>
    </AdminLayout>
  );
}
