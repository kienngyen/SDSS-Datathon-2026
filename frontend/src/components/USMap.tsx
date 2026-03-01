import React, { useState, useMemo, useEffect } from 'react';
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
  nsmiles: number;
  carrier_lg: string;
  large_ms: number;
  fare_lg: number;
  carrier_low: string;
  lf_ms: number;
  fare_low: number;
  totalFaredPax_city1: number;
  totalPerLFMkts_city1: number;
  totalPerPrem_city1: number;
  totalFaredPax_city2: number;
  totalPerLFMkts_city2: number;
  totalPerPrem_city2: number;
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
const outerBoundary = mesh(filteredTopo as any, filteredTopo.objects.states, (a: any, b: any) => a === b);

interface USMapProps {
  selectedYears: Set<number>;
  selectedQuarters: Map<number, Set<number>>;
  displayYear: number;
  displayQuarter: number;
  visibleFares: { cheap: boolean; mid: boolean; expensive: boolean };
  onToggleFare: (key: 'cheap' | 'mid' | 'expensive') => void;
}

const USMap: React.FC<USMapProps> = ({ selectedYears, selectedQuarters, displayYear, displayQuarter, visibleFares, onToggleFare }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<{ city1: string; city2: string } | null>(null);
  const [showingRoute, setShowingRoute] = useState(false);
  const [tooltip, setTooltip] = useState<{ city: string; x: number; y: number } | null>(null);
  const [contentOpacity, setContentOpacity] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapWrapperRef = React.useRef<HTMLDivElement>(null);
  const geoData = topoFeatures as any;

  const [displayedCity, setDisplayedCity] = useState<string | null>(null);

  const [displayedShowingRoute, setDisplayedShowingRoute] = useState(false);

  useEffect(() => {
    if (!selectedCity) {
      const t = setTimeout(() => {
        setDisplayedCity(null);
        setShowingRoute(false);
        setDisplayedShowingRoute(false);
      }, 800);
      setContentOpacity(1);
      return () => clearTimeout(t);
    }
    if (selectedCity !== displayedCity) {
      setContentOpacity(0);
      const t = setTimeout(() => {
        setDisplayedCity(selectedCity);
        setContentOpacity(1);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [selectedCity, displayedCity]);

  useEffect(() => {
    if (showingRoute !== displayedShowingRoute) {
      setContentOpacity(0);
      const t = setTimeout(() => {
        setDisplayedShowingRoute(showingRoute);
        setContentOpacity(1);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [showingRoute, displayedShowingRoute]);

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

    const grouped = new Map<string, { city1: string; city2: string; passengers: number; fareSum: number }>();
    for (const r of data) {
      const key = `${r.city1}-${r.city2}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.passengers += r.passengers;
        existing.fareSum += r.fare * r.passengers;
      } else {
        grouped.set(key, { city1: r.city1, city2: r.city2, passengers: r.passengers, fareSum: r.fare * r.passengers });
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

        const avgFare = r.passengers > 0 ? r.fareSum / r.passengers : 0;
        return {
          key: `${r.city1}-${r.city2}`,
          city1: r.city1,
          city2: r.city2,
          d: `M${s[0]},${s[1]} Q${midX},${midY} ${e[0]},${e[1]}`,
          passengers: r.passengers,
          fare: avgFare,
        };
      })
      .filter(Boolean) as { key: string; city1: string; city2: string; d: string; passengers: number; fare: number }[];
  }, [projection, filteredRoutes]);

  const maxPax = useMemo(
    () => Math.max(...flightArcs.map((a) => a.passengers)),
    [flightArcs],
  );

  const cityPopularity = useMemo(() => {
    const pop = new Map<string, number>();
    for (const r of filteredRoutes) {
      pop.set(r.city1, (pop.get(r.city1) || 0) + r.passengers);
      pop.set(r.city2, (pop.get(r.city2) || 0) + r.passengers);
    }
    return pop;
  }, [filteredRoutes]);

  const maxCityPax = useMemo(
    () => Math.max(1, ...cityPopularity.values()),
    [cityPopularity],
  );

  const cityStats = useMemo(() => {
    const city = displayedCity;
    if (!city) return null;
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

    const connected = data.filter(
      (r) => r.city1 === city || r.city2 === city,
    );
    const destinations = new Set<string>();
    let totalPax = 0;
    let totalFaredPax = 0;
    let totalPerLFMkts = 0;
    let totalPerPrem = 0;
    let count = 0;

    for (const r of connected) {
      const isCity1 = r.city1 === city;
      destinations.add(isCity1 ? r.city2 : r.city1);
      totalPax += r.passengers;
      totalFaredPax += isCity1 ? r.totalFaredPax_city1 : r.totalFaredPax_city2;
      totalPerLFMkts += isCity1 ? r.totalPerLFMkts_city1 : r.totalPerLFMkts_city2;
      totalPerPrem += isCity1 ? r.totalPerPrem_city1 : r.totalPerPrem_city2;
      count++;
    }

    return {
      connections: destinations.size,
      totalPassengers: totalPax,
      avgFaredPax: count > 0 ? totalFaredPax / count : 0,
      avgPerLFMkts: count > 0 ? totalPerLFMkts / count : 0,
      avgPerPrem: count > 0 ? totalPerPrem / count : 0,
    };
  }, [displayedCity, selectedYears, selectedQuarters]);

  const routeDetails = useMemo(() => {
    if (!selectedRoute) return null;
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
    return data.find(
      (r) =>
        (r.city1 === selectedRoute.city1 && r.city2 === selectedRoute.city2) ||
        (r.city1 === selectedRoute.city2 && r.city2 === selectedRoute.city1),
    ) || null;
  }, [selectedRoute, selectedYears, selectedQuarters]);

  const lastRouteRef = React.useRef<RouteRecord | null>(null);
  if (routeDetails) lastRouteRef.current = routeDetails;
  const displayRoute = routeDetails || lastRouteRef.current;

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'visible' }}>
      {/* Map wrapper — slides left without shrinking, above the panel */}
      <div
        ref={mapWrapperRef}
        style={{
          position: 'relative',
          zIndex: 2,
          transform: selectedCity ? 'translateX(-140px)' : 'translateX(0)',
          transition: 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -120%)',
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#e2e8f0',
              fontSize: '12px',
              fontWeight: 500,
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              transition: 'opacity 0.15s ease',
              zIndex: 10,
            }}
          >
            {tooltip.city}
          </div>
        )}
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
              const fareTier = arc.fare < 200 ? 'cheap' : arc.fare < 400 ? 'mid' : 'expensive';
              if (!visibleFares[fareTier]) return null;
              const t = arc.passengers / maxPax;
              const intensity = Math.pow(t, 0.5);
              const fareColor = fareTier === 'cheap' ? '#4ade80' : fareTier === 'mid' ? '#facc15' : '#ef4444';
              return (
                <path
                  key={arc.key}
                  d={arc.d}
                  fill="none"
                  stroke={fareColor}
                  strokeWidth={selectedCity ? 0.3 + intensity * 5 : 0.15 + intensity * 6}
                  opacity={selectedCity ? 0.15 + intensity * 0.75 : 0.02 + intensity * 0.5}
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
            const pax = cityPopularity.get(dot.city) || 0;
            const t = Math.pow(pax / maxCityPax, 0.4);
            const baseR = 2 + t * 4;
            return (
              <circle
                key={dot.city}
                cx={dot.x}
                cy={dot.y}
                r={isSelected ? baseR + 2 : baseR}
                fill={isSelected ? '#facc15' : '#ef4444'}
                opacity={dimmed ? 0.15 : 0.85}
                style={{ cursor: 'pointer', transition: 'r 0.2s, opacity 0.2s' }}
                onClick={() => {
                  if (selectedCity && selectedCity !== dot.city && isConnected) {
                    setSelectedRoute({ city1: selectedCity, city2: dot.city });
                    setShowingRoute(true);
                  } else if (selectedCity === dot.city) {
                    if (showingRoute) {
                      setSelectedRoute(null);
                      setShowingRoute(false);
                    } else {
                      setSelectedCity(null);
                      setSelectedRoute(null);
                    }
                  } else {
                    setSelectedCity(dot.city);
                    setSelectedRoute(null);
                    setShowingRoute(false);
                  }
                }}
                onMouseEnter={(e) => {
                  const rect = mapWrapperRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({ city: dot.city, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseMove={(e) => {
                  const rect = mapWrapperRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({ city: dot.city, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Fare toggles — bottom left, circles aligned with Q1 below */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginTop: '8px',
          paddingLeft: '22px',
        }}
      >
        {([
          { key: 'cheap' as const, color: '#4ade80', label: 'Under $200' },
          { key: 'mid' as const, color: '#facc15', label: '$200–$399' },
          { key: 'expensive' as const, color: '#ef4444', label: '$400+' },
        ]).map((item) => (
          <div
            key={item.key}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => onToggleFare(item.key)}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: visibleFares[item.key] ? item.color : 'transparent',
                border: `2px solid ${item.color}`,
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: '11px',
              color: visibleFares[item.key] ? '#cbd5e1' : '#475569',
              transition: 'color 0.2s',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Info panel — always mounted, slides from behind the map */}
      <div
        style={{
          position: 'absolute',
          right: '0',
          top: '50%',
          width: displayedShowingRoute ? '340px' : '260px',
          zIndex: 1,
          transform: selectedCity
            ? 'translateY(-50%) translateX(calc(100% - 100px))'
            : 'translateY(-50%) translateX(0)',
          opacity: selectedCity ? 1 : 0,
          pointerEvents: selectedCity ? 'auto' : 'none',
          transition: selectedCity
            ? 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.3s'
            : 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {displayedCity && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(12px)',
              color: '#e2e8f0',
              opacity: contentOpacity,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Q{displayQuarter} {displayYear}
              </span>
              <button
                onClick={() => { setSelectedCity(null); setSelectedRoute(null); }}
                style={{
                  background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                  fontSize: '18px', lineHeight: 1, padding: '2px 6px',
                }}
              >
                &times;
              </button>
            </div>

            {displayedShowingRoute && displayRoute ? (
              <>
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0', lineHeight: 1.3 }}>
                  {displayRoute.city1}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M10 4 L10 16 M6 12 L10 16 L14 12" />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 500 }}>{displayRoute.nsmiles.toLocaleString()} miles</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 14px 0', lineHeight: 1.3 }}>
                  {displayRoute.city2}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <StatRow label="Passengers" value={displayRoute.passengers.toLocaleString()} />
                  <StatRow label="Avg Fare" value={`$${displayRoute.fare.toFixed(2)}`} />
                </div>
                <div style={{ height: '1px', background: 'rgba(148,163,184,0.15)', margin: '14px 0' }} />
                <div style={{ display: 'flex', gap: '0' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '16px' }}>
                    <StatRow label="Largest Carrier" value={displayRoute.carrier_lg} />
                    <StatRow label="Largest MS" value={`${(displayRoute.large_ms * 100).toFixed(1)}%`} />
                    <StatRow label="Largest Fare" value={`$${displayRoute.fare_lg.toFixed(2)}`} />
                  </div>
                  <div style={{ width: '1px', background: 'rgba(148,163,184,0.15)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '16px' }}>
                    <StatRow label="Low-Fare Carrier" value={displayRoute.carrier_low} />
                    <StatRow label="Low-Fare MS" value={`${(displayRoute.lf_ms * 100).toFixed(1)}%`} />
                    <StatRow label="Low-Fare Price" value={`$${displayRoute.fare_low.toFixed(2)}`} />
                  </div>
                </div>
              </>
            ) : cityStats ? (
              <>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.3 }}>
                  {displayedCity}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <StatRow label="Flight Connections" value={cityStats.connections.toLocaleString()} />
                  <StatRow label="Total Passengers" value={cityStats.totalPassengers.toLocaleString()} />
                  <StatRow label="Total Fared Pax" value={Math.round(cityStats.avgFaredPax).toLocaleString()} />
                  <StatRow label="% Low-Fare Markets" value={`${(cityStats.avgPerLFMkts * 100).toFixed(1)}%`} />
                  <StatRow label="% Premium" value={`${(cityStats.avgPerPrem * 100).toFixed(1)}%`} />
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>
      {value}
    </div>
  </div>
);

export default USMap;
