-- Create enums for user roles and contact methods
CREATE TYPE public.user_role AS ENUM ('admin', 'verified_alumni', 'alumni', 'guest');
CREATE TYPE public.contact_method AS ENUM ('email', 'linkedin', 'phone', 'whatsapp');

-- Create users table (extends auth.users with additional fields)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'alumni',
  email_verified BOOLEAN DEFAULT false,
  
  -- Profile information
  graduation_year INTEGER,
  department TEXT DEFAULT 'Mechanical Engineering',
  location TEXT,
  industry TEXT,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  skills TEXT[],
  
  -- Contact information
  contact_email TEXT,
  contact_linkedin TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  primary_contact_method contact_method DEFAULT 'email',
  
  -- Privacy settings
  show_email BOOLEAN DEFAULT false,
  show_linkedin BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT false,
  show_whatsapp BOOLEAN DEFAULT false,
  pref_anonymous BOOLEAN DEFAULT false,
  privacy_settings JSONB DEFAULT '{}',
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity logs table for admin tracking
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table for future expansion
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table for future expansion
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN pref_anonymous = true THEN false
    ELSE true
  END
);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- RLS Policies for activity_logs table
CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for events table
CREATE POLICY "Everyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage events" 
ON public.events 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for jobs table
CREATE POLICY "Everyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = posted_by);

CREATE POLICY "Verified alumni can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'verified_alumni') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = posted_by);

CREATE POLICY "Admins can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, contact_email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();