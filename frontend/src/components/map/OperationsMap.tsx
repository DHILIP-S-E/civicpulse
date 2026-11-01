import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Hazard, RouteDetail } from '../../types';

// Import 3D Buildings
import buildingsGeoJSON from '../../../../data/demo/madurai_3d_buildings.json';

interface OperationsMapProps {
  hazards: Hazard[];
  selectedHazard: Hazard | null;
  onSelectHazard: (hazard: Hazard) => void;
  standardRoute: RouteDetail | null;
  safeRoute: RouteDetail | null;
  vehiclePosition: [number, number] | null;
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  showExtrusion3D?: boolean;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard,
  standardRoute,
  safeRoute,
  vehiclePosition,
  originCoords,
  destCoords,
  showExtrusion3D = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [cameraMode, setCameraMode] = useState<'3d' | '2d'>('3d');
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitInterval = useRef<any>(null);
  const floatingMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'esri-dark-base': {
            type: 'raster',
            tiles: [
              'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, HERE, Garmin, OpenStreetMap contributors'
          },
          'esri-dark-reference': {
            type: 'raster',
            tiles: [
              'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri'
          }
        },
        layers: [
          {
            id: 'esri-dark-base-layer',
            type: 'raster',
            source: 'esri-dark-base',
            minzoom: 0,
            maxzoom: 19
          },
          {
            id: 'esri-dark-reference-layer',
            type: 'raster',
            source: 'esri-dark-reference',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [78.125, 9.932],
      zoom: 13.5,
      pitch: 60,
      bearing: -20,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // 1. 3D Urban Buildings Layer
      map.addSource('3d-buildings-source', {
        type: 'geojson',
        data: buildingsGeoJSON as any
      });

      map.addLayer({
        id: '3d-buildings-extrusion',
        type: 'fill-extrusion',
        source: '3d-buildings-source',
        paint: {
          'fill-extrusion-color': [
            'coalesce',
            ['get', 'color'],
            '#cbd5e1'
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.88
        }
      });

      // 2. 3D Volumetric Water Inundation Layer
      map.addSource('hazards-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // 3D Volumetric Water Prisms
      map.addLayer({
        id: 'hazards-extrusion',
        type: 'fill-extrusion',
        source: 'hazards-source',
        paint: {
          'fill-extrusion-color': [
            'match',
            ['get', 'status'],
            'RESOLVED', '#10B981',
            [
              'match',
              ['get', 'severity'],
              'CRITICAL', '#EF4444',
              'MODERATE', '#F59E0B',
              '#06B6D4'
            ]
          ],
          'fill-extrusion-height': [
            '*',
            ['coalesce', ['get', 'water_depth_cm'], 25],
            3.2
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.82
        }
      });

      // 2D Ground Footprint
      map.addLayer({
        id: 'hazards-fill',
        type: 'fill',
        source: 'hazards-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'RESOLVED', '#10B981',
            [
              'match',
              ['get', 'severity'],
              'CRITICAL', '#EF4444',
              'MODERATE', '#F59E0B',
              '#3B82F6'
            ]
          ],
          'fill-opacity': 0.35
        }
      });

      // Hazard Glowing Outline
      map.addLayer({
        id: 'hazards-outline',
        type: 'line',
        source: 'hazards-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'status'],
            'RESOLVED', '#34D399',
            [
              'match',
              ['get', 'severity'],
              'CRITICAL', '#F87171',
              'MODERATE', '#FBBF24',
              '#60A5FA'
            ]
          ],
          'line-width': 3
        }
      });

      // Click listener on hazards
      map.on('click', 'hazards-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties;
        if (props && props.hazard_id) {
          const matched = hazards.find(h => h.hazard_id === props.hazard_id);
          if (matched) {
            onSelectHazard(matched);
          }
        }
      });

      map.on('mouseenter', 'hazards-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hazards-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      // 3. Routes & Corridors
      map.addSource('standard-route-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'standard-route-line',
        type: 'line',
        source: 'standard-route-source',
        paint: {
          'line-color': '#EF4444',
          'line-width': 4.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.95
        }
      });

      map.addSource('safe-route-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'safe-route-line',
        type: 'line',
        source: 'safe-route-source',
        paint: {
          'line-color': '#10B981',
          'line-width': 6,
          'line-opacity': 0.95
        }
      });

      // Intersections Markers
      map.addSource('intersections-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'intersections-pulse',
        type: 'circle',
        source: 'intersections-source',
        paint: {
          'circle-radius': 11,
          'circle-color': '#EF4444',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95
        }
      });

      // Origin / Destination Waypoints
      map.addSource('waypoints-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'waypoints-layer',
        type: 'circle',
        source: 'waypoints-source',
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // Municipal Vehicle Marker
      map.addSource('vehicle-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'vehicle-layer',
        type: 'circle',
        source: 'vehicle-source',
        paint: {
          'circle-radius': 9,
          'circle-color': '#06B6D4',
          'circle-stroke-width': 3.5,
          'circle-stroke-color': '#FFFFFF'
        }
      });
    });

    mapRef.current = map;

    return () => {
      if (orbitInterval.current) clearInterval(orbitInterval.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Hazard Geometries & 3D Floating Badges
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('hazards-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = hazards.map(h => ({
      type: 'Feature' as const,
      properties: {
        hazard_id: h.hazard_id,
        location_name: h.location_name,
        severity: h.severity,
        status: h.status,
        hazard_type: h.hazard_type,
        water_depth_cm: h.water_depth_cm ?? 20,
      },
      geometry: h.geometry
    }));

    source.setData({
      type: 'FeatureCollection',
      features
    });

    // Update 3D Floating HTML Billboards
    floatingMarkersRef.current.forEach(m => m.remove());
    floatingMarkersRef.current = [];

    hazards.forEach(h => {
      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';
      const isResolved = h.status === 'RESOLVED';
      const colorBg = isResolved
        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
        : (h.severity === 'CRITICAL' ? 'bg-red-950/90 border-red-500 text-red-200' : 'bg-amber-950/90 border-amber-500 text-amber-200');

      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-md border text-xs font-semibold shadow-xl flex items-center space-x-1.5 backdrop-blur-md transform -translate-y-8 ${colorBg}">
          <span class="w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}"></span>
          <span>${h.location_name.split('/')[0].trim()}</span>
          <span class="opacity-80 font-normal">(${h.water_depth_cm ?? 0}cm)</span>
        </div>
        <div class="w-0.5 h-6 bg-blue-400/80 mx-auto -translate-y-8"></div>
      `;

      el.addEventListener('click', () => onSelectHazard(h));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([h.longitude, h.latitude])
        .addTo(mapRef.current!);

      floatingMarkersRef.current.push(marker);
    });
  }, [hazards, mapLoaded]);

  // Toggle 3D Extrusion
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const visibility = showExtrusion3D ? 'visible' : 'none';
    if (mapRef.current.getLayer('hazards-extrusion')) {
      mapRef.current.setLayoutProperty('hazards-extrusion', 'visibility', visibility);
    }
  }, [showExtrusion3D, mapLoaded]);

  // Update Routes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const stdSource = mapRef.current.getSource('standard-route-source') as maplibregl.GeoJSONSource;
    if (stdSource) {
      if (standardRoute && standardRoute.geometry.length > 0) {
        stdSource.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: standardRoute.geometry } }]
        });
      } else {
        stdSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    const safeSource = mapRef.current.getSource('safe-route-source') as maplibregl.GeoJSONSource;
    if (safeSource) {
      if (safeRoute && safeRoute.geometry.length > 0) {
        safeSource.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: safeRoute.geometry } }]
        });
      } else {
        safeSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    const intSource = mapRef.current.getSource('intersections-source') as maplibregl.GeoJSONSource;
    if (intSource) {
      if (standardRoute && standardRoute.hazard_intersections.length > 0) {
        const intFeatures = standardRoute.hazard_intersections.map(i => ({
          type: 'Feature' as const,
          properties: { hazard_id: i.hazard_id, location_name: i.location_name },
          geometry: { type: 'Point' as const, coordinates: i.intersection_point }
        }));
        intSource.setData({ type: 'FeatureCollection', features: intFeatures });
      } else {
        intSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [standardRoute, safeRoute, mapLoaded]);

  // Waypoints
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('waypoints-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = [];
    if (originCoords) {
      features.push({ type: 'Feature' as const, properties: { color: '#3B82F6', label: 'Origin' }, geometry: { type: 'Point' as const, coordinates: originCoords } });
    }
    if (destCoords) {
      features.push({ type: 'Feature' as const, properties: { color: '#10B981', label: 'Destination' }, geometry: { type: 'Point' as const, coordinates: destCoords } });
    }
    source.setData({ type: 'FeatureCollection', features });
  }, [originCoords, destCoords, mapLoaded]);

  // Vehicle
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('vehicle-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    if (vehiclePosition) {
      source.setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: vehiclePosition } }]
      });
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [vehiclePosition, mapLoaded]);

  // Fly to selected hazard
  useEffect(() => {
    if (!mapRef.current || !selectedHazard) return;
    mapRef.current.flyTo({
      center: [selectedHazard.longitude, selectedHazard.latitude],
      zoom: 15.2,
      pitch: 65,
      bearing: -35,
      essential: true,
      duration: 1200
    });
  }, [selectedHazard]);

  // Camera presets
  const setCamera3D = () => {
    if (!mapRef.current) return;
    setCameraMode('3d');
    mapRef.current.easeTo({ pitch: 62, zoom: 13.8, bearing: -25, duration: 1000 });
  };

  const setCamera2D = () => {
    if (!mapRef.current) return;
    setCameraMode('2d');
    mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
  };

  const toggleCinematicOrbit = () => {
    if (!mapRef.current) return;
    if (isOrbiting) {
      if (orbitInterval.current) clearInterval(orbitInterval.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      mapRef.current.easeTo({ pitch: 65, zoom: 14.2, duration: 800 });
      orbitInterval.current = setInterval(() => {
        if (!mapRef.current) return;
        mapRef.current.setBearing((mapRef.current.getBearing() + 1.2) % 360);
      }, 50);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Camera Mode & Orbit Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white border border-[#E2E8F0] p-1 rounded-lg flex items-center space-x-1 text-xs select-none shadow-sm">
        <button
          onClick={setCamera3D}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            cameraMode === '3d'
              ? 'bg-[#1677FF] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
          }`}
        >
          3D Perspective
        </button>
        <button
          onClick={setCamera2D}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            cameraMode === '2d'
              ? 'bg-[#1677FF] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
          }`}
        >
          2D Topographic
        </button>
        <button
          onClick={toggleCinematicOrbit}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            isOrbiting
              ? 'bg-[#D97706] text-white'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
          }`}
        >
          {isOrbiting ? 'Stop Orbit' : 'Rotate Orbit'}
        </button>
      </div>
    </div>
  );
};
