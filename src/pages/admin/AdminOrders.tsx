import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus, OrderItem } from '@/types/database';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const badge = (s: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-accent/20 text-accent-foreground',
    processing: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    shipped: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    delivered: 'bg-primary/20 text-primary',
    cancelled: 'bg-destructive/20 text-destructive',
  };
  return map[s];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as any) || []);
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Status updated'); setOrders((os) => os.map((o) => o.id === id ? { ...o, status } : o)); }
  };

  const viewOrder = async (o: Order) => {
    setSelected(o);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setItems((data as any) || []);
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout title="Orders">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 glass-card"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders.</TableCell></TableRow>}
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-sm">{new Date(o.created_at).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 capitalize ${badge(o.status)}`}>{o.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-card">
                          {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Dialog open={selected?.id === o.id} onOpenChange={(v) => !v && setSelected(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => viewOrder(o)}><Eye className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card max-w-lg">
                          <DialogHeader><DialogTitle>Order #{o.id.slice(0, 8)}</DialogTitle></DialogHeader>
                          <div className="space-y-3 text-sm">
                            <div><span className="text-muted-foreground">Status: </span><span className="capitalize">{o.status}</span></div>
                            <div><span className="text-muted-foreground">Total: </span>₹{Number(o.total).toFixed(2)}</div>
                            <div><span className="text-muted-foreground">Address: </span>{o.shipping_address || '—'}</div>
                            <div><span className="text-muted-foreground">Notes: </span>{o.notes || '—'}</div>
                            <div className="border-t pt-3">
                              <p className="font-semibold mb-2">Items</p>
                              <ul className="space-y-1">
                                {items.map((it) => (
                                  <li key={it.id} className="flex justify-between">
                                    <span>{it.product_name} × {it.quantity}</span>
                                    <span>₹{(Number(it.product_price) * it.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
