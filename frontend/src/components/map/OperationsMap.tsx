import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Hazard, RouteDetail, HazardIntersectionInfo } from '../../types';

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
  showExtrusion3D = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dark cartographic basemap style (CARTO Dark Matter tiles via Free Open Spec)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [78.1198, 9.9252], // Madurai Center
      zoom: 12.8,
      pitch: 45,
      bearing: -8,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // 1. Hazards GeoJSON Source
      map.addSource('hazards-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Hazard Fill Layer
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
          'fill-opacity': [
            'match',
            ['get', 'status'],
            'RESOLVED', 0.25,
            0.42
          ]
        }
      });

      // Hazard 3D Extrusion Layer
      map.addLayer({
        id: 'hazards-extrusion',
        type: 'fill-extrusion',
        source: 'hazards-source',
        layout: {
          visibility: showExtrusion3D ? 'visible' : 'none'
        },
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
              '#3B82F6'
            ]
          ],
          'fill-extrusion-height': [
            '*',
            ['coalesce', ['get', 'water_depth_cm'], 10],
            2.5 // scale factor for visual clarity
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.75
        }
      });

      // Hazard Outline
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
          'line-width': 2.5
        }
      });

      // Click event on hazard polygons
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

      // 2. Standard Route (Red Dashed)
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
          'line-width': 4,
          'line-dasharray': [2, 2],
          'line-opacity': 0.85
        }
      });

      // 3. Safe Corridor Route (Green Solid)
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
          'line-width': 5,
          'line-opacity': 0.95
        }
      });

      // 4. Intersections Points
      map.addSource('intersections-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'intersections-pulse',
        type: 'circle',
        source: 'intersections-source',
        paint: {
          'circle-radius': 9,
          'circle-color': '#EF4444',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9
        }
      });

      // 5. Waypoints (Origin/Dest)
      map.addSource('waypoints-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'waypoints-layer',
        type: 'circle',
        source: 'waypoints-source',
        paint: {
          'circle-radius': 7,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // 6. Municipal Vehicle Position
      map.addSource('vehicle-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'vehicle-layer',
        type: 'circle',
        source: 'vehicle-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#06B6D4',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF'
        }
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Hazard Geometries
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
        water_depth_cm: h.water_depth_cm ?? 0,
      },
      geometry: h.geometry
    }));

    source.setData({
      type: 'FeatureCollection',
      features
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

    // Standard Route
    const stdSource = mapRef.current.getSource('standard-route-source') as maplibregl.GeoJSONSource;
    if (stdSource) {
      if (standardRoute && standardRoute.geometry.length > 0) {
        stdSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: standardRoute.geometry
              }
            }
          ]
        });
      } else {
        stdSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    // Safe Corridor Route
    const safeSource = mapRef.current.getSource('safe-route-source') as maplibregl.GeoJSONSource;
    if (safeSource) {
      if (safeRoute && safeRoute.geometry.length > 0) {
        safeSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: safeRoute.geometry
              }
            }
          ]
        });
      } else {
        safeSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    // Intersections Markers
    const intSource = mapRef.current.getSource('intersections-source') as maplibregl.GeoJSONSource;
    if (intSource) {
      if (standardRoute && standardRoute.hazard_intersections.length > 0) {
        const intFeatures = standardRoute.hazard_intersections.map(i => ({
          type: 'Feature' as const,
          properties: {
            hazard_id: i.hazard_id,
            location_name: i.location_name
          },
          geometry: {
            type: 'Point' as const,
            coordinates: i.intersection_point
          }
        }));
        intSource.setData({ type: 'FeatureCollection', features: intFeatures });
      } else {
        intSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [standardRoute, safeRoute, mapLoaded]);

  // Update Waypoints (Origin & Destination)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('waypoints-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = [];
    if (originCoords) {
      features.push({
        type: 'Feature' as const,
        properties: { color: '#3B82F6', label: 'Origin' },
        geometry: { type: 'Point' as const, coordinates: originCoords }
      });
    }
    if (destCoords) {
      features.push({
        type: 'Feature' as const,
        properties: { color: '#10B981', label: 'Destination' },
        geometry: { type: 'Point' as const, coordinates: destCoords }
      });
    }

    source.setData({ type: 'FeatureCollection', features });
  }, [originCoords, destCoords, mapLoaded]);

  // Update Municipal Vehicle Marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('vehicle-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    if (vehiclePosition) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { label: 'Simulated Municipal Truck' },
            geometry: {
              type: 'Point',
              coordinates: vehiclePosition
            }
          }
        ]
      });
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [vehiclePosition, mapLoaded]);

  // Pan to selected hazard
  useEffect(() => {
    if (!mapRef.current || !selectedHazard) return;
    mapRef.current.flyTo({
      center: [selectedHazard.longitude, selectedHazard.latitude],
      zoom: 14.5,
      essential: true,
      duration: 1000
    });
  }, [selectedHazard]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
