import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, User, Shield, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    graduation_year: '',
    industry: '',
    company: '',
    job_title: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    linkedin_url: '',
    bio: '',
    primary_contact_method: 'email',
    show_email: false,
    show_phone: false,
    show_whatsapp: false,
    show_linkedin: true,
    pref_anonymous: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        graduation_year: profile.graduation_year?.toString() || '',
        industry: profile.industry || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        location: profile.location || '',
        contact_email: profile.contact_email || '',
        contact_phone: profile.contact_phone || '',
        contact_whatsapp: profile.contact_whatsapp || '',
        linkedin_url: profile.linkedin_url || '',
        bio: profile.bio || '',
        primary_contact_method: profile.primary_contact_method || 'email',
        show_email: profile.show_email || false,
        show_phone: profile.show_phone || false,
        show_whatsapp: profile.show_whatsapp || false,
        show_linkedin: profile.show_linkedin || true,
        pref_anonymous: profile.pref_anonymous || false,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          industry: formData.industry,
          company: formData.company,
          job_title: formData.job_title,
          location: formData.location,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_whatsapp: formData.contact_whatsapp,
          linkedin_url: formData.linkedin_url,
          bio: formData.bio,
          primary_contact_method: formData.primary_contact_method as 'email' | 'linkedin' | 'phone' | 'whatsapp',
          show_email: formData.show_email,
          show_phone: formData.show_phone,
          show_whatsapp: formData.show_whatsapp,
          show_linkedin: formData.show_linkedin,
          pref_anonymous: formData.pref_anonymous,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground">Update your profile information and privacy settings</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Basic information about yourself and your professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year *</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                    placeholder="e.g., 2020"
                    min="1980"
                    max="2030"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry/Field *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Software Engineering"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your current employer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="Your current position"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio/About</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your achievements, interests..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How other alumni can reach out to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="your.email@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+92 XXX XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_whatsapp">WhatsApp Number</Label>
                  <Input
                    id="contact_whatsapp"
                    value={formData.contact_whatsapp}
                    onChange={(e) => handleInputChange('contact_whatsapp', e.target.value)}
                    placeholder="+92 XXX XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_contact_method">Primary Contact Method</Label>
                <Select 
                  value={formData.primary_contact_method} 
                  onValueChange={(value) => handleInputChange('primary_contact_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control what information is visible to other alumni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Anonymous Profile</div>
                    <div className="text-xs text-muted-foreground">
                      Hide all contact details, show only basic info
                    </div>
                  </div>
                  <Switch
                    checked={formData.pref_anonymous}
                    onCheckedChange={(checked) => handleInputChange('pref_anonymous', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="text-sm font-medium mb-2">Contact Visibility</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show Email</span>
                    </div>
                    <Switch
                      checked={formData.show_email}
                      onCheckedChange={(checked) => handleInputChange('show_email', checked)}
                      disabled={formData.pref_anonymous}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show Phone</span>
                    </div>
                    <Switch
                      checked={formData.show_phone}
                      onCheckedChange={(checked) => handleInputChange('show_phone', checked)}
                      disabled={formData.pref_anonymous}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show WhatsApp</span>
                    </div>
                    <Switch
                      checked={formData.show_whatsapp}
                      onCheckedChange={(checked) => handleInputChange('show_whatsapp', checked)}
                      disabled={formData.pref_anonymous}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show LinkedIn</span>
                    </div>
                    <Switch
                      checked={formData.show_linkedin}
                      onCheckedChange={(checked) => handleInputChange('show_linkedin', checked)}
                      disabled={formData.pref_anonymous}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Status:</span>
                  <span className={profile?.verified ? "text-green-600" : "text-orange-600"}>
                    {profile?.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Role:</span>
                  <span className="capitalize">{profile?.role?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email Status:</span>
                  <span className={profile?.email_verified ? "text-green-600" : "text-orange-600"}>
                    {profile?.email_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}