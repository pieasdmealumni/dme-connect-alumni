import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Globe, TrendingUp, Users, MapPin } from 'lucide-react';

interface AnalyticsData {
  alumniByYear: { year: number; count: number }[];
  alumniByIndustry: { industry: string; count: number }[];
  alumniByLocation: { location: string; count: number }[];
  contactPreferences: { method: string; count: number }[];
  totalStats: {
    total: number;
    verified: number;
    recentJoins: number;
    activeProfiles: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    alumniByYear: [],
    alumniByIndustry: [],
    alumniByLocation: [],
    contactPreferences: [],
    totalStats: { total: 0, verified: 0, recentJoins: 0, activeProfiles: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Process data for analytics
      const alumniByYear = processAlumniByYear(profiles || []);
      const alumniByIndustry = processAlumniByIndustry(profiles || []);
      const alumniByLocation = processAlumniByLocation(profiles || []);
      const contactPreferences = processContactPreferences(profiles || []);
      const totalStats = processTotalStats(profiles || []);

      setData({
        alumniByYear,
        alumniByIndustry,
        alumniByLocation,
        contactPreferences,
        totalStats
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAlumniByYear = (profiles: any[]) => {
    const yearCounts: { [key: number]: number } = {};
    profiles.forEach(profile => {
      if (profile.graduation_year) {
        yearCounts[profile.graduation_year] = (yearCounts[profile.graduation_year] || 0) + 1;
      }
    });
    
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  };

  const processAlumniByIndustry = (profiles: any[]) => {
    const industryCounts: { [key: string]: number } = {};
    profiles.forEach(profile => {
      if (profile.industry) {
        industryCounts[profile.industry] = (industryCounts[profile.industry] || 0) + 1;
      }
    });
    
    return Object.entries(industryCounts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 industries
  };

  const processAlumniByLocation = (profiles: any[]) => {
    const locationCounts: { [key: string]: number } = {};
    profiles.forEach(profile => {
      if (profile.location) {
        // Extract country from "City, Country" format
        const parts = profile.location.split(',');
        const country = parts.length > 1 ? parts[parts.length - 1].trim() : profile.location;
        locationCounts[country] = (locationCounts[country] || 0) + 1;
      }
    });
    
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 locations
  };

  const processContactPreferences = (profiles: any[]) => {
    const preferences = {
      'Email Visible': 0,
      'Phone Visible': 0,
      'WhatsApp Visible': 0,
      'LinkedIn Visible': 0,
      'Anonymous': 0
    };
    
    profiles.forEach(profile => {
      if (profile.pref_anonymous) {
        preferences['Anonymous']++;
      } else {
        if (profile.show_email) preferences['Email Visible']++;
        if (profile.show_phone) preferences['Phone Visible']++;
        if (profile.show_whatsapp) preferences['WhatsApp Visible']++;
        if (profile.show_linkedin) preferences['LinkedIn Visible']++;
      }
    });
    
    return Object.entries(preferences).map(([method, count]) => ({ method, count }));
  };

  const processTotalStats = (profiles: any[]) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      total: profiles.length,
      verified: profiles.filter(p => p.verified).length,
      recentJoins: profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length,
      activeProfiles: profiles.filter(p => !p.pref_anonymous && (p.contact_email || p.contact_phone || p.contact_whatsapp || p.linkedin_url)).length
    };
  };

  const exportData = (format: 'csv' | 'json') => {
    const dataToExport = {
      totalStats: data.totalStats,
      alumniByYear: data.alumniByYear,
      alumniByIndustry: data.alumniByIndustry,
      alumniByLocation: data.alumniByLocation,
      contactPreferences: data.contactPreferences,
      generatedAt: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Analytics Report - PIEAS DME Alumni Portal\n\n';
      csv += `Total Alumni,${data.totalStats.total}\n`;
      csv += `Verified Alumni,${data.totalStats.verified}\n`;
      csv += `Recent Joins (30 days),${data.totalStats.recentJoins}\n`;
      csv += `Active Profiles,${data.totalStats.activeProfiles}\n\n`;
      
      csv += 'Alumni by Graduation Year\n';
      csv += 'Year,Count\n';
      data.alumniByYear.forEach(item => csv += `${item.year},${item.count}\n`);
      
      csv += '\nAlumni by Industry\n';
      csv += 'Industry,Count\n';
      data.alumniByIndustry.forEach(item => csv += `${item.industry},${item.count}\n`);
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alumni-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alumni-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alumni Analytics</h1>
          <p className="text-muted-foreground">Insights and statistics about the PIEAS DME alumni network</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')} className="gap-2">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Alumni</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {((data.totalStats.verified / data.totalStats.total) * 100).toFixed(1)}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Joins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.recentJoins}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Profiles</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.activeProfiles}</div>
            <p className="text-xs text-muted-foreground">
              With contact info visible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alumni by Graduation Year */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni by Graduation Year</CardTitle>
            <CardDescription>Distribution of alumni across different batches</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.alumniByYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alumni by Industry */}
        <Card>
          <CardHeader>
            <CardTitle>Top Industries</CardTitle>
            <CardDescription>Most common industries among alumni</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.alumniByIndustry} layout="horizontal" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="industry" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alumni by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Alumni locations worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.alumniByLocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ location, count }) => `${location}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.alumniByLocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contact Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Preferences</CardTitle>
            <CardDescription>How alumni prefer to be contacted</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.contactPreferences}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alumni World Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alumni World Map
          </CardTitle>
          <CardDescription>Global distribution of PIEAS DME alumni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Interactive World Map</h3>
              <p className="text-muted-foreground">World map visualization showing alumni locations globally</p>
              <p className="text-sm text-muted-foreground mt-2">
                {data.alumniByLocation.length} countries represented
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}