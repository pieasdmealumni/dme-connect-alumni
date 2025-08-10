import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Shield, Users, UserCheck, UserX, Edit, Trash2, Download, Upload, Settings } from 'lucide-react';

interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  contact_email: string;
  graduation_year?: number;
  industry?: string;
  company?: string;
  location?: string;
  role: string;
  verified: boolean;
  email_verified: boolean;
  created_at: string;
  pref_anonymous: boolean;
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllProfiles();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, roleFilter, verificationFilter, profiles]);

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(profile => profile.role === roleFilter);
    }

    if (verificationFilter === 'verified') {
      filtered = filtered.filter(profile => profile.verified);
    } else if (verificationFilter === 'unverified') {
      filtered = filtered.filter(profile => !profile.verified);
    }

    setFilteredProfiles(filtered);
  };

  const updateProfileRole = async (profileId: string, newRole: 'admin' | 'verified_alumni' | 'alumni' | 'guest') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.map(profile => 
        profile.id === profileId ? { ...profile, role: newRole } : profile
      ));

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfileVerification = async (profileId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.map(profile => 
        profile.id === profileId ? { ...profile, verified } : profile
      ));

      toast({
        title: verified ? "Profile Verified" : "Verification Removed",
        description: `Profile has been ${verified ? 'verified' : 'unverified'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.filter(profile => profile.id !== profileId));

      toast({
        title: "Profile Deleted",
        description: "User profile has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const csvData = profiles.map(profile => ({
      'Full Name': profile.full_name,
      'Email': profile.contact_email,
      'Graduation Year': profile.graduation_year,
      'Industry': profile.industry,
      'Company': profile.company,
      'Location': profile.location,
      'Role': profile.role,
      'Verified': profile.verified ? 'Yes' : 'No',
      'Email Verified': profile.email_verified ? 'Yes' : 'No',
      'Anonymous': profile.pref_anonymous ? 'Yes' : 'No',
      'Created At': new Date(profile.created_at).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alumni-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, verification, and portal settings</p>
        </div>
        <Button onClick={exportData} className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Alumni</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.verified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => !p.verified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anonymous Profiles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.pref_anonymous).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="verified_alumni">Verified Alumni</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Users</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            Showing {filteredProfiles.length} of {profiles.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles, verification status, and profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} />
                        <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.graduation_year && `Class of ${profile.graduation_year}`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{profile.contact_email}</div>
                      {profile.company && (
                        <div className="text-muted-foreground">{profile.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={profile.role} 
                      onValueChange={(value) => updateProfileRole(profile.id, value as 'admin' | 'verified_alumni' | 'alumni' | 'guest')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                            {profile.role.replace('_', ' ')}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="verified_alumni">Verified Alumni</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={profile.verified ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateProfileVerification(profile.id, !profile.verified)}
                        >
                          {profile.verified ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        </Button>
                        <span className="text-xs">
                          {profile.verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                      {profile.pref_anonymous && (
                        <Badge variant="outline" className="text-xs">Anonymous</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              View and manage user profile information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedProfile && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Full Name:</strong> {selectedProfile.full_name}
                                </div>
                                <div>
                                  <strong>Email:</strong> {selectedProfile.contact_email}
                                </div>
                                <div>
                                  <strong>Graduation Year:</strong> {selectedProfile.graduation_year || 'N/A'}
                                </div>
                                <div>
                                  <strong>Industry:</strong> {selectedProfile.industry || 'N/A'}
                                </div>
                                <div>
                                  <strong>Company:</strong> {selectedProfile.company || 'N/A'}
                                </div>
                                <div>
                                  <strong>Location:</strong> {selectedProfile.location || 'N/A'}
                                </div>
                                <div>
                                  <strong>Role:</strong> {selectedProfile.role}
                                </div>
                                <div>
                                  <strong>Verified:</strong> {selectedProfile.verified ? 'Yes' : 'No'}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete User Profile</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to permanently delete {profile.full_name}'s profile? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => deleteProfile(profile.id)}
                            >
                              Delete Profile
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}