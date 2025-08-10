// README
// This bundle contains a complete Next.js + Supabase implementation for:
// - Viewing Events (pages/events.tsx)
// - Suggesting Events (pages/suggest-event.tsx)
// - Browsing and voting/commenting on suggestions (components/EventSuggestions.tsx)
// - Backend promotion job (pages/api/promote-suggestions.ts)
// 
// Notes before use:
// 1. Replace the import of the supabase client with your own file if different. Example expects '@/integrations/supabase/client'.
// 2. To run the promotion API safely, provide SUPABASE_SERVICE_ROLE_KEY in your Vercel/Next env for server-side admin actions.
// 3. Migration SQL (run in Supabase SQL editor) is included at the bottom.


// File: pages/events.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EventSuggestions from '@/components/EventSuggestions';

interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  event_date?: string;
  organizer_id?: string;
  created_at?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();

    // realtime subscription (optional)
    const subscription = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents((data as Event[]) || []);
    } catch (err: any) {
      console.error('Error fetching events:', err.message || err);
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alumni Events</h1>
          <p className="text-muted-foreground">Stay connected with upcoming alumni gatherings and activities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/suggest-event')}>
            <Calendar className="h-4 w-4 mr-2" />
            Suggest Event
          </Button>
          <Button variant="outline" onClick={() => router.push('/suggestions')}>
            <Users className="h-4 w-4 mr-2" />
            Suggestions
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
            <p className="text-muted-foreground mb-4">Check back later for upcoming alumni events and gatherings.</p>
            <Button onClick={() => router.push('/suggest-event')}>Suggest an Event</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant={isUpcoming(event.event_date) ? 'default' : 'secondary'}>
                    {isUpcoming(event.event_date) ? 'Upcoming' : 'Past'}
                  </Badge>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDate(event.event_date)}
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    variant={isUpcoming(event.event_date) ? 'default' : 'outline'}
                    className="w-full"
                    disabled={!isUpcoming(event.event_date)}
                  >
                    {isUpcoming(event.event_date) ? 'Register' : 'View Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Featured Event */}
      {events.filter(e => isUpcoming(e.event_date)).length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Featured Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Annual Alumni Reunion</h3>
                <p className="text-muted-foreground mb-4">
                  Join us for our biggest alumni gathering of the year! Reconnect with classmates,
                  network with professionals across industries, and celebrate our shared PIEAS DME legacy.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    December 15, 2024 at 6:00 PM
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    PIEAS Campus, Islamabad
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <Button size="lg" className="w-full">Register Now</Button>
                <Button variant="outline" size="lg" className="w-full">Learn More</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline suggestions widget */}
      <div>
        <h2 className="text-2xl font-semibold">Event Suggestions</h2>
        <p className="text-muted-foreground mb-4">See what alumni are suggesting — vote and comment to help promote events.</p>
        <EventSuggestions />
      </div>
    </div>
  );
}


// File: pages/suggest-event.tsx
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SuggestEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id ?? null;

      const payload: any = {
        title,
        description,
        location: location || null,
        proposed_date: date || null,
        created_by: userId
      };

      const { error } = await supabase.from('event_suggestions').insert([payload]);
      if (error) throw error;

      toast({ title: 'Thanks!', description: 'Suggestion submitted.' });
      router.push('/events');
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to submit suggestion', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Suggest an Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Suggestion'}</Button>
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}


// File: pages/suggestions.tsx
import React from 'react';
import EventSuggestions from '@/components/EventSuggestions';

export default function SuggestionsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Event Suggestions</h1>
      <p className="text-muted-foreground mb-6">Community-driven event suggestions — vote, comment, and shape the alumni calendar.</p>
      <EventSuggestions />
    </div>
  );
}


// File: components/EventSuggestions.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  title: string;
  description?: string;
  location?: string;
  proposed_date?: string;
  created_by?: string;
  created_at?: string;
  vote_count?: number;
  votes?: Array<any>;
  comments?: Array<{ id: string; content: string; created_at: string; commenter_id?: string }>;
}

export default function EventSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();

    // realtime channel for suggestions/votes/comments
    const channel = supabase.channel('public:event_suggestions');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_suggestions' }, () => fetchSuggestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_votes' }, () => fetchSuggestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_comments' }, () => fetchSuggestions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Query suggestions with aggregate counts for votes and fetch comments
      const { data, error } = await supabase
        .from('event_suggestions')
        .select(`*, event_votes(id), event_comments(id, content, created_at, commenter_id)`) // votes array and comments
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Suggestion[] = (data || []).map((s: any) => ({
        ...s,
        vote_count: s.event_votes?.length ?? 0,
        votes: s.event_votes ?? [],
        comments: s.event_comments ?? []
      }));

      setSuggestions(mapped);
    } catch (err: any) {
      console.error('fetch suggestions', err);
      toast({ title: 'Error', description: 'Failed to load suggestions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return toast({ title: 'Login required', description: 'Please sign in to vote' });

      // check if voted
      const { data: existing, error: selErr } = await supabase
        .from('event_votes')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .eq('voter_id', userId)
        .limit(1);

      if (selErr) throw selErr;
      if (existing && existing.length > 0) {
        // optionally unvote
        const { error: delErr } = await supabase
          .from('event_votes')
          .delete()
          .eq('suggestion_id', suggestionId)
          .eq('voter_id', userId);
        if (delErr) throw delErr;
        toast({ title: 'Removed vote' });
        return fetchSuggestions();
      }

      const { error } = await supabase.from('event_votes').insert([{ suggestion_id: suggestionId, voter_id: userId }]);
      if (error) throw error;
      fetchSuggestions();
    } catch (err: any) {
      console.error('vote', err);
      toast({ title: 'Error', description: err.message || 'Voting failed', variant: 'destructive' });
    }
  };

  const handleComment = async (suggestionId: string) => {
    const content = commentText[suggestionId]?.trim();
    if (!content) return;

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return toast({ title: 'Login required', description: 'Please sign in to comment' });

      const { error } = await supabase.from('event_comments').insert([{ suggestion_id: suggestionId, content, commenter_id: userId }]);
      if (error) throw error;

      setCommentText(prev => ({ ...prev, [suggestionId]: '' }));
      fetchSuggestions();
    } catch (err: any) {
      console.error('comment', err);
      toast({ title: 'Error', description: err.message || 'Comment failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm">Loading suggestions...</div>}
      {suggestions.map((s) => (
        <Card key={s.id} className="p-0">
          <CardHeader>
            <CardTitle className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.location || 'Location TBA'} • {s.proposed_date ? new Date(s.proposed_date).toLocaleString() : 'Date TBA'}</div>
              </div>
              <div className="text-sm">
                <Button size="sm" onClick={() => handleVote(s.id)}>{s.vote_count ?? 0} 👍</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{s.description}</p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Add a comment" value={commentText[s.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [s.id]: e.target.value }))} />
                <Button onClick={() => handleComment(s.id)}>Comment</Button>
              </div>

              <div className="space-y-1">
                {(s.comments || []).map((c) => (
                  <div key={c.id} className="text-sm border rounded p-2">
                    <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                    <div>{c.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {suggestions.length === 0 && <div className="text-muted-foreground">No suggestions yet — be the first to suggest an event!</div>}
    </div>
  );
}


// File: pages/api/promote-suggestions.ts
// Server-side promotion endpoint. Run as a cron or call manually. Requires SUPABASE_SERVICE_ROLE_KEY set in env.
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string; // set this in your env

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing service role key' });

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // threshold
    const VOTE_THRESHOLD = Number(process.env.EVENT_PROMOTE_THRESHOLD || '5');

    // find suggestions with vote counts
    const { data: suggestions, error } = await supabaseAdmin
      .from('event_suggestions')
      .select('*, event_votes(id)')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const toPromote = (suggestions || []).filter((s: any) => (s.event_votes?.length ?? 0) >= VOTE_THRESHOLD);

    const promoted: any[] = [];

    for (const s of toPromote) {
      // insert into events
      const insert = {
        title: s.title,
        description: s.description,
        location: s.location,
        event_date: s.proposed_date,
        organizer_id: s.created_by
      };

      const { error: insErr } = await supabaseAdmin.from('events').insert([insert]);
      if (insErr) {
        console.error('insert event error', insErr);
        continue;
      }

      // cleanup: delete votes and comments and suggestion
      await supabaseAdmin.from('event_votes').delete().eq('suggestion_id', s.id);
      await supabaseAdmin.from('event_comments').delete().eq('suggestion_id', s.id);
      await supabaseAdmin.from('event_suggestions').delete().eq('id', s.id);

      promoted.push(s.id);
    }

    return res.status(200).json({ promoted });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}


// File: supabase_migrations.sql
/* Run these queries in your Supabase SQL editor to create required tables. */

-- events table (if not already existing)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  event_date timestamptz,
  organizer_id uuid,
  created_at timestamptz DEFAULT now()
);

-- event_suggestions
CREATE TABLE IF NOT EXISTS public.event_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  proposed_date timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- event_votes (one vote per user per suggestion)
CREATE TABLE IF NOT EXISTS public.event_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid REFERENCES public.event_suggestions(id) ON DELETE CASCADE,
  voter_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE (suggestion_id, voter_id)
);

-- event_comments
CREATE TABLE IF NOT EXISTS public.event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid REFERENCES public.event_suggestions(id) ON DELETE CASCADE,
  commenter_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- add RLS/policies as needed for secure reads/writes by authenticated users
*/
