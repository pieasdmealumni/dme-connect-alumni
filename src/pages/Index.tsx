import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-primary mb-4">
            PIEAS DME Alumni Portal
          </h1>
          <h2 className="text-2xl text-muted-foreground mb-2">
            Pakistan Institute of Engineering and Applied Sciences
          </h2>
          <p className="text-lg text-muted-foreground">
            Department of Mechanical Engineering
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <p className="text-lg text-foreground">
            Connect with fellow alumni, explore career opportunities, and stay engaged with our community.
          </p>
          <p className="text-muted-foreground">
            Join thousands of mechanical engineering professionals in our growing network.
          </p>
        </div>

        <div className="space-x-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="px-8 py-3"
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="px-8 py-3"
          >
            Learn More
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Network</h3>
            <p className="text-muted-foreground text-sm">
              Connect with alumni across industries and locations
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Opportunities</h3>
            <p className="text-muted-foreground text-sm">
              Discover jobs, events, and collaboration opportunities
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Community</h3>
            <p className="text-muted-foreground text-sm">
              Stay connected with your alma mater and fellow graduates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
