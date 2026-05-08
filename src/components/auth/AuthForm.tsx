import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const pwd = formData.password;
  const pwdChecks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const isPasswordValid = Object.values(pwdChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            toast.error('Please verify your email before signing in. Check your inbox.');
          } else if (error.message.toLowerCase().includes('invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success('Welcome back!');
        onSuccess?.();
      } else {
        if (!formData.fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!isPasswordValid) {
          toast.error('Password does not meet requirements');
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
            toast.error('An account with this email already exists. Please sign in instead.');
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        setVerificationSent(formData.email);
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="glass-card p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Verify your email</h2>
          <p className="text-muted-foreground mb-4">
            We sent a verification link to <strong className="text-foreground">{verificationSent}</strong>.
            Click the link in the email to activate your account, then sign in.
          </p>
          <Button
            onClick={() => { setVerificationSent(null); setIsLogin(true); }}
            className="w-full glass-button glossy-overlay"
          >
            Back to Sign In
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isLogin
              ? 'Sign in to access your account'
              : 'Join us and start shopping'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required={!isLogin}
                className="bg-background/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={isLogin ? 6 : 8}
                className="bg-background/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {!isLogin && pwd.length > 0 && (
              <div className="space-y-1 text-xs mt-2">
                {[
                  { ok: pwdChecks.length, label: 'At least 8 characters' },
                  { ok: pwdChecks.upper, label: 'One uppercase letter' },
                  { ok: pwdChecks.lower, label: 'One lowercase letter' },
                  { ok: pwdChecks.number, label: 'One number' },
                  { ok: pwdChecks.special, label: 'One special character' },
                ].map((c) => (
                  <div key={c.label} className={`flex items-center gap-1.5 ${c.ok ? 'text-primary' : 'text-muted-foreground'}`}>
                    {c.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full glass-button glossy-overlay"
            disabled={loading || !isEmailValid || (!isLogin && !isPasswordValid)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
