import React, { useState, useMemo } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';

import topoData from '../data/states-10m.json';
import airportData from '../data/airport-coords.json';
import routesData from '../data/routes.json';

interface RouteRecord {
  city1: string;
  city2: string;
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  year: number;
  quarter: number;
  fare: number;
  passengers: number;
}

const EXCLUDED_FIPS = new Set(['02']);

const simplified = simplify(presimplify(topoData as any), 0.08);

const filteredTopo = {
  ...simplified,
  objects: {
    ...simplified.objects,
    states: {
      ...(simplified as any).objects.states,
      geometries: (simplified as any).objects.states.geometries.filter(
        (g: any) => !EXCLUDED_FIPS.has(g.id),
      ),
    },
  },
};

const topoFeatures = feature(filteredTopo as any, filteredTopo.objects.states);
const outerBoundary = mesh(filteredTopo as any, filteredTopo.objects.states, (a, b) => a === b);

interface USMapProps {
  selectedYears: Set<number>;
  selectedQuarters: Map<number, Set<number>>;
}

const USMap: React.FC<USMapProps> = ({ selectedYears, selectedQuarters }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const geoData = topoFeatures as any;

  const width = 960;
  const height = 600;

  const { projection, pathGenerator } = useMemo(() => {
    const proj = geoAlbersUsa().scale(1200).translate([width / 2, height / 2]);
    const pg = geoPath().projection(proj);
    return { projection: proj, pathGenerator: pg };
  }, []);

  const airportDots = useMemo(() => {
    return airportData
      .map((ap) => {
        const projected = projection([ap.lon, ap.lat]);
        if (!projected) return null;
        return { city: ap.city, x: projected[0], y: projected[1] };
      })
      .filter(Boolean) as { city: string; x: number; y: number }[];
  }, [projection]);

  const filteredRoutes = useMemo(() => {
    let data = routesData as RouteRecord[];
    const hasSelection = selectedYears.size > 0;

    if (hasSelection) {
      data = data.filter((r) => {
        if (!selectedYears.has(r.year)) return false;
        const qs = selectedQuarters.get(r.year);
        if (qs && qs.size > 0) return qs.has(r.quarter);
        return true;
      });
    }

    const grouped = new Map<string, { city1: string; city2: string; passengers: number }>();
    for (const r of data) {
      const key = `${r.city1}-${r.city2}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.passengers += r.passengers;
      } else {
        grouped.set(key, { city1: r.city1, city2: r.city2, passengers: r.passengers });
      }
    }
    return Array.from(grouped.values());
  }, [selectedYears, selectedQuarters]);

  const flightArcs = useMemo(() => {
    const cityPos = new Map<string, [number, number]>();
    for (const ap of airportData) {
      const p = projection([ap.lon, ap.lat]);
      if (p) cityPos.set(ap.city, [p[0], p[1]]);
    }

    return filteredRoutes
      .map((r) => {
        const s = cityPos.get(r.city1);
        const e = cityPos.get(r.city2);
        if (!s || !e) return null;

        const dx = e[0] - s[0];
        const dy = e[1] - s[1];

        const midX = (s[0] + e[0]) / 2 - dy * 0.15;
        const midY = (s[1] + e[1]) / 2 + dx * 0.15;

        return {
          key: `${r.city1}-${r.city2}`,
          city1: r.city1,
          city2: r.city2,
          d: `M${s[0]},${s[1]} Q${midX},${midY} ${e[0]},${e[1]}`,
          passengers: r.passengers,
        };
      })
      .filter(Boolean) as { key: string; city1: string; city2: string; d: string; passengers: number }[];
  }, [projection, filteredRoutes]);

  const maxPax = useMemo(
    () => Math.max(...flightArcs.map((a) => a.passengers)),
    [flightArcs],
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxHeight: '70vh' }}
    >
      <rect width={width} height={height} fill="#0a0f1a" />
      {geoData.features.map((feat: any) => {
        const path = pathGenerator(feat) || '';
        const id = feat.id || feat.properties.name;
        return (
          <path
            key={id}
            d={path}
            fill="#0a0f1a"
            stroke="none"
            pointerEvents="none"
          />
        );
      })}
      <path
        d={pathGenerator(outerBoundary as any) || ''}
        fill="none"
        stroke="rgba(148, 163, 184, 0.5)"
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
        pointerEvents="none"
      />
      <g>
        {flightArcs.map((arc) => {
          const connected = !selectedCity || arc.city1 === selectedCity || arc.city2 === selectedCity;
          if (!connected) return null;
          const t = arc.passengers / maxPax;
          const intensity = Math.pow(t, 0.35);
          return (
            <path
              key={arc.key}
              d={arc.d}
              fill="none"
              stroke={selectedCity ? '#60a5fa' : '#3b82f6'}
              strokeWidth={selectedCity ? 0.5 + intensity * 3.5 : 0.2 + intensity * 4}
              opacity={selectedCity ? 0.15 + intensity * 0.7 : 0.02 + intensity * 0.45}
              strokeLinecap="round"
              pointerEvents="none"
            />
          );
        })}
      </g>
      {airportDots.map((dot) => {
        const isSelected = selectedCity === dot.city;
        const isConnected = selectedCity
          ? flightArcs.some(
              (a) =>
                (a.city1 === selectedCity || a.city2 === selectedCity) &&
                (a.city1 === dot.city || a.city2 === dot.city),
            )
          : false;
        const dimmed = selectedCity && !isSelected && !isConnected;
        return (
          <circle
            key={dot.city}
            cx={dot.x}
            cy={dot.y}
            r={isSelected ? 5 : 2.5}
            fill={isSelected ? '#facc15' : '#ef4444'}
            opacity={dimmed ? 0.15 : 0.85}
            style={{ cursor: 'pointer', transition: 'r 0.2s, opacity 0.2s' }}
            onClick={() => setSelectedCity(selectedCity === dot.city ? null : dot.city)}
          />
        );
      })}
    </svg>
  );
};

export default USMap;
