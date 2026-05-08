import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, address }).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert({ user_id: user.id, full_name: fullName, phone, address });
        if (error) throw error;
      }
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-8">My Account</h1>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="glass-card p-6 space-y-4"
        >
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">Default Shipping Address</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="glass-button glossy-overlay">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={async () => { await signOut(); navigate('/'); }}>
              Sign Out
            </Button>
          </div>
        </motion.form>
      </div>
    </Layout>
  );
}