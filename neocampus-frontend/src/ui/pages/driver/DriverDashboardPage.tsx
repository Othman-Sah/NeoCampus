import React, { useState, useEffect, useRef } from 'react';
import { useTransport } from '@/application/useCases/useTransport';
import { useAuthStore } from '@/application/stores/authStore';
import { 
  Bus, MapPin, Compass, Play, CheckCircle, Navigation, Clock, 
  Users, UserCheck, AlertTriangle, ShieldCheck, Milestone
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const DriverDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { useDriverRoute, saveStudentRoute } = useTransport();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);

  // Load driver's active route
  const { data: routeResponse, isLoading } = useDriverRoute();
  const route = routeResponse as any;

  // Simulator state
  const [isCircuitStarted, setIsCircuitStarted] = useState(false);
  const [busProgress, setBusProgress] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [pickedUpCount, setPickedUpCount] = useState(0);

  const stops = route?.students ?? [];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered on Tangier (Hub location)
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([35.7595, -5.8340], 13);
    
    mapRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update stops markers and polylines when stops or currentStopIndex changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Add Central NeoCampus Hub Marker
    const hubIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-black/15 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-md">
            <div class="w-2.5 h-2.5 rounded-full bg-[#d0f137]"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([35.7595, -5.8340], { icon: hubIcon })
      .bindPopup('<b class="text-xs uppercase tracking-wide">NeoCampus Central Hub</b>')
      .addTo(markersGroupRef.current);

    const latlngs: L.LatLngExpression[] = [[35.7595, -5.8340]];

    stops.forEach((stop: any, idx: number) => {
      if (stop.latitude && stop.longitude) {
        const lat = Number(stop.latitude);
        const lng = Number(stop.longitude);
        latlngs.push([lat, lng]);

        const isVisited = idx < currentStopIndex;
        const isCurrent = idx === currentStopIndex;

        const stopIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center font-bold text-[10px] shadow-sm cursor-grab active:cursor-grabbing ${
            isVisited ? 'bg-black text-white' : (isCurrent ? 'bg-[#d0f137] text-black' : 'bg-white text-black')
          }">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const stopMarker = L.marker([lat, lng], { 
          icon: stopIcon,
          draggable: true
        })
          .bindPopup(`
            <div class="p-1 font-semibold text-neutral-900 text-xs">
              <b>Stop ${idx + 1}: ${stop.point_ramassage || 'Home Pickup'}</b><br/>
              Student: ${stop.prenom} ${stop.nom}<br/>
              <span class="text-[9px] font-bold text-neutral-450 mt-1 block">Drag this marker to adjust pickup location.</span>
            </div>
          `)
          .addTo(markersGroupRef.current);

        stopMarker.on('dragend', async () => {
          const pos = stopMarker.getLatLng();
          try {
            await saveStudentRoute({
              studentId: stop.eleve_id,
              data: {
                itineraire_id: route.id,
                point_ramassage: stop.point_ramassage || 'Home Pickup',
                latitude: pos.lat,
                longitude: pos.lng
              }
            });
            // Show custom alert message
            const dialog = document.createElement('div');
            dialog.className = 'fixed bottom-4 right-4 bg-black text-[#d0f137] text-xs font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-2xl border border-neutral-850 z-50 animate-fade-in flex items-center gap-2';
            dialog.innerHTML = `<svg class="h-4 w-4 shrink-0 text-[#d0f137]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Location for ${stop.prenom} ${stop.nom} updated!`;
            document.body.appendChild(dialog);
            setTimeout(() => { dialog.remove(); }, 3000);
          } catch (err) {
            console.error('Failed to update stop location:', err);
            stopMarker.setLatLng([lat, lng]);
          }
        });
      }
    });

    if (latlngs.length > 1) {
      const polyline = L.polyline(latlngs, {
        color: 'black',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(mapRef.current);
      polylineRef.current = polyline;

      mapRef.current.fitBounds(markersGroupRef.current.getBounds(), {
        padding: [50, 50]
      });
    }
  }, [stops, currentStopIndex]);

  // Handle Circuit drive progress
  useEffect(() => {
    let interval: any;
    if (isCircuitStarted && stops.length > 0) {
      interval = setInterval(() => {
        setBusProgress((prev) => {
          if (prev >= 100) {
            setIsCircuitStarted(false);
            return 100;
          }
          const nextProgress = prev + 1.5;
          
          const totalStops = stops.length;
          const segmentVal = 100 / (totalStops || 1);
          const stopIdx = Math.min(Math.floor(nextProgress / segmentVal), totalStops - 1);
          
          if (stopIdx !== currentStopIndex) {
            setCurrentStopIndex(stopIdx);
            setPickedUpCount((c) => Math.min(stopIdx + 1, totalStops));
          }
          
          return nextProgress;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isCircuitStarted, stops, currentStopIndex]);

  // Bus simulation animation
  useEffect(() => {
    if (!mapRef.current) return;

    if (busMarkerRef.current) {
      busMarkerRef.current.remove();
      busMarkerRef.current = null;
    }

    if (!isCircuitStarted || stops.length === 0) return;

    const routeCoords: L.LatLngExpression[] = [[35.7595, -5.8340]];
    stops.forEach((stop: any) => {
      if (stop.latitude && stop.longitude) {
        routeCoords.push([Number(stop.latitude), Number(stop.longitude)]);
      }
    });

    if (routeCoords.length < 2) return;

    const busIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-[#d0f137]/45 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-[#d0f137] border-2 border-black flex items-center justify-center shadow-md animate-bounce">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5">
              <rect x="3" y="6" width="18" height="12" rx="2"/>
              <path d="M4 18v2m16-2v2M9 6v12m6-12v12"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const totalSegments = routeCoords.length - 1;
    const segmentVal = 100 / totalSegments;
    const currentSegment = Math.min(Math.floor(busProgress / segmentVal), totalSegments - 1);
    
    const startStop = routeCoords[currentSegment] as [number, number];
    const endStop = routeCoords[currentSegment + 1] as [number, number];

    if (startStop && endStop) {
      const progressInSegment = (busProgress % segmentVal) / segmentVal;
      const busLat = startStop[0] + (endStop[0] - startStop[0]) * progressInSegment;
      const busLng = startStop[1] + (endStop[1] - startStop[1]) * progressInSegment;
      
      const busMarker = L.marker([busLat, busLng], { icon: busIcon }).addTo(mapRef.current);
      busMarkerRef.current = busMarker;
      
      mapRef.current.panTo([busLat, busLng]);
    }
  }, [isCircuitStarted, busProgress, stops]);

  const handleStartCircuit = () => {
    if (isCircuitStarted) {
      setIsCircuitStarted(false);
      setBusProgress(0);
      setCurrentStopIndex(0);
      setPickedUpCount(0);
    } else {
      setBusProgress(0);
      setCurrentStopIndex(0);
      setPickedUpCount(1);
      setIsCircuitStarted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-10 w-1/3 rounded-md" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-[60vh] rounded-3xl" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl p-6 shadow-xs max-w-lg mx-auto mt-12">
        <Bus className="h-16 w-16 text-neutral-350 mx-auto mb-4 animate-bounce" />
        <h3 className="text-base font-black text-neutral-800 uppercase tracking-tight">No Active Route</h3>
        <p className="text-xs text-neutral-450 font-semibold mt-2 leading-relaxed">
          Hello {user?.prenom}, your profile is currently not assigned to an active route. Please ask your administrator to link a vehicle and route to your driver profile.
        </p>
      </div>
    );
  }



  return (
    <div className="space-y-6 pb-12 animate-fade-in text-neutral-900">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-neutral-100 p-5 rounded-3xl shadow-xs">
        <div>
          <Badge className="bg-[#d0f137] text-black text-[9px] font-black uppercase tracking-wider mb-2">
            Driver Console
          </Badge>
          <h1 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
            {route.nom}
          </h1>
          <p className="text-xs font-semibold text-neutral-450 uppercase tracking-wide mt-1">
            Zone: {route.zone} · Bus: {route.vehicule?.marque} ({route.vehicule?.matricule})
          </p>
        </div>

        <Button
          onClick={handleStartCircuit}
          className={`rounded-2xl px-6 py-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer border-none ${
            isCircuitStarted
              ? 'bg-red-650 hover:bg-red-700 text-white'
              : 'bg-black hover:bg-neutral-850 text-white'
          }`}
        >
          <Play className={`h-4 w-4 ${isCircuitStarted ? 'animate-pulse text-[#d0f137]' : ''}`} />
          {isCircuitStarted ? 'Reset Route' : 'Start Circuit'}
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-[#d0f137]" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">{stops.length} Kids</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-[#d0f137]" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Picked Up</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">
                {pickedUpCount} / {stops.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-[#d0f137]" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Next stop ETA</p>
              <p className="text-lg font-black text-neutral-900 mt-0.5">
                {isCircuitStarted ? (busProgress >= 98 ? 'Arrived' : '5 mins') : '07:30 AM'}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main split dashboard console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Map Panel (8-span) */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[65vh]">
          
          <div className="border-b border-neutral-100 p-4 bg-neutral-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-neutral-600 animate-pulse" />
              <span className="text-xs font-black uppercase text-neutral-900 tracking-wider">
                Live Transit Navigation Map
              </span>
            </div>
            {isCircuitStarted && (
              <Badge className="bg-sky-50 text-sky-750 border-sky-100 text-[9px] font-black uppercase tracking-wider animate-pulse">
                Transit Active
              </Badge>
            )}
          </div>

          <div className="flex-1 relative bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
            {/* Real interactive Leaflet map container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
          </div>
        </div>

        {/* Sidebar list stops (4-span) */}
        <div className="lg:col-span-4 bg-white border border-neutral-150 rounded-3xl p-5 shadow-xs h-[65vh] flex flex-col">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Milestone className="h-4 w-4 text-neutral-600" />
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">
              Waypoints Checklist
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {stops.map((stop: any, idx: number) => {
              const isVisited = idx < currentStopIndex;
              const isCurrent = idx === currentStopIndex;

              return (
                <div 
                  key={stop.eleve_id}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition ${
                    isCurrent 
                      ? 'border-[#d0f137] bg-[#d0f137]/10 shadow-xs' 
                      : (isVisited ? 'border-neutral-100 bg-neutral-50/50 opacity-60' : 'border-neutral-150 bg-white')
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 leading-tight">
                      {stop.point_ramassage}
                    </p>
                    <p className="text-[10px] text-neutral-450 font-bold mt-0.5">
                      {stop.prenom} {stop.nom} ({stop.classe_nom})
                    </p>
                  </div>

                  {isVisited ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-wider ${
                      isCurrent ? 'bg-black text-[#d0f137] border-black' : 'bg-neutral-50 text-neutral-500'
                    }`}>
                      {isCurrent ? 'Current' : `Stop ${idx + 1}`}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DriverDashboardPage;
