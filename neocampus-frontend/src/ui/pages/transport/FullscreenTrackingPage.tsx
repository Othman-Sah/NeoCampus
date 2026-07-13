import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useTransport } from '@/application/useCases/useTransport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, MapPin, Eye, EyeOff, Navigation, Info, X, Users, Map as MapIcon, Loader2 } from 'lucide-react';

// Default school coordinate ( pulsing hub)
const SCHOOL_COORDS: [number, number] = [35.7595, -5.8340];

export const FullscreenTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { useRoutes } = useTransport();
  const { data: routesResponse, isLoading: loadingRoutes } = useRoutes({ statut: 'actif', per_page: 100 });
  const routes = routesResponse?.data ?? [];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Filter settings
  const [showStudents, setShowStudents] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  const [streetSearchResults, setStreetSearchResults] = useState<any[]>([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [activeSearchSelection, setActiveSearchSelection] = useState<{
    type: 'student' | 'street';
    id?: number;
    lat: number;
    lng: number;
    label: string;
    studentDetails?: any;
  } | null>(null);

  // Grouped active map elements for cleaning
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const schoolMarkerRef = useRef<L.Marker | null>(null);

  // Flattened active students across routes
  const allStudents = useMemo(() => {
    const list: any[] = [];
    routes.forEach((route) => {
      const routeStudents = route.students ?? [];
      routeStudents.forEach((student: any) => {
        if (student.latitude && student.longitude) {
          list.push({
            ...student,
            routeId: route.id,
            routeName: route.nom,
          });
        }
      });
    });
    return list;
  }, [routes]);

  // Local student search autocompletion
  useEffect(() => {
    if (!searchQuery.trim()) {
      setStudentSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allStudents.filter(
      (s) =>
        s.prenom.toLowerCase().includes(q) ||
        s.nom.toLowerCase().includes(q) ||
        s.point_ramassage?.toLowerCase().includes(q)
    );
    setStudentSearchResults(filtered.slice(0, 5));
  }, [searchQuery, allStudents]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(SCHOOL_COORDS, 13);
    mapRef.current = map;

    // Custom attribution positioning
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync / Draw Markers & Lines on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous drawings
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];
    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.remove();
      schoolMarkerRef.current = null;
    }

    // 1. Draw School Hub (Always Pulsing Center)
    const schoolIcon = L.divIcon({
      className: 'school-hub-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-black/10 animate-ping"></div>
          <div class="absolute w-8 h-8 rounded-full bg-black/25 animate-pulse"></div>
          <div class="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-lg">
            <span class="text-[9px] font-black text-[#d0f137]">EMSI</span>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    schoolMarkerRef.current = L.marker(SCHOOL_COORDS, { icon: schoolIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-2 text-neutral-900"><h5 class="text-xs font-black uppercase">School Hub</h5><p class="text-[10px] font-semibold text-neutral-450 mt-0.5">EMSI Tangier Campus</p></div>`
      );

    // Filter routes by selection
    const routesToDraw = selectedRouteId === 'all'
      ? routes
      : routes.filter((r) => String(r.id) === selectedRouteId);

    // Colors mapping for route distinct paths
    const routeColors = ['#000000', '#2563EB', '#059669', '#DC2626', '#7C3AED', '#D97706'];

    routesToDraw.forEach((route, idx) => {
      const color = routeColors[idx % routeColors.length];
      const routeStudents = (route.students ?? []).filter((s: any) => s.latitude && s.longitude);

      // Collect route coordinate sequence (starting from school hub)
      const latlngs: L.LatLngExpression[] = [SCHOOL_COORDS];

      routeStudents.forEach((student: any) => {
        const lat = parseFloat(String(student.latitude));
        const lng = parseFloat(String(student.longitude));
        latlngs.push([lat, lng]);

        // Draw Student Stop Pin if enabled
        const isSearchTarget = activeSearchSelection?.type === 'student' && activeSearchSelection?.id === student.eleve_id;
        const hideOtherStops = activeSearchSelection?.type === 'student' && !isSearchTarget;

        if (showStudents && !hideOtherStops) {
          const pinHtml = isSearchTarget
            ? `
              <div class="relative flex items-center justify-center scale-125 z-50">
                <div class="absolute w-10 h-10 rounded-full bg-red-500/20 animate-ping"></div>
                <div class="absolute w-7 h-7 rounded-full bg-red-500/30 animate-pulse"></div>
                <div class="w-6 h-6 rounded-full bg-red-650 border-2 border-white flex items-center justify-center shadow-lg">
                  <div class="w-2 h-2 rounded-full bg-[#d0f137]"></div>
                </div>
              </div>
            `
            : `
              <div class="relative flex items-center justify-center hover:scale-110 transition-transform">
                <div class="w-5 h-5 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-md">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#d0f137]"></div>
                </div>
              </div>
            `;

          const pinIcon = L.divIcon({
            className: 'student-stop-icon',
            html: pinHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const popupContent = `
            <div class="p-2 text-neutral-900 min-w-[160px] font-semibold">
              <span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-[#d0f137]">${route.nom}</span>
              <h4 class="text-xs font-extrabold text-neutral-900 mt-2">${student.prenom} ${student.nom}</h4>
              <p class="text-[10px] text-neutral-500 mt-0.5">Class: ${student.classe_nom || 'N/A'}</p>
              <div class="mt-2 border-t border-neutral-100 pt-1.5 text-[9px] text-neutral-450 font-medium">
                <p class="truncate">Stop: ${student.point_ramassage || 'Home Pickup'}</p>
                <p class="mt-0.5">Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lng], { icon: pinIcon })
            .addTo(map)
            .bindPopup(popupContent);

          if (isSearchTarget) {
            marker.openPopup();
          }

          markersRef.current.push(marker);
        }
      });

      // Draw route paths if enabled and not isolated by a search target
      if (showRoutes && latlngs.length > 1 && activeSearchSelection?.type !== 'student') {
        const polyline = L.polyline(latlngs, {
          color: color,
          weight: 4,
          opacity: 0.75,
          lineJoin: 'round',
          dashArray: '8, 8', // dashed lines for premium aesthetic
        }).addTo(map);

        polylinesRef.current.push(polyline);
      }
    });

    // Draw active street search target if selected
    if (activeSearchSelection?.type === 'street') {
      const streetIcon = L.divIcon({
        className: 'street-pin-icon',
        html: `
          <div class="relative flex items-center justify-center scale-110">
            <div class="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-blue-650 border-2 border-white flex items-center justify-center shadow-lg">
              <div class="w-2 h-2 rounded-full bg-[#d0f137]"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const streetMarker = L.marker([activeSearchSelection.lat, activeSearchSelection.lng], { icon: streetIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-2 text-neutral-900 max-w-[150px]"><h5 class="text-xs font-black uppercase text-blue-650">Street Pinned</h5><p class="text-[10px] font-semibold text-neutral-450 mt-0.5 truncate">${activeSearchSelection.label}</p></div>`
        )
        .openPopup();

      markersRef.current.push(streetMarker);
    }
  }, [routes, showStudents, showRoutes, selectedRouteId, activeSearchSelection]);

  // Street/Street Address Nominatim search
  const handleStreetSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingStreet(true);
    setStreetSearchResults([]);

    const cleanQuery = searchQuery.toLowerCase().includes('tanger') || searchQuery.toLowerCase().includes('tangier')
      ? searchQuery
      : `${searchQuery}, Tangier, Morocco`;

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: cleanQuery,
          format: 'json',
          limit: 3,
          addressdetails: 1,
        },
      });
      setStreetSearchResults(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingStreet(false);
    }
  };

  const handleSelectStudent = (student: any) => {
    const selection = {
      type: 'student' as const,
      id: student.eleve_id,
      lat: parseFloat(String(student.latitude)),
      lng: parseFloat(String(student.longitude)),
      label: `${student.prenom} ${student.nom}`,
      studentDetails: student,
    };
    setActiveSearchSelection(selection);
    setSearchQuery(`${student.prenom} ${student.nom}`);
    setStudentSearchResults([]);
    setStreetSearchResults([]);

    // Pan map directly to the student stop
    if (mapRef.current) {
      mapRef.current.setView([selection.lat, selection.lng], 16);
    }
  };

  const handleSelectStreet = (loc: any) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const label = loc.address?.road || loc.address?.suburb || loc.display_name.split(',')[0];

    const selection = {
      type: 'street' as const,
      lat: lat,
      lng: lon,
      label: label,
    };
    setActiveSearchSelection(selection);
    setSearchQuery(label);
    setStudentSearchResults([]);
    setStreetSearchResults([]);

    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 16);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchSelection(null);
    setStudentSearchResults([]);
    setStreetSearchResults([]);

    // Zoom back to show whole Tangier / school
    if (mapRef.current) {
      mapRef.current.setView(SCHOOL_COORDS, 13);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-neutral-900 bg-neutral-100 z-0">
      {/* Fullscreen Map viewport */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Floating Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-col gap-3.5 z-10 shrink-0 pointer-events-none">
        
        {/* Pill Nav Bar */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-100 pointer-events-auto self-start text-[10px] font-black uppercase tracking-wider text-neutral-400">
          <Link to="/dashboard" className="hover:text-black text-neutral-450 transition decoration-none">Home</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-450">Admin</span>
          <span className="text-neutral-300">/</span>
          <Link to="/transport" className="hover:text-black text-neutral-450 transition decoration-none">Transport</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-black">Tracking</span>
        </div>

        {/* Controls row */}
        <div className="flex flex-col md:flex-row gap-3 w-full pointer-events-none">
          {/* Back and Search Box Container */}
          <div className="flex gap-2 items-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-100 pointer-events-auto w-full md:max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/transport')}
            className="size-8 p-0 rounded-xl hover:bg-neutral-100 shrink-0 cursor-pointer"
            title="Go back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-neutral-200 mx-1 shrink-0" />

          {/* Search Box */}
          <form onSubmit={handleStreetSearch} className="flex-1 flex items-center gap-1.5 relative min-w-0">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or Tangier streets..."
              className="w-full bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 placeholder:text-neutral-450 p-1 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="size-5 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            
            {/* Search Suggestions Popover */}
            {(studentSearchResults.length > 0 || streetSearchResults.length > 0 || isSearchingStreet) && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-neutral-150 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto w-[calc(100%+2rem)] -left-4">
                
                {/* Loader */}
                {isSearchingStreet && (
                  <div className="p-3 text-xs font-semibold text-neutral-450 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching open street directories...
                  </div>
                )}

                {/* Local Student Results */}
                {studentSearchResults.length > 0 && (
                  <div className="border-b border-neutral-50 last:border-none">
                    <div className="bg-neutral-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-neutral-400">
                      Students Pinned
                    </div>
                    {studentSearchResults.map((student) => (
                      <div
                        key={student.eleve_id}
                        onClick={() => handleSelectStudent(student)}
                        className="px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 cursor-pointer flex items-center gap-2.5"
                      >
                        <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-neutral-800">{student.prenom} {student.nom}</span>
                          <span className="text-neutral-400 text-[10px] ml-1.5 font-medium">{student.classe_nom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nominatim Street Results */}
                {streetSearchResults.length > 0 && (
                  <div>
                    <div className="bg-neutral-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-neutral-400">
                      Street Addresses
                    </div>
                    {streetSearchResults.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectStreet(loc)}
                        className="px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 cursor-pointer flex items-center gap-2.5 text-neutral-700"
                      >
                        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{loc.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prompt to geocode search */}
                {searchQuery.trim() && studentSearchResults.length === 0 && streetSearchResults.length === 0 && !isSearchingStreet && (
                  <div
                    onClick={handleStreetSearch}
                    className="p-3 text-xs font-bold hover:bg-neutral-50 cursor-pointer flex items-center gap-2 text-neutral-500 border-t border-neutral-50"
                  >
                    <Navigation className="h-3.5 w-3.5 animate-pulse" />
                    Search online maps for "{searchQuery}"
                  </div>
                )}

              </div>
            )}
          </form>
        </div>

        {/* Floating Controls Overlay */}
        <div className="flex gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-neutral-100 pointer-events-auto md:ml-auto w-full md:w-auto overflow-x-auto whitespace-nowrap">
          
          {/* Route selector dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-neutral-450 shrink-0 ml-1" />
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger className="border-none bg-transparent hover:bg-neutral-50 h-8 text-[11px] font-extrabold uppercase tracking-wider focus:ring-0 w-[140px] shrink-0 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-neutral-100">
                <SelectItem value="all" className="text-[11px] font-extrabold uppercase tracking-wider">All Routes</SelectItem>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)} className="text-[11px] font-extrabold uppercase tracking-wider">
                    {r.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-6 bg-neutral-200 self-center shrink-0" />

          {/* Toggle buttons */}
          <Button
            variant="ghost"
            onClick={() => setShowStudents((prev) => !prev)}
            className={`h-8 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-xl cursor-pointer ${
              showStudents ? 'text-black bg-neutral-105' : 'text-neutral-400'
            }`}
          >
            {showStudents ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
            Stops
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowRoutes((prev) => !prev)}
            className={`h-8 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-xl cursor-pointer ${
              showRoutes ? 'text-black bg-neutral-105' : 'text-neutral-400'
            }`}
          >
            {showRoutes ? <MapIcon className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
            Paths
          </Button>

        </div>
      </div>
    </div>

      {/* Floating Isolated Student Detail Card (if a student is isolated) */}
      {activeSearchSelection?.type === 'student' && activeSearchSelection?.studentDetails && (
        <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-neutral-100 z-10 animate-slide-in">
          <button
            onClick={handleClearSearch}
            className="absolute top-3 right-3 size-6 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex gap-3 items-start">
            <div className="size-10 rounded-2xl bg-black flex items-center justify-center shadow-lg shrink-0">
              <Users className="h-5 w-5 text-[#d0f137]" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-black text-[#d0f137]">
                {activeSearchSelection.studentDetails.routeName}
              </span>
              <h3 className="text-sm font-black text-neutral-900 mt-2">
                {activeSearchSelection.studentDetails.prenom} {activeSearchSelection.studentDetails.nom}
              </h3>
              <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
                Class: {activeSearchSelection.studentDetails.classe_nom || 'No Class'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3 text-[11px] font-semibold text-neutral-600">
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase text-neutral-400">Stop Pickup Name</p>
                <p className="text-neutral-800 mt-0.5 leading-snug">
                  {activeSearchSelection.studentDetails.point_ramassage || 'Home Pickup'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Info className="h-4 w-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase text-neutral-400">Coordinates</p>
                <p className="text-neutral-800 mt-0.5 font-bold">
                  Lat: {activeSearchSelection.lat.toFixed(5)}, Lng: {activeSearchSelection.lng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([activeSearchSelection.lat, activeSearchSelection.lng], 16);
              }
            }}
            className="w-full mt-4 bg-black hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-wider h-9 cursor-pointer"
          >
            Center Stop View
          </Button>
        </div>
      )}
    </div>
  );
};
