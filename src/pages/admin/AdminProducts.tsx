import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Upload, Star, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Category } from '@/types/database';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock: string;
  featured: boolean;
  is_active: boolean;
  image_url: string;
}

const empty: FormState = {
  name: '', description: '', price: '', original_price: '',
  category_id: '', stock: '0', featured: false, is_active: true, image_url: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addStock, setAddStock] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((p.data as any) || []);
    setCategories((c.data as any) || []);
    setLoading(false);
  };

  const openCreate = () => { setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      category_id: p.category_id || '',
      stock: String(p.stock),
      featured: p.featured,
      is_active: p.is_active,
      image_url: p.image_url || '',
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('products').upload(path, file);
    if (error) {
      toast.error('Image upload failed: ' + error.message);
    } else {
      const { data } = supabase.storage.from('products').getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success('Image uploaded');
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category_id: form.category_id || null,
      stock: Number(form.stock) || 0,
      featured: form.featured,
      is_active: form.is_active,
      image_url: form.image_url || null,
    };
    const res = form.id
      ? await supabase.from('products').update(payload).eq('id', form.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success(form.id ? 'Product updated' : 'Product created');
      setOpen(false);
      load();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Product deleted'); load(); }
  };

  const updateStock = async (id: string, stock: number) => {
    const { error } = await supabase.from('products').update({ stock }).eq('id', id);
    if (error) toast.error(error.message);
    else { setProducts((ps) => ps.map((p) => p.id === id ? { ...p, stock } : p)); }
  };

  const addExtraStock = async (p: Product) => {
    const extra = Number(addStock[p.id]);
    if (!extra || extra <= 0) {
      toast.error('Enter a positive number to add');
      return;
    }
    const newStock = p.stock + extra;
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    if (error) {
      toast.error(error.message);
    } else {
      setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, stock: newStock } : x));
      setAddStock((s) => ({ ...s, [p.id]: '' }));
      toast.success(`Added ${extra} units to ${p.name} (new stock: ${newStock})`);
    }
  };

  const toggleFeatured = async (p: Product) => {
    const { error } = await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id);
    if (error) toast.error(error.message);
    else { setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x)); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">{products.length} total · manage your catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 glass-card"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="glass-button glossy-overlay">
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{form.id ? 'Edit Product' : 'New Product'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <Label>Original Price (₹)</Label>
                    <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category_id || 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? '' : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="none">— None —</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Image</Label>
                    <div className="flex items-center gap-3">
                      {form.image_url && (
                        <img src={form.image_url} alt="" className="h-16 w-16 object-cover border border-border" />
                      )}
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                        />
                        <div className="glass-card border-dashed border px-4 py-3 cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/30">
                          <Upload className="h-4 w-4" />
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={save} disabled={saving} className="glass-button glossy-overlay">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="glass-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Add Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-12 w-12 object-cover border border-border" />
                    ) : (
                      <div className="h-12 w-12 bg-muted" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      {p.name}
                      {p.featured && <Star className="h-3 w-3 fill-accent text-accent" />}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                  </TableCell>
                  <TableCell className="text-sm">{(p as any).category?.name || '—'}</TableCell>
                  <TableCell>₹{Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={p.stock}
                      key={p.stock}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== p.stock) updateStock(p.id, v);
                      }}
                      className={`w-20 ${p.stock < 5 ? 'border-destructive text-destructive' : ''}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        placeholder="+"
                        value={addStock[p.id] || ''}
                        onChange={(e) => setAddStock((s) => ({ ...s, [p.id]: e.target.value }))}
                        className="w-16"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addExtraStock(p)}
                        title="Add to stock"
                      >
                        <PackagePlus className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 ${p.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleFeatured(p)} title="Toggle featured">
                        <Star className={`h-4 w-4 ${p.featured ? 'fill-accent text-accent' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(p.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
