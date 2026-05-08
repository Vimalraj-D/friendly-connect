import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types/database';
import { Loader2, ChevronRight } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) || []);
      setLoading(false);
    });
  }, []);

  const parents = categories.filter((c) => !c.parent_id);
  const subsByParent = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-2">Shop by Category</h1>
        <p className="text-muted-foreground mb-8">Kids wear, chef wear and kitchen clothing</p>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : parents.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No categories yet.</p>
        ) : (
          <div className="space-y-12">
            {parents.map((parent, i) => {
              const subs = subsByParent(parent.id);
              return (
                <section key={parent.id}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <CategoryCard category={parent} index={i} />
                    </div>
                    <div className="lg:col-span-2">
                      {subs.length > 0 ? (
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                            {parent.name} subcategories
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/products?category=${sub.id}`}
                                className="group flex items-center justify-between border border-border bg-card px-4 py-3 hover:border-primary hover:bg-secondary/50 transition-colors"
                              >
                                <span className="text-sm font-medium">{sub.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center text-sm text-muted-foreground">
                          No subcategories yet.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}