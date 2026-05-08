import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Category } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let query = supabase.from('products').select('*, category:categories(*)').eq('is_active', true);
      if (selectedCategory) query = query.eq('category_id', selectedCategory);
      if (search) query = query.ilike('name', `%${search}%`);
      const [productsRes, categoriesRes] = await Promise.all([
        query,
        supabase.from('categories').select('*'),
      ]);
      setProducts((productsRes.data as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedCategory, search]);

  const mainCategories = categories.filter((cat) => !cat.parent_id);
  const selectedCat = mainCategories.find((c) => c.id === selectedCategory);

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-10">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="section-label">Our Store</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold mt-2">
            {selectedCat ? selectedCat.name : 'All Products'}
          </h1>
          {selectedCat?.description && (
            <p className="text-muted-foreground mt-2 max-w-xl">{selectedCat.description}</p>
          )}
        </motion.div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 glass-card rounded-xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="h-10 px-3 bg-muted/40 border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Categories</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs text-muted-foreground">Filtered by:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors"
              >
                {selectedCat?.name}
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        )}

        <ProductGrid products={products} loading={loading} />
      </div>
    </Layout>
  );
}
