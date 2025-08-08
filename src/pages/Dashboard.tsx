import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Briefcase, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalAlumni: number;
  totalEvents: number;
  totalJobs: number;
  recentJoins: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlumni: 0,
    totalEvents: 0,
    totalJobs: 0,
    recentJoins: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total alumni count
        const { count: alumniCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        // Get total active jobs count
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Get recent joins (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        setStats({
          totalAlumni: alumniCount || 0,
          totalEvents: eventsCount || 0,
          totalJobs: jobsCount || 0,
          recentJoins: recentCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'verified_alumni': return 'Verified Alumni';
      case 'alumni': return 'Alumni';
      case 'guest': return 'Guest';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'verified_alumni': return 'default';
      case 'alumni': return 'secondary';
      case 'guest': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getWelcomeMessage()}, {profile?.full_name}!
            </h1>
            <p className="text-primary-foreground/80 mt-1">
              Welcome to the PIEAS DME Alumni Portal
            </p>
          </div>
          <div className="text-right">
            <Badge variant={getRoleBadgeVariant(profile?.role || '')} className="mb-2">
              {getRoleDisplayName(profile?.role || '')}
            </Badge>
            {profile?.verified && (
              <div className="text-sm text-primary-foreground/80">
                ✓ Verified Alumni
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlumni}</div>
            <p className="text-xs text-muted-foreground">
              Connected professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Networking opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Career opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentJoins}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Profile Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Update your contact information</li>
                <li>• Add your current job details</li>
                <li>• Update privacy settings</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Networking</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Browse alumni directory</li>
                <li>• Connect with classmates</li>
                <li>• Join upcoming events</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alumni Spotlight</CardTitle>
            <CardDescription>
              Celebrating our community achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Our alumni network spans across various industries and continents, 
                making significant contributions to engineering and technology.
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Department:</strong> Mechanical Engineering
                </div>
                <div className="text-sm">
                  <strong>Institution:</strong> Pakistan Institute of Engineering and Applied Sciences
                </div>
                <div className="text-sm">
                  <strong>Network Strength:</strong> {stats.totalAlumni} professionals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}