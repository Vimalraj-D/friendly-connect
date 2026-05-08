import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CartItems } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const { items, total } = useCart();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
        <CartItems />
        {items.length > 0 && (
          <div className="mt-6">
            {user ? (
              <Link to="/checkout">
                <Button className="w-full glass-button glossy-overlay" size="lg">
                  Proceed to Checkout - ${total.toFixed(2)}
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="w-full glass-button glossy-overlay" size="lg">
                  Sign in to Checkout
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
