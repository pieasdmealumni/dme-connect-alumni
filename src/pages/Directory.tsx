import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, MapPin, Building, Calendar, Mail, Phone, MessageCircle, Linkedin, User } from 'lucide-react';

interface AlumniProfile {
  id: string;
  full_name: string;
  graduation_year?: number;
  industry?: string;
  company?: string;
  job_title?: string;
  location?: string;
  bio?: string;
  verified: boolean;
  role: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  linkedin_url?: string;
  show_email: boolean;
  show_phone: boolean;
  show_whatsapp: boolean;
  show_linkedin: boolean;
  pref_anonymous: boolean;
  primary_contact_method: string;
}

export default function Directory() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);

  const [industries, setIndustries] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, selectedIndustry, selectedYear, selectedLocation, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('pref_anonymous', false)
        .order('full_name');

      if (error) throw error;

      setProfiles(data || []);
      
      // Extract unique values for filters
      const uniqueIndustries = [...new Set(data?.map(p => p.industry).filter(Boolean))] as string[];
      const uniqueYears = [...new Set(data?.map(p => p.graduation_year).filter(Boolean))] as number[];
      const uniqueLocations = [...new Set(data?.map(p => p.location).filter(Boolean))] as string[];
      
      setIndustries(uniqueIndustries);
      setYears(uniqueYears.sort((a, b) => b - a));
      setLocations(uniqueLocations);
      
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(profile => profile.industry === selectedIndustry);
    }

    if (selectedYear) {
      filtered = filtered.filter(profile => profile.graduation_year?.toString() === selectedYear);
    }

    if (selectedLocation) {
      filtered = filtered.filter(profile => profile.location === selectedLocation);
    }

    setFilteredProfiles(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedYear('');
    setSelectedLocation('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const ContactButton = ({ profile, type }: { profile: AlumniProfile; type: 'email' | 'phone' | 'whatsapp' | 'linkedin' }) => {
    const getContactInfo = () => {
      switch (type) {
        case 'email':
          return { value: profile.contact_email, icon: Mail, href: `mailto:${profile.contact_email}` };
        case 'phone':
          return { value: profile.contact_phone, icon: Phone, href: `tel:${profile.contact_phone}` };
        case 'whatsapp':
          return { value: profile.contact_whatsapp, icon: MessageCircle, href: `https://wa.me/${profile.contact_whatsapp?.replace(/[^\d]/g, '')}` };
        case 'linkedin':
          return { value: profile.linkedin_url, icon: Linkedin, href: profile.linkedin_url };
        default:
          return null;
      }
    };

    const shouldShow = () => {
      switch (type) {
        case 'email': return profile.show_email && profile.contact_email;
        case 'phone': return profile.show_phone && profile.contact_phone;
        case 'whatsapp': return profile.show_whatsapp && profile.contact_whatsapp;
        case 'linkedin': return profile.show_linkedin && profile.linkedin_url;
        default: return false;
      }
    };

    if (!shouldShow()) return null;

    const contactInfo = getContactInfo();
    if (!contactInfo) return null;

    const Icon = contactInfo.icon;
    const isPrimary = profile.primary_contact_method === type;

    return (
      <Button
        variant={isPrimary ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => window.open(contactInfo.href, '_blank')}
      >
        <Icon className="h-4 w-4" />
        {isPrimary && "Primary"}
      </Button>
    );
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
      <div>
        <h1 className="text-3xl font-bold">Alumni Directory</h1>
        <p className="text-muted-foreground">Connect with your fellow PIEAS DME alumni</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, job title, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Batch" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredProfiles.length} of {profiles.length} alumni
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} />
                  <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{profile.full_name}</h3>
                    {profile.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  
                  {profile.job_title && (
                    <p className="text-sm text-muted-foreground truncate">{profile.job_title}</p>
                  )}
                  
                  {profile.company && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{profile.company}</span>
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.graduation_year && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Class of {profile.graduation_year}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <ContactButton profile={profile} type="email" />
                  <ContactButton profile={profile} type="linkedin" />
                  <ContactButton profile={profile} type="whatsapp" />
                  <ContactButton profile={profile} type="phone" />
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)}>
                      <User className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{profile.full_name}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedProfile && (
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedProfile.full_name}`} />
                            <AvatarFallback>{getInitials(selectedProfile.full_name)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold">{selectedProfile.full_name}</h3>
                              {selectedProfile.verified && (
                                <Badge variant="secondary">Verified Alumni</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              {selectedProfile.job_title && (
                                <p className="font-medium">{selectedProfile.job_title}</p>
                              )}
                              {selectedProfile.company && (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                  <span>{selectedProfile.company}</span>
                                </div>
                              )}
                              {selectedProfile.industry && (
                                <p className="text-muted-foreground">{selectedProfile.industry}</p>
                              )}
                              {selectedProfile.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{selectedProfile.location}</span>
                                </div>
                              )}
                              {selectedProfile.graduation_year && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>Class of {selectedProfile.graduation_year}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {selectedProfile.bio && (
                          <div>
                            <h4 className="font-medium mb-2">About</h4>
                            <p className="text-muted-foreground">{selectedProfile.bio}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-3">Contact Information</h4>
                          <div className="flex gap-2 flex-wrap">
                            <ContactButton profile={selectedProfile} type="email" />
                            <ContactButton profile={selectedProfile} type="linkedin" />
                            <ContactButton profile={selectedProfile} type="whatsapp" />
                            <ContactButton profile={selectedProfile} type="phone" />
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No alumni found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or clear the filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}