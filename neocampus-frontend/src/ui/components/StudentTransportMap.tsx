import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useTransport } from '@/application/useCases/useTransport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Loader2, Compass, AlertCircle } from 'lucide-react';

interface StudentTransportMapProps {
  transportRequired: boolean;
  onChangeTransportRequired: (required: boolean) => void;
  routeId: number | null;
  onChangeRouteId: (id: number | null) => void;
  pointRamassage: string;
  onChangePointRamassage: (val: string) => void;
  latitude: number | null;
  longitude: number | null;
  onChangeCoordinates: (lat: number | null, lng: number | null) => void;
}

export const StudentTransportMap: React.FC<StudentTransportMapProps> = ({
  transportRequired,
  onChangeTransportRequired,
  routeId,
  onChangeRouteId,
  pointRamassage,
  onChangePointRamassage,
  latitude,
  longitude,
  onChangeCoordinates,
}) => {
  const { useRoutes } = useTransport();
  const { data: routesResponse } = useRoutes();
  const routes = routesResponse?.data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Local form states inside the modal (so they can cancel modifications)
  const [localRouteId, setLocalRouteId] = useState<string>('none');
  const [localPoint, setLocalPoint] = useState('');
  const [localLat, setLocalLat] = useState<number>(35.7595);
  const [localLng, setLocalLng] = useState<number>(-5.8340);

  // Refs for maps
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<L.Map | null>(null);
  const modalMarkerRef = useRef<L.Marker | null>(null);

  // Initialize mini preview map
  useEffect(() => {
    if (!transportRequired || !miniMapContainerRef.current) {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        miniMarkerRef.current = null;
      }
      return;
    }

    const lat = latitude ?? 35.7595;
    const lng = longitude ?? -5.8340;

    // Small preview map
    const map = L.map(miniMapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
    }).setView([lat, lng], 14);

    miniMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-5 h-5 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-md animate-bounce"><div class="w-1.5 h-1.5 rounded-full bg-[#d0f137]"></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    miniMarkerRef.current = marker;

    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        miniMarkerRef.current = null;
      }
    };
  }, [transportRequired, latitude, longitude]);

  // Synchronize mini preview map when coords change
  useEffect(() => {
    if (miniMapRef.current && miniMarkerRef.current && latitude && longitude) {
      miniMapRef.current.setView([latitude, longitude], 14);
      miniMarkerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Sync state when opening the modal
  const handleOpenModal = () => {
    setLocalRouteId(routeId ? String(routeId) : 'none');
    setLocalPoint(pointRamassage || '');
    setLocalLat(latitude ?? 35.7595);
    setLocalLng(longitude ?? -5.8340);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setIsModalOpen(true);
  };

  // Initialize large dialog map when modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    // Delay map creation slightly to ensure container is fully rendered in the DOM
    const timer = setTimeout(() => {
      if (!modalMapContainerRef.current) return;

      const map = L.map(modalMapContainerRef.current, {
        zoomControl: false
      }).setView([localLat, localLng], 14);

      modalMapRef.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-black/15 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-md">
              <div class="w-2 h-2 rounded-full bg-[#d0f137]"></div>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      // Draggable marker
      const marker = L.marker([localLat, localLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      modalMarkerRef.current = marker;

      // Click on map to move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setLocalLat(lat);
        setLocalLng(lng);
      });

      // Drag marker event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setLocalLat(position.lat);
        setLocalLng(position.lng);
      });

      // Redraw map to avoid display glitch in modals
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (modalMapRef.current) {
        modalMapRef.current.remove();
        modalMapRef.current = null;
        modalMarkerRef.current = null;
      }
    };
  }, [isModalOpen]);

  // Geocoding Nominatim Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    // Force query results inside Tangier
    const cleanQuery = searchQuery.toLowerCase().includes('tanger') || searchQuery.toLowerCase().includes('tangier')
      ? searchQuery
      : `${searchQuery}, Tangier, Morocco`;

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: cleanQuery,
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        setSearchError('No addresses found in Tangier matching query.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Failed to retrieve search results. Check internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: any) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);

    setLocalLat(lat);
    setLocalLng(lon);

    // Pre-fill stop name if currently blank or generic
    const streetName = loc.address?.road || loc.address?.suburb || loc.address?.quarter || loc.display_name.split(',')[0];
    setLocalPoint(streetName);

    // Pan map to search result and update marker position
    if (modalMapRef.current && modalMarkerRef.current) {
      modalMapRef.current.setView([lat, lon], 16);
      modalMarkerRef.current.setLatLng([lat, lon]);
    }

    setSearchResults([]);
  };

  // Save changes
  const handleSaveChanges = () => {
    const routeIdVal = localRouteId === 'none' ? null : parseInt(localRouteId, 10);
    onChangeRouteId(routeIdVal);
    onChangePointRamassage(localPoint || 'Home Pickup');
    onChangeCoordinates(localLat, localLng);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Checkbox Trigger */}
      <div className="flex items-center gap-2 select-none pt-2">
        <input
          id="transportRequired"
          type="checkbox"
          checked={transportRequired}
          onChange={(e) => {
            onChangeTransportRequired(e.target.checked);
            if (e.target.checked && !latitude) {
              // Default default EMSI Tangier Hub location coords
              onChangeCoordinates(35.7595, -5.8340);
              onChangePointRamassage('EMSI Tangier Campus');
            }
          }}
          className="size-4 text-black border-neutral-300 rounded focus:ring-black cursor-pointer"
        />
        <Label htmlFor="transportRequired" className="text-xs font-bold uppercase tracking-wider cursor-pointer text-neutral-700">
          Transport Service Required
        </Label>
      </div>

      {transportRequired && (
        <div className="border border-neutral-200/80 bg-white p-3 rounded-2xl flex flex-col sm:flex-row gap-4 items-center max-w-[500px] shadow-xs">
          {/* Small Preview Map Container */}
          <div 
            ref={miniMapContainerRef} 
            onClick={handleOpenModal}
            className="w-full sm:w-28 h-20 bg-neutral-100 border border-neutral-150 rounded-xl overflow-hidden cursor-pointer relative group"
            title="Click to change stop location"
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-150 flex items-center justify-center z-10">
              <span className="bg-white/95 px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-black">
                Edit Map
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Pickup Stop Point</p>
            <h4 className="text-xs font-bold text-neutral-900 leading-snug truncate mt-0.5">
              {pointRamassage || 'No stop specified'}
            </h4>
            
            <p className="text-[10px] text-neutral-450 font-semibold mt-1 truncate">
              {routeId ? `Route: ${routes.find(r => r.id === routeId)?.nom || 'Assigned'}` : 'No route assigned'}
            </p>
            
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-neutral-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>Lat: {latitude?.toFixed(5)}, Lng: {longitude?.toFixed(5)}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleOpenModal}
            className="text-[10px] font-black uppercase tracking-wider border-neutral-200 hover:bg-neutral-50 h-8 rounded-lg shrink-0 w-full sm:w-auto cursor-pointer"
          >
            Geolocate
          </Button>
        </div>
      )}

      {/* Large Geolocation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-lg rounded-3xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4" /> Geolocate Stop Address
            </DialogTitle>
            <DialogDescription className="text-[11px] font-semibold text-neutral-450 leading-relaxed mt-0.5">
              Search for streets/avenues in Tangier or click directly on the map to pinpoint the student's exact pickup location. Drag the pin to adjust.
            </DialogDescription>
          </DialogHeader>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 mt-3 shrink-0 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-450" />
              <Input
                type="text"
                placeholder="Search street, avenue or neighbourhood in Tangier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs font-semibold bg-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-black hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-wider px-4 cursor-pointer"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>

            {/* Geocode Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-150 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(loc)}
                    className="p-3 text-xs font-semibold hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-none flex items-start gap-2 text-neutral-750"
                  >
                    <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="truncate">{loc.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {searchError && (
            <div className="mt-2 text-[10px] font-bold text-red-650 flex items-center gap-1.5 shrink-0 bg-red-50 p-2 rounded-lg border border-red-100">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Interactive Leaflet Map Container */}
          <div className="flex-1 relative bg-neutral-100 border border-neutral-150 rounded-2xl overflow-hidden mt-4 min-h-[250px] z-0">
            <div ref={modalMapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Setup assignments fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 shrink-0">
            <div className="space-y-1.5">
              <Label htmlFor="modal-stop-name" className="text-xs font-bold">Stop / Pickup Address Label</Label>
              <Input
                id="modal-stop-name"
                placeholder="e.g. California Villa 12, Stop X"
                value={localPoint}
                onChange={(e) => setLocalPoint(e.target.value)}
                className="text-xs font-semibold bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="modal-route" className="text-xs font-bold">Assign to Transport Route</Label>
              <Select value={localRouteId} onValueChange={setLocalRouteId}>
                <SelectTrigger className="w-full text-xs font-semibold bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100">
                  <SelectItem value="none" className="text-xs font-semibold text-neutral-400">Select Route...</SelectItem>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs font-semibold">
                      {r.nom} ({r.zone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-450 font-bold border-t border-neutral-100 pt-3 mt-4 shrink-0">
            <span>Coordinates Pinned:</span>
            <span className="text-black font-extrabold">Lat: {localLat.toFixed(5)}, Lng: {localLng.toFixed(5)}</span>
          </div>

          <DialogFooter className="pt-3 border-t border-neutral-100 shrink-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
