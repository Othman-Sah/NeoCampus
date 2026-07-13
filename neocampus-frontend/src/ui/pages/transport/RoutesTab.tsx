import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTransport } from '@/application/useCases/useTransport';
import { studentApiService } from '@/infrastructure/api/studentApiService';
import { TransportRoute, RouteStudent } from '@/domain/entities/TransportRoute';
import { 
  MapPin, Plus, Trash2, Edit3, UserPlus, Clock, Play, Map, ChevronRight,
  Maximize2, ZoomIn, ZoomOut, AlertCircle, Compass, Shield, Route, Bus
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const RoutesTab: React.FC = () => {
  const { 
    useRoutes, useRoute, createRoute, updateRoute, deleteRoute, 
    assignStudents, removeStudent, useVehicles 
  } = useTransport();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);

  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Form states
  const [routeForm, setRouteForm] = useState({
    nom: '',
    zone: '',
    description: '',
    vehicule_id: 'none',
    heure_depart: '07:30',
    heure_retour: '17:30',
    statut: 'actif' as TransportRoute['statut'],
  });

  const [assignForm, setAssignForm] = useState({
    eleve_id: '',
    point_ramassage: '',
    latitude: 35.7595,
    longitude: -5.8340,
  });

  // Students list for dropdown selection
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Load routes & vehicles
  const { data: routesData, isLoading: loadingRoutes } = useRoutes({ q: searchQuery });
  const { data: vehiclesData } = useVehicles({ per_page: 100 });

  const routes = routesData?.data ?? [];
  const vehicles = vehiclesData?.data ?? [];

  // Set first route as active by default if none selected
  useEffect(() => {
    if (routes.length > 0 && activeRouteId === null) {
      setActiveRouteId(routes[0].id);
    }
  }, [routes, activeRouteId]);

  // Load active route details
  const { data: activeRouteResponse, isLoading: loadingActiveRoute } = useRoute(activeRouteId ?? 0);
  const activeRoute = activeRouteResponse as any;

  // Load students for assignment dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const list = await studentApiService.search({ search: '' });
        setStudentsList(list);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    };
    if (isAssignOpen) {
      fetchStudents();
    }
  }, [isAssignOpen]);

  // Handle Create Route
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...routeForm,
      vehicule_id: routeForm.vehicule_id === 'none' ? null : parseInt(routeForm.vehicule_id, 10),
    };
    try {
      const newRoute = await createRoute(payload);
      setIsCreateOpen(false);
      resetRouteForm();
      setActiveRouteId(newRoute.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Edit Route
  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRouteId) return;
    const payload = {
      ...routeForm,
      vehicule_id: routeForm.vehicule_id === 'none' ? null : parseInt(routeForm.vehicule_id, 10),
    };
    try {
      await updateRoute({ id: activeRouteId, data: payload });
      setIsEditOpen(false);
      resetRouteForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Delete Route
  const handleDeleteRoute = async () => {
    if (!activeRouteId) return;
    if (confirm('Are you sure you want to delete this route? All student assignments will be removed.')) {
      try {
        await deleteRoute(activeRouteId);
        setActiveRouteId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Assign Student
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRouteId || !assignForm.eleve_id) return;
    
    // Existing students on this route
    const currentStudents = activeRoute?.students ?? [];
    const newAssignment = {
      eleve_id: parseInt(assignForm.eleve_id, 10),
      point_ramassage: assignForm.point_ramassage || 'Custom Stop',
      latitude: parseFloat(String(assignForm.latitude)),
      longitude: parseFloat(String(assignForm.longitude)),
    };

    const updatedAssignments = [
      ...currentStudents.map((s: RouteStudent) => ({
        eleve_id: s.eleve_id,
        point_ramassage: s.point_ramassage ?? 'Default Stop',
        latitude: s.latitude ?? 35.7595,
        longitude: s.longitude ?? -5.8340,
      })),
      newAssignment
    ];

    try {
      await assignStudents({
        routeId: activeRouteId,
        assignments: updatedAssignments
      });
      setIsAssignOpen(false);
      resetAssignForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Remove Student
  const handleRemoveStudent = async (studentId: number) => {
    if (!activeRouteId) return;
    if (confirm('Remove student from this route?')) {
      try {
        await removeStudent({ routeId: activeRouteId, studentId });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = () => {
    if (!activeRoute) return;
    setRouteForm({
      nom: activeRoute.nom,
      zone: activeRoute.zone,
      description: activeRoute.description ?? '',
      vehicule_id: activeRoute.vehicule_id ? String(activeRoute.vehicule_id) : 'none',
      heure_depart: activeRoute.heure_depart ? activeRoute.heure_depart.substring(0, 5) : '07:30',
      heure_retour: activeRoute.heure_retour ? activeRoute.heure_retour.substring(0, 5) : '17:30',
      statut: activeRoute.statut,
    });
    setIsEditOpen(true);
  };

  const resetRouteForm = () => {
    setRouteForm({
      nom: '',
      zone: '',
      description: '',
      vehicule_id: 'none',
      heure_depart: '07:30',
      heure_retour: '17:30',
      statut: 'actif',
    });
  };

  const resetAssignForm = () => {
    setAssignForm({
      eleve_id: '',
      point_ramassage: '',
      latitude: 35.7595,
      longitude: -5.8340,
    });
  };

  // Map Animation simulation
  const [simulating, setSimulating] = useState(false);
  const [busProgress, setBusProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (simulating) {
      interval = setInterval(() => {
        setBusProgress((prev) => {
          if (prev >= 100) {
            setSimulating(false);
            return 0;
          }
          return prev + 2;
        });
      }, 150);
    } else {
      setBusProgress(0);
    }
    return () => clearInterval(interval);
  }, [simulating]);

  const activeStops = activeRoute?.students ?? [];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Tangier (EMSI campus location approx: 35.7595, -5.8340)
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([35.7595, -5.8340], 13);
    
    mapRef.current = map;

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // FeatureGroup for stops markers
    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and polyline when activeStops changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Clear previous markers
    markersGroupRef.current.clearLayers();

    // Remove old polyline
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
      .bindPopup('<b class="text-xs uppercase tracking-wide">NeoCampus Central Hub</b><br><span class="text-[10px] text-neutral-500 font-semibold">EMSI Tangier campus</span>')
      .addTo(markersGroupRef.current);

    const latlngs: L.LatLngExpression[] = [];
    
    // Always include NeoCampus Hub as start point of route
    latlngs.push([35.7595, -5.8340]);

    // Plot student stops
    activeStops.forEach((stop: RouteStudent, idx: number) => {
      if (stop.latitude && stop.longitude) {
        const lat = Number(stop.latitude);
        const lng = Number(stop.longitude);
        latlngs.push([lat, lng]);

        const stopIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center font-bold text-[10px] shadow-sm">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div class="text-xs font-semibold p-1">
            <h4 class="font-black text-neutral-900 border-b pb-1 mb-1 text-[11px] uppercase">${stop.point_ramassage || 'Stop Point'}</h4>
            <p class="mt-1">Student: <b class="text-neutral-850">${stop.prenom} ${stop.nom}</b></p>
            <p class="text-neutral-455 mt-0.5">Class: ${stop.classe_nom || 'N/A'}</p>
          </div>
        `;

        L.marker([lat, lng], { icon: stopIcon })
          .bindPopup(popupContent)
          .addTo(markersGroupRef.current);
      }
    });

    // Draw route polyline
    if (latlngs.length > 1) {
      const polyline = L.polyline(latlngs, {
        color: 'black',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(mapRef.current);
      polylineRef.current = polyline;

      // Fit map bounds to show all markers nicely
      mapRef.current.fitBounds(markersGroupRef.current.getBounds(), {
        padding: [50, 50]
      });
    } else {
      mapRef.current.setView([35.7595, -5.8340], 13);
    }
  }, [activeStops]);

  // Bus simulation animation
  useEffect(() => {
    if (!mapRef.current) return;

    if (busMarkerRef.current) {
      busMarkerRef.current.remove();
      busMarkerRef.current = null;
    }

    if (!simulating || activeStops.length === 0) return;

    // Filter valid coordinates
    const routeCoords: L.LatLngExpression[] = [[35.7595, -5.8340]]; // start at hub
    activeStops.forEach((stop: RouteStudent) => {
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

    // Determine position along segment
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
  }, [simulating, busProgress, activeStops]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
      
      {/* Left Panel: Routes, details & timeline (5-span) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Route Selector Card */}
        <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                Select Active Route
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={activeRouteId ? String(activeRouteId) : 'none'} 
                  onValueChange={(val) => setActiveRouteId(val && val !== 'none' ? parseInt(val, 10) : null)}
                >
                  <SelectTrigger className="flex-1 text-xs font-black uppercase tracking-wider bg-white">
                    <SelectValue placeholder="Select a route..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="none" className="text-xs font-semibold">Select a route...</SelectItem>
                    {routes.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)} className="text-xs font-bold">
                        {r.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => { resetRouteForm(); setIsCreateOpen(true); }}
                  className="bg-black hover:bg-neutral-850 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {activeRoute && (
              <div className="bg-neutral-50 p-4 border border-neutral-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-neutral-900 uppercase">
                      {activeRoute.nom}
                    </h3>
                    <p className="text-[10px] text-neutral-450 font-bold tracking-wide mt-0.5">
                      Zone: {activeRoute.zone}
                    </p>
                  </div>
                  <Badge className="text-[9px] font-black uppercase bg-white text-neutral-600 border border-neutral-200 px-2 py-0.5">
                    {activeRoute.heure_depart?.substring(0, 5)} - {activeRoute.heure_retour?.substring(0, 5)}
                  </Badge>
                </div>

                <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed">
                  {activeRoute.description ?? 'No description provided.'}
                </p>

                {activeRoute.vehicule && (
                  <div className="flex items-center gap-2 border-t border-neutral-200/50 pt-2 text-[10px] font-bold text-neutral-600">
                    <Bus className="h-3.5 w-3.5" />
                    <span>Assigned Vehicle: {activeRoute.vehicule.marque} ({activeRoute.vehicule.matricule})</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={openEditModal}
                    className="flex-1 text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg flex items-center justify-center gap-1.5 text-neutral-700 border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Modify Route
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteRoute}
                    className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-neutral-200 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mx-auto" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!activeRoute ? (
          <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-8 text-center flex-1 flex flex-col justify-center items-center py-12">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
              <Route className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="text-xs font-black text-neutral-800 uppercase tracking-tight">No Route Selected</h3>
            <p className="text-[10px] text-neutral-450 mt-1 font-semibold max-w-xs leading-relaxed">
              Please choose a route from the dropdown menu above or click the "+" button to register a new route. Once selected, you can assign students and manage stop waypoints.
            </p>
          </Card>
        ) : (
          <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs flex-1">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-neutral-600" />
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">
                    Student Stops Timeline
                  </h3>
                </div>
                <Button
                  onClick={() => setIsAssignOpen(true)}
                  className="bg-black hover:bg-neutral-850 text-white rounded-lg h-7 px-2.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer border-none"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add Student
                </Button>
              </div>

              {activeStops.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <MapPin className="h-6 w-6 text-neutral-350 mx-auto mb-2" />
                  <p className="text-[10px] text-neutral-450 font-semibold">
                    No students assigned to this route.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-neutral-200 space-y-6 ml-2 my-2">
                  {stopsWithCoords.map((stop: any, idx: number) => {
                    const statusText = idx === 0 ? 'En Route' : (idx === 1 ? 'Upcoming' : 'On Time');
                    const statusColors = {
                      'En Route': 'bg-sky-50 text-sky-750 border-sky-150',
                      'Upcoming': 'bg-amber-50 text-amber-750 border-amber-150',
                      'On Time': 'bg-emerald-50 text-emerald-750 border-emerald-150',
                    }[statusText] || 'bg-neutral-50 text-neutral-500 border-neutral-200';

                    return (
                      <div key={stop.eleve_id} className="relative">
                        {/* Bullet point stop */}
                        <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-black flex items-center justify-center text-[8px] font-black">
                          {idx + 1}
                        </div>

                        {/* Card stop */}
                        <div className="flex justify-between items-start gap-4 bg-neutral-50/70 hover:bg-neutral-50 p-3 border border-neutral-100 rounded-xl transition duration-150 group">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                              {stop.point_ramassage ?? 'Unspecified Stop'}
                            </h4>
                            <p className="text-[10px] text-neutral-450 font-bold mt-0.5">
                              {stop.prenom} {stop.nom} ({stop.classe_nom})
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 mt-1 font-semibold">
                              <Compass className="h-3 w-3" />
                              <span>Lat: {stop.latitude?.toFixed(4)}, Lng: {stop.longitude?.toFixed(4)}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <Badge className={`text-[8px] font-extrabold uppercase px-1.5 py-0 border ${statusColors}`}>
                              {statusText}
                            </Badge>
                            <button
                              onClick={() => handleRemoveStudent(stop.eleve_id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition cursor-pointer bg-transparent border-none p-0 mt-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel: Simulated map widget (7-span) */}
      <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[82vh]">
        {/* Header Widget Map */}
        <div className="border-b border-neutral-100 p-4 bg-neutral-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-neutral-600" />
            <span className="text-xs font-black uppercase text-neutral-900 tracking-wider">
              Tangier Transit Tracking Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/transport/tracking"
              className="bg-white hover:bg-neutral-50 text-neutral-805 border border-neutral-200 rounded-lg h-7 px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer decoration-none"
            >
              <Maximize2 className="h-3 w-3" /> Fullscreen Map
            </Link>
            {activeRoute && activeStops.length > 1 && (
              <Button
                onClick={() => { setSimulating(!simulating); if(simulating) setBusProgress(0); }}
                className="bg-black hover:bg-neutral-850 text-white rounded-lg h-7 px-3.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer border-none"
              >
                <Play className={`h-3 w-3 ${simulating ? 'animate-pulse text-[#d0f137]' : ''}`} />
                {simulating ? 'Stop Circuit' : 'Simulate Circuit'}
              </Button>
            )}
          </div>
        </div>

        {/* Map Body Graphic */}
        <div className="flex-1 relative bg-[#F3F4F6] overflow-hidden flex items-center justify-center">
          
          {/* Real interactive Leaflet map container */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Map Status Overlay Footer */}
          {activeRoute && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 border border-neutral-100 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-500" />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Bus Fleet Tracking</p>
                  <p className="text-xs font-bold text-neutral-800 leading-tight">
                    {simulating ? 'Bus is currently en route...' : 'Bus is parked at starting hub.'}
                  </p>
                </div>
              </div>
              <Badge className="bg-black text-[#d0f137] text-[9px] font-black uppercase tracking-wider">
                {activeRoute.statut === 'actif' ? 'Active Route' : 'Inactive'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Create Route Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Create Transport Route
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoute} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="route-nom" className="text-xs font-bold">Route Name</Label>
              <Input
                id="route-nom"
                required
                placeholder="e.g. Marshan Coastal Line"
                value={routeForm.nom}
                onChange={(e) => setRouteForm({ ...routeForm, nom: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="route-zone" className="text-xs font-bold">Covered Zone / Area</Label>
              <Input
                id="route-zone"
                required
                placeholder="e.g. Marshan / Dradeb"
                value={routeForm.zone}
                onChange={(e) => setRouteForm({ ...routeForm, zone: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="route-desc" className="text-xs font-bold">Description</Label>
              <Input
                id="route-desc"
                placeholder="Served zones description..."
                value={routeForm.description}
                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="route-depart" className="text-xs font-bold">Departure Time</Label>
                <Input
                  id="route-depart"
                  type="time"
                  required
                  value={routeForm.heure_depart}
                  onChange={(e) => setRouteForm({ ...routeForm, heure_depart: e.target.value })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="route-retour" className="text-xs font-bold">Return Time</Label>
                <Input
                  id="route-retour"
                  type="time"
                  required
                  value={routeForm.heure_retour}
                  onChange={(e) => setRouteForm({ ...routeForm, heure_retour: e.target.value })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="route-bus" className="text-xs font-bold">Assigned Bus</Label>
                <Select
                  value={routeForm.vehicule_id}
                  onValueChange={(val) => setRouteForm({ ...routeForm, vehicule_id: val || 'none' })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="none" className="text-xs font-semibold">Unassigned</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)} className="text-xs font-semibold">
                        {v.marque} ({v.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="route-status" className="text-xs font-bold">Status</Label>
                <Select
                  value={routeForm.statut}
                  onValueChange={(val: any) => setRouteForm({ ...routeForm, statut: val })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="actif" className="text-xs font-semibold">Active</SelectItem>
                    <SelectItem value="inactif" className="text-xs font-semibold">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Create Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Modify Route Details
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRoute} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-route-nom" className="text-xs font-bold">Route Name</Label>
              <Input
                id="edit-route-nom"
                required
                value={routeForm.nom}
                onChange={(e) => setRouteForm({ ...routeForm, nom: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-route-zone" className="text-xs font-bold">Covered Zone</Label>
              <Input
                id="edit-route-zone"
                required
                value={routeForm.zone}
                onChange={(e) => setRouteForm({ ...routeForm, zone: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-route-desc" className="text-xs font-bold">Description</Label>
              <Input
                id="edit-route-desc"
                value={routeForm.description}
                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-route-depart" className="text-xs font-bold">Departure Time</Label>
                <Input
                  id="edit-route-depart"
                  type="time"
                  required
                  value={routeForm.heure_depart}
                  onChange={(e) => setRouteForm({ ...routeForm, heure_depart: e.target.value })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-route-retour" className="text-xs font-bold">Return Time</Label>
                <Input
                  id="edit-route-retour"
                  type="time"
                  required
                  value={routeForm.heure_retour}
                  onChange={(e) => setRouteForm({ ...routeForm, heure_retour: e.target.value })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-route-bus" className="text-xs font-bold">Assigned Bus</Label>
                <Select
                  value={routeForm.vehicule_id}
                  onValueChange={(val) => setRouteForm({ ...routeForm, vehicule_id: val || 'none' })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="none" className="text-xs font-semibold">Unassigned</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)} className="text-xs font-semibold">
                        {v.marque} ({v.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-route-status" className="text-xs font-bold">Status</Label>
                <Select
                  value={routeForm.statut}
                  onValueChange={(val: any) => setRouteForm({ ...routeForm, statut: val })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="actif" className="text-xs font-semibold">Active</SelectItem>
                    <SelectItem value="inactif" className="text-xs font-semibold">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Save Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Assign Student Stop
            </DialogTitle>
            <DialogDescription className="text-[11px] font-semibold text-neutral-400">
              Select a student and specify their pickup stop name and coordinates within Tangier.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignStudent} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="assign-student" className="text-xs font-bold">Select Student</Label>
              <Select
                value={assignForm.eleve_id}
                onValueChange={(val) => setAssignForm({ ...assignForm, eleve_id: val || '' })}
              >
                <SelectTrigger className="w-full text-xs font-semibold bg-white">
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100 max-h-[200px] overflow-y-auto">
                  {studentsList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="text-xs font-semibold">
                      {s.prenom} {s.nom} ({s.classe_nom || 'No Class'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assign-stop" className="text-xs font-bold">Stop / Pickup Point Name</Label>
              <Input
                id="assign-stop"
                required
                placeholder="e.g. Corner Café de Paris"
                value={assignForm.point_ramassage}
                onChange={(e) => setAssignForm({ ...assignForm, point_ramassage: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="assign-lat" className="text-xs font-bold">Latitude</Label>
                <Input
                  id="assign-lat"
                  type="number"
                  step="0.000001"
                  min="35.70"
                  max="35.80"
                  required
                  value={assignForm.latitude}
                  onChange={(e) => setAssignForm({ ...assignForm, latitude: parseFloat(e.target.value) })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assign-lng" className="text-xs font-bold">Longitude</Label>
                <Input
                  id="assign-lng"
                  type="number"
                  step="0.000001"
                  min="-5.90"
                  max="-5.70"
                  required
                  value={assignForm.longitude}
                  onChange={(e) => setAssignForm({ ...assignForm, longitude: parseFloat(e.target.value) })}
                  className="text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignOpen(false)}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Assign Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default RoutesTab;
