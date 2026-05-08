import { Link } from 'react-router-dom';
import { ChefHat, Mail, Phone, Clock, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">

      {/* Newsletter strip */}
      <div className="border-b border-background/10">
        <div className="container max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-display font-bold text-background">Stay in the loop</h3>
            <p className="text-background/60 text-sm mt-1">New arrivals, exclusive deals and kitchen inspiration.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-64 px-4 py-2.5 bg-background/10 border border-background/20 text-background placeholder:text-background/40 text-sm focus:outline-none focus:border-accent rounded-md"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-1 mb-4">
              <div className="bg-accent/20 p-2 rounded-md">
                <ChefHat className="h-2 w-5 text-accent" />
              </div>
              <span className="text-xl font-display font-bold text-background">Garnish & Giggles</span>
            </div>
            <p className="text-background/55 text-sm leading-relaxed max-w-xs">
              Premium kids wear, chef uniforms and kitchen clothing — designed for little dreamers and serious cooks alike.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="h-4 w-4 rounded-md bg-background/10 hover:bg-accent/30 transition-colors flex items-center justify-center">
                  <Icon className="h-4 w-4 text-background/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-background/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { to: '/products', label: 'All Products' },
                { to: '/categories', label: 'Collections' },
                { to: '/products?featured=true', label: 'New Arrivals' },
                { to: '/products?sale=true', label: 'Sale' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-background/60 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-background/40 mb-5">Account</h4>
            <ul className="space-y-1">
              {[
                { to: '/account', label: 'My Account' },
                { to: '/orders', label: 'Order History' },
                { to: '/cart', label: 'My Cart' },
                { to: '/auth', label: 'Sign In' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-background/60 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-background/40 mb-5">Get in Touch</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <Mail className="h-2 w-2 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-background/60">support@garnishandgiggles.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-2 w-2 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-background/60">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-2 w-2 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-background/60">Mon – Fri: 9am – 6pm IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} Garnish & Giggles. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            {['Privacy Policy', 'Terms of Service', 'Returns'].map((t) => (
              <a key={t} href="#" className="text-background/40 hover:text-background/70 text-xs transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
