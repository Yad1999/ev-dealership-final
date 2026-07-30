import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Zap, Navigation, Search, Sliders, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for Vite / Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom User Pin (Electric Green)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Interface based on Open Charge Map (OCM)
interface OCMCharger {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Latitude: number;
    Longitude: number;
  };
  Connections: {
    ConnectionType?: { Title: string };
    PowerKW?: number;
  }[] | null;
}

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Map Centering & Zoom Sub-component
function RecenterAutomatically({ lat, lng, radius }: { lat: number; lng: number; radius: number }) {
  const map = useMap();
  useEffect(() => {
    let zoom = 10;
    if (radius <= 10) zoom = 13;
    else if (radius <= 25) zoom = 11;
    else if (radius <= 50) zoom = 10;
    else zoom = 8;
    
    map.setView([lat, lng], zoom);
  }, [lat, lng, radius, map]);
  return null;
}

// Fetch real data from Open Charge Map
const fetchRealChargers = async (lat: number, lng: number, radiusKm: number): Promise<OCMCharger[]> => {
  const apiKey = import.meta.env.VITE_OPENCHARGEMAP_API_KEY;
  if (!apiKey) {
    console.warn("No VITE_OPENCHARGEMAP_API_KEY found.");
    return [];
  }
  
  try {
    const res = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${radiusKm}&distanceunit=KM&maxresults=80&key=${apiKey}`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    return data as OCMCharger[];
  } catch (error) {
    console.error("Error fetching real chargers:", error);
    return [];
  }
};

export function EVChargerMap() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Your Location');
  const [chargers, setChargers] = useState<OCMCharger[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(50); // Default 50km
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingChargers, setIsLoadingChargers] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const updateLocationAndFetch = async (lat: number, lng: number, name: string, radius: number) => {
    setUserLocation({ lat, lng });
    setLocationName(name);
    setIsLoadingChargers(true);
    const data = await fetchRealChargers(lat, lng, radius);
    setChargers(data);
    setIsLoadingChargers(false);
  };

  // Initialize with Geolocation or Fallback
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocationAndFetch(position.coords.latitude, position.coords.longitude, 'Your Location', 50);
        },
        (error) => {
          console.error('Error obtaining location', error);
          setLocationError('Location access denied. Showing Toronto, ON');
          updateLocationAndFetch(43.6532, -79.3832, 'Toronto, ON', 50);
        }
      );
    } else {
      updateLocationAndFetch(43.6532, -79.3832, 'Toronto, ON', 50);
    }
  }, []);

  // Recalculate chargers when radius changes
  const handleRadiusChange = async (newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      setIsLoadingChargers(true);
      const data = await fetchRealChargers(userLocation.lat, userLocation.lng, newRadius);
      setChargers(data);
      setIsLoadingChargers(false);
    }
  };

  // Handle Location Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0];
        
        await updateLocationAndFetch(newLat, newLng, displayName, searchRadius);
        setSearchQuery('');
      } else {
        setLocationError(`No results found for "${searchQuery}".`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setLocationError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Compute distance to closest charger
  const closestDistance = userLocation && chargers.length > 0
    ? Math.min(
        ...chargers.map((c) =>
          calculateDistanceKm(userLocation.lat, userLocation.lng, c.AddressInfo.Latitude, c.AddressInfo.Longitude)
        )
      )
    : null;

  return (
    <section id="chargers" className="py-24 px-6 md:px-12 lg:px-24 bg-[#040A11] relative border-t border-[#1a2634]">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F6F9FC] leading-normal py-1">
            <span className="text-gradient">Volt Chargers</span> Near You
          </h2>
        </div>
        <p className="text-[#8D9CAE] max-w-sm text-lg">
          Our real-time map keeps you plugged into the largest unified charging network, right from your dashboard.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-[#1a2634] bg-[#0A121A] shadow-[0_0_40px_rgba(104,227,113,0.05)] overflow-hidden">
          {/* Map Area */}
          <div className="relative aspect-[16/10] md:aspect-[16/7] w-full z-0">
            {userLocation ? (
              <MapContainer 
                center={[userLocation.lat, userLocation.lng]} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />
                
                <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} radius={searchRadius} />

                {/* Active User/Target Location Pin */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <strong className="text-gray-900">{locationName}</strong>
                  </Popup>
                </Marker>

                {/* Charger Pins */}
                {chargers.map((charger) => (
                  <Marker 
                    key={charger.ID} 
                    position={[charger.AddressInfo.Latitude, charger.AddressInfo.Longitude]}
                  >
                    <Popup className="charger-popup">
                      <div className="text-gray-900 min-w-[200px]">
                        <h4 className="font-bold text-base mb-1">{charger.AddressInfo.Title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{charger.AddressInfo.AddressLine1 || 'Unknown Address'}</p>
                        
                        {charger.Connections && charger.Connections.length > 0 ? (
                          <div className="space-y-1">
                            {charger.Connections.map((conn, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded text-sm">
                                <span className="font-medium">{conn.ConnectionType?.Title || 'Standard'}</span>
                                <span className="text-[#25A545] font-bold">{conn.PowerKW ? `${conn.PowerKW} kW` : 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">No connection info available</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0d1621]">
                <div className="animate-pulse flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-[#68E371] mb-4" />
                  <p className="text-[#8D9CAE]">Locating nearby chargers...</p>
                </div>
              </div>
            )}
            
            {/* Filter overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A121A] to-transparent opacity-40 mix-blend-multiply z-[400]"></div>
            
            {locationError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-red-500/20 text-red-200 px-4 py-2 rounded-full text-sm backdrop-blur border border-red-500/50">
                {locationError}
              </div>
            )}
            
            {/* Loading Overlay */}
            {isLoadingChargers && userLocation && (
              <div className="absolute top-4 right-4 z-[400] bg-[#14202D]/90 text-[#F6F9FC] px-4 py-2 rounded-full text-sm backdrop-blur border border-[#1a2634] flex items-center gap-2 shadow-lg">
                <Loader2 className="w-4 h-4 text-[#68E371] animate-spin" />
                Fetching real stations...
              </div>
            )}
          </div>

          {/* Interactive Stats & Controls Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#1a2634]">
            {/* Cell 1: Chargers Found */}
            <div className="bg-[#0A121A] p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8D9CAE] uppercase tracking-wider">Chargers Found</span>
                <Zap className="w-5 h-5 text-[#68E371]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#F6F9FC] mb-1">
                  {isLoadingChargers ? <span className="text-[#5A6E85] text-2xl animate-pulse">Loading...</span> : <>{chargers.length} <span className="text-lg font-normal text-[#8D9CAE]">Stations</span></>}
                </div>
                <div className="text-xs text-[#68E371]">Within {searchRadius} km radius</div>
              </div>
            </div>

            {/* Cell 2: Closest Station */}
            <div className="bg-[#0A121A] p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8D9CAE] uppercase tracking-wider">Closest Station</span>
                <Navigation className="w-5 h-5 text-[#68E371]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#F6F9FC] mb-1">
                  {isLoadingChargers 
                    ? <span className="text-[#5A6E85] text-2xl animate-pulse">Loading...</span> 
                    : closestDistance !== null 
                      ? `${closestDistance.toFixed(1)} km` 
                      : 'N/A'}
                </div>
                <div className="text-xs text-[#8D9CAE]">From {locationName}</div>
              </div>
            </div>

            {/* Cell 3: Search Custom Location */}
            <div className="bg-[#0A121A] p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8D9CAE] uppercase tracking-wider">Change Location</span>
                <Search className="w-5 h-5 text-[#68E371]" />
              </div>
              <form onSubmit={handleSearchSubmit} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="City or postal code..."
                  className="w-full bg-[#14202D] border border-[#1a2634] text-sm text-[#F6F9FC] placeholder-[#5A6E85] rounded-lg px-3 py-2 focus:outline-none focus:border-[#68E371] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-semibold px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center min-w-[38px] cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>
            </div>

            {/* Cell 4: Search Radius Select */}
            <div className="bg-[#0A121A] p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8D9CAE] uppercase tracking-wider">Search Radius</span>
                <Sliders className="w-5 h-5 text-[#68E371]" />
              </div>
              <div className="mt-1">
                <select
                  value={searchRadius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  disabled={isLoadingChargers}
                  className="w-full bg-[#14202D] border border-[#1a2634] text-sm text-[#F6F9FC] rounded-lg px-3 py-2 focus:outline-none focus:border-[#68E371] cursor-pointer disabled:opacity-50"
                >
                  <option value={10}>10 km Radius</option>
                  <option value={25}>25 km Radius</option>
                  <option value={50}>50 km Radius</option>
                  <option value={100}>100 km Radius</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
