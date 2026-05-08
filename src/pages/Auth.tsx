import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container px-4 py-16">
        <AuthForm onSuccess={() => navigate('/')} />
      </div>
    </Layout>
  );
}
