import React, { useMemo } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';

import topoData from '../data/states-10m.json';
import airportData from '../data/airport-coords.json';

const EXCLUDED_FIPS = new Set(['02']); // Alaska

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

export interface USMapProps {
  onLocationClick: (coords: [number, number]) => void;
  flight?: { start: [number, number]; end: [number, number] };
}

const USMap: React.FC<USMapProps> = ({ flight }) => {
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

  let flightOverlay: JSX.Element | null = null;
  if (flight) {
    const s = projection(flight.start) || [0, 0];
    const e = projection(flight.end) || [0, 0];
    const midX = (s[0] + e[0]) / 2;
    const midY = Math.min(s[1], e[1]) - 60;
    flightOverlay = (
      <g>
        <path
          d={`M${s[0]},${s[1]} Q${midX},${midY} ${e[0]},${e[1]}`}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.9}
        />
        <circle cx={s[0]} cy={s[1]} r={5} fill="#3b82f6" stroke="#0f172a" strokeWidth={1.5} />
        <circle cx={e[0]} cy={e[1]} r={5} fill="#3b82f6" stroke="#0f172a" strokeWidth={1.5} />
      </g>
    );
  }

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
      {airportDots.map((dot) => (
        <circle
          key={dot.city}
          cx={dot.x}
          cy={dot.y}
          r={2.5}
          fill="#ef4444"
          opacity={0.85}
        />
      ))}
      {flightOverlay}
    </svg>
  );
};

export default USMap;
