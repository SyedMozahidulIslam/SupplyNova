import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Compass,
  Zap,
  CheckCircle,
  Clock,
  Gauge,
  Droplet,
  Shuffle,
  Activity,
  Maximize2,
  Map as MapIcon,
} from 'lucide-react';
import { Vehicle } from '../types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FleetModuleProps {
  vehicles: Vehicle[];
  onTriggerRerouting: (vehicleId: string) => void;
}

export default function FleetModule({ vehicles, onTriggerRerouting }: FleetModuleProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('veh-1');
  const [showRerouteDialog, setShowRerouteDialog] = useState(false);
  const [optimizedRouteMsg, setOptimizedRouteMsg] = useState('');
  const [tick, setTick] = useState(0);
  const [mapViewMode, setMapViewMode] = useState<'interactive' | 'abstract'>('interactive');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const hubMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Dynamic animation loop simulating real-time GPS coordinate movement!
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Map coordinates to pixel values for a 100% vector SVG map of Bangladesh
  // Let's model Bangladesh's lat range (20.5 to 26.5) and lng range (88 to 92.5)
  const getMapCoords = (lat: number, lng: number) => {
    const minLat = 20.5;
    const maxLat = 26.5;
    const minLng = 88.0;
    const maxLng = 92.5;

    // SVG width: 500, height: 600
    const x = ((lng - minLng) / (maxLng - minLng)) * 500;
    // Lat is inverted on Y axis
    const y = 600 - ((lat - minLat) / (maxLat - minLat)) * 600;
    return { x, y };
  };

  // Pre-mapped critical SCM hubs on the Bangladesh Map
  const MAP_HUBS = [
    { name: 'Dhaka Central Hub', lat: 23.8103, lng: 90.4125, color: '#3b82f6' },
    { name: 'Chittagong Port', lat: 22.3304, lng: 91.8335, color: '#10b981' },
    { name: 'Gazipur Sourcing Center', lat: 23.9900, lng: 90.4100, color: '#f59e0b' },
    { name: 'Sylhet Express Warehouse', lat: 24.8917, lng: 91.8667, color: '#06b6d4' },
    { name: 'Bogra Distribution Hub', lat: 24.8500, lng: 89.3700, color: '#a855f7' },
  ];

  const handleOptimizeRoute = () => {
    onTriggerRerouting(selectedVehicle.id);
    setOptimizedRouteMsg(`AI Optimizer active: Re-routing ${selectedVehicle.plateNumber} via Comilla-Chandpur bypass. Bypassed 10km traffic bottleneck. BDT 4,200 fuel costs saved.`);
    setTimeout(() => setOptimizedRouteMsg(''), 6000);
  };

  // Get current animated position along the route coords in { x, y } (for abstract map)
  const getAnimatedPos = (veh: Vehicle) => {
    if (veh.routeCoordinates.length === 1) {
      return getMapCoords(veh.routeCoordinates[0][0], veh.routeCoordinates[0][1]);
    }
    const idx = veh.currentRouteIndex;
    const nextIdx = (idx + 1) % veh.routeCoordinates.length;
    const p1 = veh.routeCoordinates[idx];
    const p2 = veh.routeCoordinates[nextIdx];
    
    const factor = (tick % 4) / 4;
    const lat = p1[0] + (p2[0] - p1[0]) * factor;
    const lng = p1[1] + (p2[1] - p1[1]) * factor;
    
    return getMapCoords(lat, lng);
  };

  // Get current animated position in { lat, lng } (for interactive MapLibre map)
  const getAnimatedLatLng = (veh: Vehicle) => {
    if (veh.routeCoordinates.length === 1) {
      return { lat: veh.routeCoordinates[0][0], lng: veh.routeCoordinates[0][1] };
    }
    const idx = veh.currentRouteIndex;
    const nextIdx = (idx + 1) % veh.routeCoordinates.length;
    const p1 = veh.routeCoordinates[idx];
    const p2 = veh.routeCoordinates[nextIdx];
    
    const factor = (tick % 4) / 4;
    const lat = p1[0] + (p2[0] - p1[0]) * factor;
    const lng = p1[1] + (p2[1] - p1[1]) * factor;
    
    return { lat, lng };
  };

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (mapViewMode !== 'interactive' || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [90.35, 23.8], // Bangladesh center [lng, lat]
      zoom: 6.8,
      attributionControl: false
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    const onMapLoad = () => {
      // Add traffic hotspots representing live traffic conditions in Bangladesh
      const trafficHotspots = [
        {
          id: 'traffic-1',
          coords: [
            [90.4125, 23.8103], // Dhaka
            [90.65, 23.75],     // Narayanganj bottleneck
            [90.9, 23.6],       // Comilla approach
          ]
        },
        {
          id: 'traffic-2',
          coords: [
            [91.4, 24.5],
            [91.8667, 24.8917], // Sylhet bypass congestion
          ]
        }
      ];

      trafficHotspots.forEach((hotspot) => {
        if (map.getSource(hotspot.id)) return;
        map.addSource(hotspot.id, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: hotspot.coords
            }
          }
        });

        map.addLayer({
          id: `${hotspot.id}-layer`,
          type: 'line',
          source: hotspot.id,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#f43f5e',
            'line-width': 4,
            'line-dasharray': [2, 2],
            'line-opacity': 0.8
          }
        });
      });

      // Add route layers for vehicles in transit
      vehicles.forEach((v) => {
        if (v.status !== 'in_transit') return;
        
        const sourceId = `route-${v.id}`;
        const coords = v.routeCoordinates.map(c => [c[1], c[0]]);

        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        });

        map.addLayer({
          id: `${sourceId}-layer`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': v.id === selectedVehicleId ? '#3b82f6' : '#9ca3af',
            'line-width': v.id === selectedVehicleId ? 3.5 : 2,
            'line-opacity': v.id === selectedVehicleId ? 0.9 : 0.4
          }
        });
      });

      // Add Critical SCM Hub markers with elegant glowing ripple effects
      MAP_HUBS.forEach((hub) => {
        const el = document.createElement('div');
        el.className = 'hub-marker-container';
        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <div class="absolute w-6 h-6 -mt-1.5 rounded-full" style="background-color: ${hub.color}; opacity: 0.15; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div class="w-3 h-3 rounded-full border border-white shadow-md" style="background-color: ${hub.color};"></div>
            <div class="mt-1 px-1 py-0.5 rounded bg-brand-black/75 border border-white/5 text-[8px] font-mono font-bold tracking-tight text-gray-300 whitespace-nowrap uppercase">
              ${hub.name.split(' ')[0]}
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([hub.lng, hub.lat])
          .addTo(map);

        hubMarkersRef.current.push(marker);
      });
    };

    if (map.loaded()) {
      onMapLoad();
    } else {
      map.once('load', onMapLoad);
    }

    return () => {
      // Cleanup all markers and map resources
      Object.keys(markersRef.current).forEach(key => {
        markersRef.current[key]?.remove();
      });
      markersRef.current = {};
      hubMarkersRef.current.forEach(m => m.remove());
      hubMarkersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapViewMode]);

  // Synchronize vehicle markers with real-time GPS coordinate movement tick
  useEffect(() => {
    const map = mapRef.current;
    if (mapViewMode !== 'interactive' || !map) return;

    vehicles.forEach((veh) => {
      const latLng = getAnimatedLatLng(veh);
      let marker = markersRef.current[veh.id];

      if (!marker) {
        const el = document.createElement('div');
        el.className = 'vehicle-marker-container';
        
        const isSelected = veh.id === selectedVehicleId;
        const markerColor = veh.status === 'in_transit' ? '#10b981' : veh.status === 'maintenance' ? '#f43f5e' : '#f59e0b';
        
        el.innerHTML = `
          <div class="relative flex flex-col items-center group">
            <!-- Pulsing alert for moving vehicle -->
            ${veh.status === 'in_transit' ? `<div class="absolute -inset-1.5 rounded-full bg-emerald-500/25 animate-ping pointer-events-none"></div>` : ''}
            
            <div class="w-7 h-7 rounded bg-[#121214]/90 border ${isSelected ? 'border-accent-blue scale-110 shadow-accent-blue/30' : 'border-white/10 hover:border-white'} flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            
            <div class="mt-0.5 px-1 py-0.2 rounded bg-brand-black/95 border border-white/5 text-[7px] font-mono text-white whitespace-nowrap shadow-md uppercase">
              ${veh.plateNumber.split('-')[3] || veh.plateNumber}
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedVehicleId(veh.id);
        });

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([latLng.lng, latLng.lat])
          .addTo(map);

        markersRef.current[veh.id] = marker;
      } else {
        // Update marker geographical coordinates
        marker.setLngLat([latLng.lng, latLng.lat]);

        // Dynamically style selection state of custom element
        const el = marker.getElement();
        const isSelected = veh.id === selectedVehicleId;
        const innerBox = el.querySelector('.w-7');
        if (innerBox) {
          if (isSelected) {
            innerBox.className = 'w-7 h-7 rounded bg-[#121214]/90 border border-accent-blue scale-110 shadow-accent-blue/30 flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer';
          } else {
            innerBox.className = 'w-7 h-7 rounded bg-[#121214]/90 border border-white/10 hover:border-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer';
          }
        }
      }
    });

    // Handle deletions or dynamic updates
    Object.keys(markersRef.current).forEach((id) => {
      if (!vehicles.find(v => v.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Update active SCM route line styling
    if (map.loaded()) {
      vehicles.forEach((v) => {
        const layerId = `route-${v.id}-layer`;
        if (map.getLayer(layerId)) {
          const isSelected = v.id === selectedVehicleId;
          map.setPaintProperty(layerId, 'line-color', isSelected ? '#3b82f6' : '#9ca3af');
          map.setPaintProperty(layerId, 'line-width', isSelected ? 3.5 : 2);
          map.setPaintProperty(layerId, 'line-opacity', isSelected ? 0.9 : 0.4);
        }
      });
    }
  }, [vehicles, selectedVehicleId, tick, mapViewMode]);

  // Handle active fly-to panning to keep selected vehicle in viewpoint
  useEffect(() => {
    const map = mapRef.current;
    if (mapViewMode !== 'interactive' || !map) return;

    const veh = vehicles.find(v => v.id === selectedVehicleId);
    if (veh) {
      const latLng = getAnimatedLatLng(veh);
      map.easeTo({
        center: [latLng.lng, latLng.lat],
        zoom: Math.max(map.getZoom(), 8.0),
        duration: 1000
      });
    }
  }, [selectedVehicleId]);

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header */}
      <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <Truck size={20} className="text-accent-cyan animate-pulse" /> Live Fleet GIS Map
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Real-time GPS tracking coordinates, simulated reefer temps, speed telemetry, and AI routing
          </p>
        </div>

        <button
          onClick={handleOptimizeRoute}
          className="px-4 py-2.5 rounded bg-accent-amber hover:bg-accent-amber/80 text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Shuffle size={14} /> AI Route Optimization
        </button>
      </div>

      {optimizedRouteMsg && (
        <div className="p-4 rounded border border-accent-amber/30 bg-accent-amber/5 text-xs text-accent-amber font-bold uppercase tracking-wider flex items-center gap-2">
          <Zap size={16} className="text-accent-amber animate-bounce" /> {optimizedRouteMsg}
        </div>
      )}

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Bangladesh Map Column */}
        <div className="lg:col-span-2 p-4 rounded border border-white/10 bg-white/5 relative flex flex-col min-h-[550px] overflow-hidden">
          
          {/* Header Map Controls Bar */}
          <div className="flex items-center justify-between mb-4 z-10 bg-brand-black/50 p-2 rounded border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
              <Activity size={12} className="text-accent-emerald animate-ping" /> Real-time GPS stream
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10">
              <button
                onClick={() => setMapViewMode('interactive')}
                className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapViewMode === 'interactive' ? 'bg-accent-blue text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Interactive Map
              </button>
              <button
                onClick={() => setMapViewMode('abstract')}
                className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapViewMode === 'abstract' ? 'bg-accent-blue text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Abstract Vector
              </button>
            </div>
          </div>

          {/* Interactive MapLibre GL Canvas */}
          {mapViewMode === 'interactive' ? (
            <div className="w-full flex-1 relative min-h-[450px]">
              <div ref={mapContainerRef} className="absolute inset-0 rounded border border-white/5 bg-brand-black/20" />
              
              {/* Map Legend Panel Overlay */}
              <div className="absolute bottom-4 left-4 z-10 bg-brand-black/90 p-3 rounded border border-white/10 backdrop-blur-sm max-w-[200px] text-[10px] font-mono space-y-2 shadow-2xl">
                <div className="font-black text-white uppercase tracking-widest text-[9px] border-b border-white/10 pb-1 mb-1.5">Map Legend</div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-accent-emerald inline-block"></span>
                  <span className="text-gray-300 font-bold uppercase text-[9px]">In Transit (Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-accent-amber inline-block"></span>
                  <span className="text-gray-300 font-bold uppercase text-[9px]">Idle / Loading</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-accent-rose inline-block"></span>
                  <span className="text-gray-300 font-bold uppercase text-[9px]">Maintenance</span>
                </div>
                <div className="flex items-center gap-2 border-t border-white/5 pt-1.5">
                  <span className="w-4 h-0.5 border-t border-dashed border-[#3b82f6] inline-block"></span>
                  <span className="text-gray-300 font-bold uppercase text-[9px]">Active SCM Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 border-t border-dashed border-[#f43f5e] inline-block"></span>
                  <span className="text-gray-300 font-bold uppercase text-[9px]">Traffic Congestion</span>
                </div>
              </div>
            </div>
          ) : (
            /* Abstract SVG Map of Bangladesh */
            <div className="w-full flex-1 flex items-center justify-center min-h-[450px]">
              <svg className="w-full max-w-[420px] h-[480px] drop-shadow-2xl" viewBox="0 0 500 600">
                {/* Outline Map - Simplified vector outline */}
                <path
                  d="M 180,50 L 230,60 L 260,110 L 320,120 L 350,150 L 380,180 L 340,240 L 390,300 L 450,330 L 430,380 L 380,410 L 310,480 L 260,520 L 210,550 L 160,520 L 120,480 L 100,420 L 130,340 L 110,290 L 140,210 L 120,140 Z"
                  fill="rgba(18, 18, 20, 0.75)"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Divisional boundaries or rivers - stylistic lines */}
                <path
                  d="M 230,60 Q 240,180 230,340 M 140,210 L 280,240 M 230,340 L 340,480"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Premapped Hub Points */}
                {MAP_HUBS.map((hub, idx) => {
                  const { x, y } = getMapCoords(hub.lat, hub.lng);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="10" fill={hub.color} opacity="0.15" className="animate-ping" />
                      <circle cx={x} cy={y} r="5" fill={hub.color} stroke="#fff" strokeWidth="1" />
                      <text x={x + 8} y={y + 4} fill="#9ca3af" fontSize="10" fontFamily="monospace" fontWeight="600">
                        {hub.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* active route paths */}
                {vehicles.filter(v => v.status === 'in_transit').map(v => {
                  const points = v.routeCoordinates.map(pt => {
                    const { x, y } = getMapCoords(pt[0], pt[1]);
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polyline
                      key={`line-${v.id}`}
                      points={points}
                      fill="none"
                      stroke={v.id === selectedVehicleId ? '#3b82f6' : 'rgba(255,255,255,0.15)'}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="transition-all"
                    />
                  );
                })}

                {/* Active Moving Vehicles */}
                {vehicles.map(veh => {
                  const { x, y } = getAnimatedPos(veh);
                  const isSelected = veh.id === selectedVehicleId;

                  return (
                    <g
                      key={veh.id}
                      onClick={() => setSelectedVehicleId(veh.id)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '8' : '5'}
                        fill={veh.status === 'in_transit' ? '#10b981' : veh.status === 'maintenance' ? '#f43f5e' : '#f59e0b'}
                        stroke="#fff"
                        strokeWidth={isSelected ? '2' : '1'}
                        className="transition-all duration-1000"
                      />
                      <text x={x - 10} y={y - 12} fill="#fff" fontSize="8" fontFamily="sans-serif" className="hidden group-hover:block bg-brand-black px-1 rounded">
                        {veh.plateNumber.split('-')[3] || veh.plateNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Selected Vehicle Telemetry */}
        <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Active Truck Telemetry</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">Real-time GPS sensor diagnostics</p>
            </div>

            <div className="p-4 rounded border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">{selectedVehicle.plateNumber}</h4>
                  <p className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider mt-0.5">{selectedVehicle.type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                  selectedVehicle.status === 'in_transit' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-accent-amber/20 text-accent-amber'
                }`}>
                  {selectedVehicle.status.replace('_', ' ')}
                </span>
              </div>

              {/* Dynamic stats */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Driver In-Charge</span>
                  <strong className="text-white mt-1 block uppercase text-[11px]">{selectedVehicle.driverName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">ETA Destination</span>
                  <span className="text-accent-cyan font-bold block mt-1 uppercase text-[11px]">{selectedVehicle.estArrival}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Current Speed</span>
                  <span className="text-white font-bold block mt-1 text-[11px]">{selectedVehicle.currentSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Fuel Level</span>
                  <span className="text-white font-bold block mt-1 text-[11px]">{selectedVehicle.fuelLevelPercent}%</span>
                </div>
                {selectedVehicle.tempCelsius !== undefined && (
                  <div>
                    <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Reefer Temp</span>
                    <span className={`font-bold block mt-1 text-[11px] ${
                      selectedVehicle.tempCelsius > 8 ? 'text-accent-rose animate-pulse' : 'text-accent-emerald'
                    }`}>{selectedVehicle.tempCelsius}°C</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Freight Cost</span>
                  <span className="text-white font-bold block mt-1 text-[11px]">৳{selectedVehicle.costPerKm}/km</span>
                </div>
              </div>
            </div>

            {/* Sensor health gauges */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Engine Sensor Health:</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 uppercase text-gray-300">
                    <span>Compressor Compression</span>
                    <span>{selectedVehicle.engineHealth}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
                    <div className="bg-accent-emerald h-full" style={{ width: `${selectedVehicle.engineHealth}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 uppercase text-gray-300">
                    <span>Active Fuel burn rate</span>
                    <span>{selectedVehicle.fuelConsumptionRate} L/100km</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
                    <div className="bg-accent-cyan h-full" style={{ width: `${(selectedVehicle.fuelConsumptionRate/35)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[9px] text-gray-500 font-mono text-center flex items-center justify-center gap-1 uppercase tracking-wider">
            <Maximize2 size={10} strokeWidth={3} /> Double click to expand GIS telemetry full-screen
          </div>
        </div>
      </div>
    </div>
  );
}
