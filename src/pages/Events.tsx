// src/pages/Events.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Vite-friendly navigation
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  organizer_id: string;
  created_at: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate(); // ✅

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alumni Events</h1>
          <p className="text-muted-foreground">Stay connected with upcoming alumni gatherings and activities</p>
        </div>
        <Button onClick={() => navigate('/suggest-event')}> {/* ✅ navigates to Suggest Event page */}
          <Calendar className="h-4 w-4 mr-2" />
          Suggest Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Check back later for upcoming alumni events and gatherings.
            </p>
            <Button onClick={() => navigate('/suggest-event')}>Suggest an Event</Button> {/* ✅ */}
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
                <h3 className="text-xl font-semibold mb-2">Annual Alumni Reunion 2024</h3>
                <p className="text-muted-foreground mb-4">
                  Join us for our biggest alumni gathering of the year! Reconnect with classmates, 
                  network with professionals across industries, and celebrate our shared legacy.
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
    </div>
  );
}
