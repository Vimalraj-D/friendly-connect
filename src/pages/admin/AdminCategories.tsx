import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types/database';
import { motion } from 'framer-motion';

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);

  // Main add/edit dialog
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', description: '', image_url: '', parent_id: '' });
  const [uploading, setUploading] = useState(false);

  // Edit dialog for a parent — shows subcategories inline
  const [editParent, setEditParent] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Sub-form inside the edit parent dialog
  const [subForm, setSubForm] = useState({ id: '', name: '', description: '' });
  const [subFormVisible, setSubFormVisible] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setItems((data as any) || []);
  };

  const save = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    const payload = {
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      parent_id: form.parent_id || null,
    };
    const res = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success('Saved');
      setOpen(false);
      setForm({ id: '', name: '', description: '', image_url: '', parent_id: '' });
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const upload = async (file: File) => {
    setUploading(true);
    const path = `categories/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('categories').upload(path, file);
    if (error) toast.error(error.message);
    else {
      const { data } = supabase.storage.from('categories').getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  // Save a subcategory from within the parent edit dialog
  const saveSub = async () => {
    if (!subForm.name) { toast.error('Subcategory name is required'); return; }
    const payload = {
      name: subForm.name,
      description: subForm.description || null,
      image_url: null,
      parent_id: editParent!.id,
    };
    const res = subForm.id
      ? await supabase.from('categories').update(payload).eq('id', subForm.id)
      : await supabase.from('categories').insert(payload);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success('Subcategory saved');
      setSubForm({ id: '', name: '', description: '' });
      setSubFormVisible(false);
      await load();
      // Refresh editParent from updated items
    }
  };

  const removeSub = async (id: string) => {
    if (!confirm('Delete subcategory?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const openEditParent = (parent: Category) => {
    setEditParent(parent);
    setSubForm({ id: '', name: '', description: '' });
    setSubFormVisible(false);
    setEditOpen(true);
  };

  const saveParentEdit = async () => {
    if (!editParent) return;
    const { error } = await supabase.from('categories').update({
      name: editParent.name,
      description: editParent.description,
      image_url: editParent.image_url,
    }).eq('id', editParent.id);
    if (error) toast.error(error.message);
    else { toast.success('Category updated'); load(); setEditOpen(false); }
  };

  const uploadParentImage = async (file: File) => {
    setUploading(true);
    const path = `categories/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('categories').upload(path, file);
    if (error) toast.error(error.message);
    else {
      const { data } = supabase.storage.from('categories').getPublicUrl(path);
      setEditParent((p) => p ? { ...p, image_url: data.publicUrl } : p);
    }
    setUploading(false);
  };

  const parentOptions = items.filter((c) => !c.parent_id && c.id !== form.id);

  // Get latest subs from items for the currently open parent dialog
  const currentSubs = editParent ? items.filter((s) => s.parent_id === editParent.id) : [];

  return (
    <AdminLayout title="Categories">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Categories</h1>
            <p className="text-muted-foreground text-sm">{items.length} categories</p>
          </div>

          {/* Add new category */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setForm({ id: '', name: '', description: '', image_url: '', parent_id: '' })}
                className="glass-button glossy-overlay"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader><DialogTitle>{form.id ? 'Edit' : 'New'} Category</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>
                  <Label>Parent category (leave empty for top-level)</Label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full h-10 px-3 border border-input bg-background text-sm"
                  >
                    <option value="">— None (top-level category) —</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                {!form.parent_id && (
                  <div>
                    <Label>Image</Label>
                    <div className="flex items-center gap-3">
                      {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 object-cover border rounded" />}
                      <label className="flex-1">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                        <div className="glass-card border-dashed border px-4 py-3 cursor-pointer flex items-center gap-2 text-sm">
                          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} className="glass-button glossy-overlay">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.filter((c) => !c.parent_id).map((parent, i) => {
            const subs = items.filter((s) => s.parent_id === parent.id);
            return (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card glossy-overlay overflow-hidden flex flex-col"
              >
                {/* Full image - no fixed height, show completely */}
                {parent.image_url ? (
                  <div className="w-full bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={parent.image_url}
                      alt={parent.name}
                      className="max-w-full object-contain"
                      style={{ maxHeight: '320px', width: 'auto', height: 'auto' }}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-muted" style={{ height: '220px' }} />
                )}

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold">{parent.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{parent.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{subs.length} subcategories</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {/* Edit button opens full dialog with subcategories */}
                      <Button variant="ghost" size="icon" onClick={() => openEditParent(parent)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(parent.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No categories yet.</p>}
        </div>
      </div>

      {/* Edit Parent Dialog — with subcategories inside */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setSubFormVisible(false); }}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          {editParent && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Category — {editParent.name}</DialogTitle>
              </DialogHeader>

              {/* Category fields */}
              <div className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={editParent.name} onChange={(e) => setEditParent({ ...editParent, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editParent.description || ''} onChange={(e) => setEditParent({ ...editParent, description: e.target.value })} />
                </div>
                <div>
                  <Label>Image</Label>
                  <div className="flex items-center gap-3">
                    {editParent.image_url && (
                      <img src={editParent.image_url} alt="" className="h-20 w-20 object-cover border rounded" />
                    )}
                    <label className="flex-1">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadParentImage(e.target.files[0])} />
                      <div className="glass-card border-dashed border px-4 py-3 cursor-pointer flex items-center gap-2 text-sm">
                        <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Change Image'}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Subcategories section */}
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Subcategories ({currentSubs.length})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={() => { setSubForm({ id: '', name: '', description: '' }); setSubFormVisible(true); }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Subcategory
                  </Button>
                </div>

                {/* Inline sub-form */}
                {subFormVisible && (
                  <div className="bg-secondary/40 rounded p-3 mb-3 space-y-2 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{subForm.id ? 'Edit' : 'New'} Subcategory</span>
                      <button onClick={() => { setSubFormVisible(false); setSubForm({ id: '', name: '', description: '' }); }}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input
                        className="h-8 text-sm"
                        value={subForm.name}
                        onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                        placeholder="Subcategory name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        className="h-8 text-sm"
                        value={subForm.description}
                        onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setSubFormVisible(false); setSubForm({ id: '', name: '', description: '' }); }}>Cancel</Button>
                      <Button size="sm" className="h-7 text-xs glass-button glossy-overlay" onClick={saveSub}>Save</Button>
                    </div>
                  </div>
                )}

                {/* Subcategory list */}
                {currentSubs.length === 0 && !subFormVisible ? (
                  <p className="text-xs text-muted-foreground italic">No subcategories yet. Click "Add Subcategory" to create one.</p>
                ) : (
                  <ul className="space-y-1">
                    {currentSubs.map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded">
                        <div>
                          <span className="text-sm font-medium">{sub.name}</span>
                          {sub.description && <p className="text-xs text-muted-foreground">{sub.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setSubForm({ id: sub.id, name: sub.name, description: sub.description || '' }); setSubFormVisible(true); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSub(sub.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={saveParentEdit} className="glass-button glossy-overlay">Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
