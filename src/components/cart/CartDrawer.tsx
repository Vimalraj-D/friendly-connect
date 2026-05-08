import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/database';

export function CartItems() {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">
          Start shopping to add items to your cart
        </p>
        <Link to="/products">
          <Button className="glass-button glossy-overlay">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const product = item.product as Product;
        if (!product) return null;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 p-4 glass-card"
          >
            {/* Product Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-muted overflow-hidden">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/products/${product.id}`}
                className="font-medium hover:text-primary transition-colors line-clamp-1"
              >
                {product.name}
              </Link>
              <p className="text-primary font-bold mt-1">
                ${product.price.toFixed(2)}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(product.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(product.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex flex-col items-end justify-between">
              <span className="font-bold">
                ${(product.price * item.quantity).toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeFromCart(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );
      })}

      {/* Total */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
