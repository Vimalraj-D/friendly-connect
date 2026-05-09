import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Collections' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-background/80 backdrop-blur-sm border-b border-border/50'
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col leading-none"
          >
            <span className="text-lg font-display font-bold text-gradient tracking-tight">
              Garnish & Giggles
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Premium Kitchen Wear
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/8"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold rounded-full shadow"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 hover:bg-primary/8">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-card shadow-xl">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')}>
                  <Package className="mr-2 h-4 w-4" /> Order History
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary font-medium">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="glass-button hidden sm:flex ml-2 px-5"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          )}

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-t border-border shadow-lg"
          >
            <nav className="container flex flex-col py-4 px-4 gap-1 max-w-7xl mx-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground/80'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Button
                  className="mt-2 glass-button"
                  onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                >
                  Sign In
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
