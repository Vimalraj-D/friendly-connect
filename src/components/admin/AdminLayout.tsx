import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminGuard } from './AdminGuard';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-pattern">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b border-border/50 glass-card px-4 sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Link to="/admin" className="text-lg font-display font-bold text-gradient">
                  G&G Admin
                </Link>
                <span className="text-muted-foreground hidden sm:inline">/ {title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1" /> Sign out
                </Button>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
