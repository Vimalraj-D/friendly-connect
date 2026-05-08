import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, ArrowRight, Minus, Plus, Star, Heart, Share2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductGrid } from '@/components/products/ProductGrid';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colorPalette = [
    'hsl(188 80% 60%)',
    'hsl(36 100% 56%)',
    'hsl(48 90% 60%)',
    'hsl(30 20% 55%)',
  ];
  const sizes = ['37', '38', '39', '40', '41', '42'];

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .maybeSingle();
      setProduct(data as Product | null);
      if (data?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', data.category_id)
          .eq('is_active', true)
          .neq('id', id)
          .limit(4);
        setRelated((rel as Product[]) || []);
      }
      setLoading(false);
    }
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please sign in to order products');
      navigate('/auth');
      return;
    }
    if (!product || product.stock === 0) {
      toast.error('Out of stock');
      return;
    }
    await addToCart(product.id, qty);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-10">
          <Skeleton className="h-[560px] w-full rounded-[2rem]" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Product not found</h1>
          <Link to="/products"><Button>Back to products</Button></Link>
        </div>
      </Layout>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Layout>
      <div className="container px-4 py-6 md:py-8">
        {/* Top bar: breadcrumb + title + next */}
        <div className="bg-hero-gradient relative overflow-hidden rounded-[2rem] px-6 md:px-10 py-6 md:py-8 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Home <span className="opacity-50">/</span> Product details
            </button>
            <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight">
              Product Details
            </h1>
            <button className="hidden md:inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors">
              Next Product <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main glass panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card relative px-6 md:px-12 py-10 md:py-14 rounded-[2rem]"
        >
          <div className="grid md:grid-cols-[1.1fr_1.2fr_1fr] gap-8 md:gap-10 items-center">
            {/* LEFT — Title + description + thumbs */}
            <div className="space-y-6">
              {product.category && (
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {product.category.name}
                </p>
              )}
              <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight text-foreground">
                {product.name}
              </h2>
              <p className="text-foreground/70 leading-relaxed max-w-sm">
                {product.description || 'A delightful pick from our curated collection — crafted with care and built to last.'}
              </p>

              {/* thumb gallery (decorative + main) */}
              <div className="flex items-center gap-3 pt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border/60 flex items-center justify-center"
                  >
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt=""
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER — Circular product showcase */}
            <div className="relative flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-[420px]">
                {/* halo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-2xl" />
                <div className="absolute inset-3 rounded-full bg-card/80 backdrop-blur-md border border-border/50" />
                <div className="absolute inset-0 rounded-full border border-dashed border-foreground/15" />
                <motion.img
                  initial={{ scale: 0.9, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: -6, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] object-contain drop-shadow-2xl"
                />
                {/* price chip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-5 py-2 rounded-full bg-card shadow-lg border border-border/60">
                  <span className="text-xl font-display font-bold text-accent">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="absolute top-4 right-4 badge-primary rounded-full">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Review, color, size, CTA */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground/70 mr-1">Review:</span>
                {[0, 1, 2, 3].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <Star className="h-4 w-4 fill-primary/50 text-primary" />
                <span className="text-sm text-foreground/70 ml-1">4.5 (60)</span>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground/70 mb-2">Color:</p>
                <div className="flex items-center gap-3">
                  {colorPalette.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === i ? 'border-accent scale-110' : 'border-transparent'
                      }`}
                      style={{ background: c }}
                      aria-label={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground/70 mb-2">Size:</p>
                <div className="grid grid-cols-3 gap-2 max-w-[260px]">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                        selectedSize === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card/60 border-border hover:border-primary/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center border border-border rounded-full overflow-hidden bg-card/60">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.stock > 5 ? 'In stock' : `Only ${product.stock} left`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-base font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </Button>
                <button className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold">Related Product</h2>
              <p className="text-sm text-muted-foreground">
                Showing 1–{related.length} of {related.length} results
              </p>
            </div>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </Layout>
  );
}
