import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import routesRaw from '../data/routes.json'
import carriersRaw from '../data/carriers.json'

interface RouteRecord {
  city1: string
  city2: string
  year: number
  quarter: number
  fare: number
  passengers: number
  nsmiles: number
  carrier_lg: string
  large_ms: number
  fare_lg: number
  carrier_low: string
  lf_ms: number
  fare_low: number
}

interface CarrierInfo {
  name: string
  color: string
  textColor: string
  logoUrl?: string
}

const routes = routesRaw as RouteRecord[]
const carriers = carriersRaw as Record<string, CarrierInfo>

const PERIODS = [
  { year: 2022, quarter: 1 }, { year: 2022, quarter: 2 }, { year: 2022, quarter: 3 }, { year: 2022, quarter: 4 },
  { year: 2023, quarter: 1 }, { year: 2023, quarter: 2 }, { year: 2023, quarter: 3 }, { year: 2023, quarter: 4 },
  { year: 2024, quarter: 1 }, { year: 2024, quarter: 2 }, { year: 2024, quarter: 3 }, { year: 2024, quarter: 4 },
  { year: 2025, quarter: 1 }, { year: 2025, quarter: 2 },
]

function shortCity(city: string): string {
  return city.replace(' (Metropolitan Area)', '').split(',')[0]
}

function displayCity(city: string): string {
  return city.replace(' (Metropolitan Area)', '')
}

function fareColor(fare: number): string {
  if (fare >= 400) return '#EB544A'
  if (fare >= 200) return '#F9D131'
  return '#32E794'
}

// Market share color: red (low) → yellow (mid) → green (high)
function msColor(ms: number): string {
  if (ms >= 0.66) return '#32E794'
  if (ms >= 0.33) return '#F9D131'
  return '#EB544A'
}

// ── Carrier badge ────────────────────────────────────────────────────────────
function CarrierBadge({ code }: { code: string }) {
  const info = carriers[code] ?? { color: '#334155', textColor: '#ffffff' }
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '52px',
      height: '52px',
      borderRadius: '10px',
      backgroundColor: info.color,
      color: info.textColor,
      fontWeight: 800,
      fontSize: '13px',
      letterSpacing: '0.05em',
      flexShrink: 0,
    }}>
      {code}
    </div>
  )
}

// ── Carrier column inside modal ───────────────────────────────────────────────
function CarrierColumn({ code, fare, ms, label }: { code: string; fare: number; ms: number; label: string }) {
  const info = carriers[code] ?? { name: code, color: '#334155', textColor: '#ffffff' }
  return (
    <div style={{
      flex: 1,
      background: 'rgba(30,41,59,0.85)',
      borderRadius: '10px',
      padding: '14px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid rgba(148,163,184,0.1)',
    }}>
      <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
      {/* Badge + logo side by side, centered */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <CarrierBadge code={code} />
        {info.logoUrl && (
          <img
            src={info.logoUrl}
            alt={info.name}
            style={{ height: '44px', width: '60px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', padding: '4px' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
        carrier_low: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{code}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 500, textAlign: 'center' }}>{info.name}</div>
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>avg fare</div>
      <div style={{ fontSize: '20px', color: '#ffffff', fontWeight: 700 }}>${fare.toFixed(0)}</div>
      <div style={{ fontSize: '10px', color: '#64748b', width: '100%', textAlign: 'center' }}>market share</div>
      {/* Progress bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ width: '100%', height: '14px', background: 'rgba(148,163,184,0.12)', borderRadius: '7px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.max(1, ms * 100)}%`,
            background: msColor(ms),
            borderRadius: '7px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: msColor(ms) }}>
          {(ms * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

// ── Carrier comparison modal ──────────────────────────────────────────────────
function CarrierModal({
  route,
  pos,
  onClose,
}: {
  route: RouteRecord
  pos: { top: number; left: number }
  onClose: () => void
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const MODAL_W = 380

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const MODAL_ESTIMATED_H = 480
  const adjustedLeft = Math.min(pos.left, window.innerWidth - MODAL_W - 16)
  const adjustedTop = Math.max(8, Math.min(pos.top, window.innerHeight - MODAL_ESTIMATED_H - 8))

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: adjustedTop,
        left: adjustedLeft,
        width: MODAL_W,
        maxHeight: `calc(100vh - 32px)`,
        overflowY: 'auto',
        zIndex: 1000,
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>✈</span>
          <div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>
              Fee charged by Low Cost<br />versus Dominant Carriers
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {shortCity(route.city1)} → {shortCity(route.city2)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}
        >
          ×
        </button>
      </div>

      {/* Two carrier columns */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <CarrierColumn code={route.carrier_low} fare={route.fare_low} ms={route.lf_ms} label="Low Cost" />
        <CarrierColumn code={route.carrier_lg} fare={route.fare_lg} ms={route.large_ms} label="Dominant" />
      </div>
    </div>
  )
}

// ── Horizontal bar chart ──────────────────────────────────────────────────────
function BarChart({
  title,
  routes: chartRoutes,
  maxVal,
}: {
  title: string
  routes: RouteRecord[]
  maxVal: number
}) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(236,72,153,0.07)',
      border: '1px solid rgba(236,72,153,0.35)',
      borderRadius: '12px',
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: '16px',
        color: '#e2e8f0',
        fontWeight: 600,
        marginBottom: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>✈</span>
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {chartRoutes.map((r, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {displayCity(r.city1)} → {displayCity(r.city2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '7px', background: 'rgba(148,163,184,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(2, (r.passengers / maxVal) * 100)}%`,
                  background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: '#ffffff', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {r.passengers} passengers per day
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Route card ────────────────────────────────────────────────────────────────
function RouteCard({ route, onClick }: { route: RouteRecord; onClick: (e: React.MouseEvent) => void }) {
  const fc = fareColor(route.fare)
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(148,163,184,0.45)'
        el.style.background = 'rgba(30,41,59,0.9)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(148,163,184,0.15)'
        el.style.background = 'rgba(15,23,42,0.85)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{
          fontSize: '11px',
          color: '#e2e8f0',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {shortCity(route.city1)} → {shortCity(route.city2)}
        </div>
        <span style={{ fontSize: '13px', color: '#475569', marginLeft: '4px', flexShrink: 0 }}>⇄</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          avg fare{' '}
          <span style={{ color: fc, fontWeight: 700, fontSize: '14px' }}>
            ${route.fare.toFixed(0)}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          distance{' '}
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>
            {route.nsmiles} miles
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Route card grid ───────────────────────────────────────────────────────────
function RouteCardGrid({
  title,
  routes: gridRoutes,
  onCardClick,
}: {
  title: string
  routes: RouteRecord[]
  onCardClick: (route: RouteRecord, e: React.MouseEvent) => void
}) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <h3 style={{
        color: '#e2e8f0',
        fontSize: '17px',
        fontWeight: 600,
        marginBottom: '13px',
        textAlign: 'center',
        letterSpacing: '0.01em',
      }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {gridRoutes.map((r, i) => (
          <RouteCard key={i} route={r} onClick={e => onCardClick(r, e)} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function RouteStats() {
  const [selectedPeriod, setSelectedPeriod] = useState({ year: 2022, quarter: 1 })
  const [selectedRoute, setSelectedRoute] = useState<RouteRecord | null>(null)
  const [modalPos, setModalPos] = useState<{ top: number; left: number } | null>(null)

  const filteredRoutes = useMemo(
    () => routes.filter(r => r.year === selectedPeriod.year && r.quarter === selectedPeriod.quarter),
    [selectedPeriod],
  )

  const top10Busiest = useMemo(
    () => [...filteredRoutes].sort((a, b) => b.passengers - a.passengers).slice(0, 10),
    [filteredRoutes],
  )
  const top10Quietest = useMemo(
    () => [...filteredRoutes].sort((a, b) => a.passengers - b.passengers).slice(0, 10),
    [filteredRoutes],
  )
  const top10Expensive = useMemo(
    () => [...filteredRoutes].sort((a, b) => b.fare - a.fare).slice(0, 10),
    [filteredRoutes],
  )
  const top10Cheapest = useMemo(
    () => [...filteredRoutes].sort((a, b) => a.fare - b.fare).slice(0, 10),
    [filteredRoutes],
  )

  const maxBusyPax = top10Busiest[0]?.passengers ?? 1
  const maxQuietPax = top10Quietest.at(-1)?.passengers ?? 1

  const handleCardClick = useCallback((route: RouteRecord, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const MODAL_W = 380
    const MODAL_H = 480
    const GAP = 10
    // Prefer right of card; fall back to left; last resort center-screen
    let left: number
    if (window.innerWidth - rect.right >= MODAL_W + GAP) {
      left = rect.right + GAP
    } else if (rect.left >= MODAL_W + GAP) {
      left = rect.left - MODAL_W - GAP
    } else {
      left = Math.max(8, (window.innerWidth - MODAL_W) / 2)
    }
    // Vertically align top of modal with top of card, clamped to viewport
    const top = Math.max(8, Math.min(rect.top, window.innerHeight - MODAL_H - 8))
    setSelectedRoute(route)
    setModalPos({ top, left })
  }, [])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      padding: '20px 28px 28px',
      boxSizing: 'border-box',
    }}>
      {/* Header + dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
            Market Dashboard
          </h2>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0' }}>
            Route performance by period
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <select
            value={`${selectedPeriod.year}-Q${selectedPeriod.quarter}`}
            onChange={e => {
              const [year, q] = e.target.value.split('-Q')
              setSelectedPeriod({ year: parseInt(year), quarter: parseInt(q) })
            }}
            style={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: '8px',
              color: '#e2e8f0',
              padding: '7px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '110px',
            }}
          >
            {PERIODS.map(p => (
              <option key={`${p.year}-Q${p.quarter}`} value={`${p.year}-Q${p.quarter}`}>
                {p.year} Q{p.quarter}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar charts row */}
      <div style={{ display: 'flex', gap: '18px', marginBottom: '42px' }}>
        <BarChart
          title="Busiest flight routes (top 10) 🔥"
          routes={top10Busiest}
          maxVal={maxBusyPax}
        />
        <BarChart
          title="Most quiet flight routes (top 10) 💨"
          routes={top10Quietest}
          maxVal={maxQuietPax}
        />
      </div>

      {/* Expensive card grid */}
      <RouteCardGrid
        title="Most expensive flight routes (top 10)"
        routes={top10Expensive}
        onCardClick={handleCardClick}
      />

      {/* Cheapest card grid */}
      <RouteCardGrid
        title="Cheapest flight routes (top 10)"
        routes={top10Cheapest}
        onCardClick={handleCardClick}
      />

      {/* Carrier comparison modal */}
      {selectedRoute && modalPos && (
        <CarrierModal
          route={selectedRoute}
          pos={modalPos}
          onClose={() => { setSelectedRoute(null); setModalPos(null) }}
        />
      )}
    </div>
  )
}

export default RouteStats
