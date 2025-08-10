import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AlumniLocation {
  id: string;
  full_name: string;
  location: string;
  company?: string;
  job_title?: string;
  graduation_year?: number;
  industry?: string;
  coordinates?: [number, number];
}

interface AlumniMapProps {
  alumniData: AlumniLocation[];
}

const AlumniMap: React.FC<AlumniMapProps> = ({ alumniData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSaved, setTokenSaved] = useState(false);

  // Sample coordinates for major cities (in a real app, you'd geocode the locations)
  const cityCoordinates: { [key: string]: [number, longitude: number] } = {
    'islamabad': [33.6844, 73.0479],
    'karachi': [24.8607, 67.0011],
    'lahore': [31.5204, 74.3587],
    'faisalabad': [31.4504, 73.1350],
    'rawalpindi': [33.5951, 73.0169],
    'multan': [30.1575, 71.5249],
    'hyderabad': [25.3960, 68.3578],
    'gujranwala': [32.1877, 74.1945],
    'peshawar': [34.0151, 71.5249],
    'quetta': [30.1798, 66.9750],
    'london': [-0.1278, 51.5074],
    'new york': [-74.0060, 40.7128],
    'dubai': [55.2708, 25.2048],
    'toronto': [-79.3832, 43.6532],
    'sydney': [151.2093, -33.8688],
    'singapore': [103.8198, 1.3521],
    'tokyo': [139.6917, 35.6895],
    'riyadh': [46.6753, 24.7136],
    'doha': [51.5310, 25.2760],
    'paris': [2.3522, 48.8566],
    'berlin': [13.4050, 52.5200],
    'amsterdam': [4.9041, 52.3676],
    'stockholm': [18.0686, 59.3293],
    'oslo': [10.7522, 59.9139],
    'copenhagen': [12.5683, 55.6761]
  };

  const getCoordinatesForLocation = (location: string): [number, number] | null => {
    const normalizedLocation = location.toLowerCase().trim();
    
    // Direct match
    if (cityCoordinates[normalizedLocation]) {
      return cityCoordinates[normalizedLocation];
    }
    
    // Partial match
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (normalizedLocation.includes(city) || city.includes(normalizedLocation)) {
        return coords;
      }
    }
    
    return null;
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenSaved(true);
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe' as any,
      zoom: 1.5,
      center: [30, 15],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });

      // Add alumni location markers
      addAlumniMarkers();
    });
  };

  const addAlumniMarkers = () => {
    if (!map.current) return;

    // Process alumni data and add markers
    alumniData.forEach((alumni) => {
      const coordinates = getCoordinatesForLocation(alumni.location);
      
      if (coordinates) {
        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'alumni-marker';
        markerElement.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        `;

        // Add hover effect
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.5)';
          markerElement.style.zIndex = '1000';
        });

        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.zIndex = '1';
        });

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${alumni.full_name}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Location:</strong> ${alumni.location}</p>
              ${alumni.graduation_year ? `<p><strong>Batch:</strong> ${alumni.graduation_year}</p>` : ''}
              ${alumni.industry ? `<p><strong>Industry:</strong> ${alumni.industry}</p>` : ''}
              ${alumni.company ? `<p><strong>Company:</strong> ${alumni.company}</p>` : ''}
              ${alumni.job_title ? `<p><strong>Position:</strong> ${alumni.job_title}</p>` : ''}
            </div>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        // Create marker and add to map
        new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  };

  useEffect(() => {
    if (tokenSaved) {
      initializeMap();
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [tokenSaved, alumniData]);

  if (!tokenSaved) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mapbox Configuration</CardTitle>
          <CardDescription>
            Please enter your Mapbox public token to display the alumni map.
            Get your token from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button onClick={handleTokenSubmit} className="w-full">
            Initialize Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-1">PIEAS DME Alumni Worldwide</h3>
        <p className="text-xs text-muted-foreground">
          {alumniData.length} alumni across {new Set(alumniData.map(a => a.location)).size} locations
        </p>
      </div>
    </div>
  );
};

export default AlumniMap;