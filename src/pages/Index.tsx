import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, Shirt, ChefHat, Baby, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Category } from '@/types/database';
import heroKids from '@/assets/hero-kids.png';
import heroKitchen from '@/assets/hero-kitchen.png';
import heroChef from '@/assets/hero-chef.png';

const heroSlides = [
  {
    id: 'kids', label: 'Kids Wear', image: heroKids, icon: Baby,
    eyebrow: 'New Arrivals · Up to 25% off',
    title: ['Stylish', 'Kids Wear'],
    desc: 'Soft, breathable fabrics designed for tiny chefs in training.',
    badge: 'Mini-chef ready', sub: 'Sizes 2 – 12',
  },
  {
    id: 'kitchen', label: 'Kitchen Wear', image: heroKitchen, icon: Shirt,
    eyebrow: 'Bestsellers · Free shipping',
    title: ['Premium', 'Kitchen Wear'],
    desc: 'Durable, comfortable kitchen clothing crafted for everyday cooking.',
    badge: 'Premium fabrics', sub: 'Soft & durable',
  },
  {
    id: 'chef', label: 'Chef Wear', image: heroChef, icon: ChefHat,
    eyebrow: 'Pro Collection · 20% off',
    title: ['Professional', 'Chef Wear'],
    desc: 'Pro-grade chef uniforms trusted in real kitchens around the world.',
    badge: 'Pro-grade', sub: 'Trusted by chefs',
  },
];

const perks = [
  { icon: Truck,     title: 'Fast Delivery',     desc: 'Fresh to your door in 48h',       color: 'text-festive-teal',   bg: 'bg-festive-teal/10' },
  { icon: Shirt,     title: 'Premium Fabrics',   desc: 'Soft, breathable, built to last', color: 'text-festive-coral',  bg: 'bg-festive-coral/10' },
  { icon: Sparkles,  title: 'Sizes for All',     desc: 'From toddlers to head chefs',     color: 'text-festive-mustard',bg: 'bg-festive-mustard/15' },
  { icon: ChefHat,   title: 'Pro-grade Quality', desc: 'Trusted in real kitchens',        color: 'text-festive-violet', bg: 'bg-festive-violet/10' },
];

const testimonials = [
  { name: 'Priya S.', text: 'The chef jacket is incredibly well made. My son wore it all day without complaints!', rating: 5 },
  { name: 'Rahul M.', text: 'Beautiful quality, fast shipping. Exactly as shown. Will order again.', rating: 5 },
  { name: 'Anita K.', text: 'The kitchen aprons are stunning — my team loves them. Highly recommend!', rating: 5 },
];

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % heroSlides.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[slideIdx];
  const SlideIcon = slide.icon;

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('is_active', true).eq('featured', true).limit(4),
        supabase.from('categories').select('*').is('parent_id', null).limit(3),
      ]);
      setFeaturedProducts((productsRes.data as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative px-4 pt-6 pb-12 md:pb-16">
        <div className="container max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] bg-hero-coral shadow-[0_30px_80px_-20px_hsl(8_70%_40%/0.5)] min-h-[620px]">
            {/* Soft decorative blobs (static, GPU-friendly) */}
            <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-white/15 pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-[300px] h-[300px] rounded-full bg-accent/20 pointer-events-none" />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 120 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -120 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="relative grid lg:grid-cols-2 gap-8 items-center px-6 md:px-12 py-10 md:py-14"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Left copy */}
                <div className="relative z-10 text-white">
                  <p className="text-sm md:text-base font-medium mb-4 text-white/95">
                    {slide.eyebrow}
                  </p>

                  <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.02] mb-5 tracking-tight">
                    {slide.title[0]}<br />{slide.title[1]}
                  </h1>

                  <p className="text-base md:text-lg text-white/90 mb-8 max-w-md leading-relaxed">
                    {slide.desc}
                  </p>

                  <div className="flex items-stretch gap-2 bg-white/95 rounded-full p-1.5 max-w-md shadow-lg mb-6">
                    <button className="flex-1 px-5 py-2.5 text-left text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                      {slide.label}
                    </button>
                    <Link to="/products">
                      <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 h-full text-sm font-semibold">
                        Shop Now
                      </Button>
                    </Link>
                  </div>

                  <div className="inline-flex items-center gap-3 bg-white/20 rounded-full pl-1.5 pr-5 py-1.5 border border-white/30">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-white">
                      <div className="text-xs font-semibold">Our Happy Customers</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="text-[11px] font-bold">8.5</span>
                        <span className="text-[10px] text-white/80">(453k Reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — image */}
                <div className="relative flex items-center justify-center min-h-[420px]">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[90%] aspect-square max-w-[440px] rounded-full bg-white/20" />
                  </div>
                  <img
                    src={slide.image}
                    alt={slide.label}
                    loading="eager"
                    className="relative z-10 max-h-[420px] w-auto object-contain"
                    style={{ filter: 'drop-shadow(0 24px 40px rgba(80,20,15,0.35))' }}
                  />
                  <div className="absolute bottom-4 left-4 z-20 bg-white/95 px-3 py-2 rounded-full shadow-xl flex items-center gap-2">
                    <div className="bg-primary/15 p-1.5 rounded-full">
                      <SlideIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="pr-2">
                      <div className="text-xs font-bold text-foreground">{slide.badge}</div>
                      <div className="text-[10px] text-muted-foreground">{slide.sub}</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-20 bg-white/90 px-3 py-1 rounded-full text-[11px] font-bold text-primary shadow-lg">
                    {slide.label}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Show ${s.label}`}
                  onClick={() => setSlideIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === slideIdx ? 'w-8 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>

            {/* Bottom row — sign up */}
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-12 pb-6 text-white/95">
              <span className="text-xs">Not Yet Member?</span>
              <Link to="/auth">
                <button className="bg-white/25 hover:bg-white/35 text-white text-xs font-semibold rounded-full px-4 py-1.5 border border-white/30 transition-colors">
                  Sign Up Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-3 group"
              >
                <div className={`p-3 rounded-xl ${perk.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <perk.icon className={`h-5 w-5 ${perk.color}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{perk.title}</div>
                  <div className="text-xs text-muted-foreground">{perk.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Premium Shades</h2>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full ${i === 2 ? 'w-6 bg-primary' : 'w-1.5 bg-primary/30'}`}
                  />
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/categories">
                <Button variant="outline" className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                  View All Collections <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="section-label">Bestsellers</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Featured Products</h2>
            </div>
            <Link to="/products" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-label">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">What Our Customers Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-semibold">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-primary rounded-2xl text-primary-foreground p-10 md:p-16 text-center overflow-hidden"
          >
            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-5">
                <Sparkles className="h-3 w-3" /> Limited Time
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Dressed for the moment,<br />made for the kitchen.
              </h2>
              <p className="text-primary-foreground/75 max-w-xl mx-auto mb-8 text-lg">
                Explore our full range of kids wear, chef uniforms and kitchen clothing.
              </p>
              <Link to="/products">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-sm font-semibold shadow-xl hover:shadow-2xl transition-shadow">
                  Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
