import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to order products');
      navigate('/auth');
      return;
    }
    if (product.stock === 0) {
      toast.error('Out of stock');
      return;
    }
    addToCart(product.id);
    toast.success('Added to cart!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="product-card group"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="product-image w-full h-full object-cover"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge-accent text-[10px] px-2 py-0.5 shadow-md">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="badge-primary text-[10px] px-2 py-0.5 shadow-md">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-accent-foreground shadow">
          <Heart className="h-3.5 w-3.5" />
        </button>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link to={`/products/${product.id}`} className="flex-1">
            <button className="w-full py-2 px-3 bg-background/95 backdrop-blur-sm text-foreground text-xs font-semibold rounded-md hover:bg-background transition-colors flex items-center justify-center gap-1.5 shadow-lg">
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 py-2 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/products/${product.id}`} className="block p-4">
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent mb-1.5">
            {product.category.name}
          </p>
        )}
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[10px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded">
              {product.stock} left
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
