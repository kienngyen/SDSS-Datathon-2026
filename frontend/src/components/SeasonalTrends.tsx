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

interface PopupData {
  x: number
  y: number
  type: 'dominant' | 'lcc'
  carrier: string
  fare: number
  priceDiff: number // negative = discount, positive = premium
  quarter: number
}

const routes = routesRaw as RouteRecord[]
const carriers = carriersRaw as Record<string, CarrierInfo>

const YEARS = [2022, 2023, 2024, 2025]
const QUARTERS = [1, 2, 3, 4]

// Available quarters per year
const AVAILABLE_QUARTERS: Record<number, number[]> = {
  2022: [1, 2, 3, 4],
  2023: [1, 2, 3, 4],
  2024: [1, 2, 3, 4],
  2025: [1, 2],
}

function shortCity(city: string): string {
  return city.replace(' (Metropolitan Area)', '').split(',')[0]
}

// ── Route Selector Dropdown ────────────────────────────────────────────────────
function RouteDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(o => o.toLowerCase().includes(lower))
  }, [options, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(30,41,59,0.9)',
          border: '1px solid rgba(56,189,248,0.4)',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 500 }}>
          {value ? shortCity(value) : 'Select city...'}
        </span>
      </div>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'rgba(15,23,42,0.98)',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: '8px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
            <input
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(30,41,59,0.6)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#e2e8f0',
                fontSize: '13px',
                outline: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filtered.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt)
                setIsOpen(false)
                setSearch('')
              }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                color: opt === value ? '#38bdf8' : '#e2e8f0',
                background: opt === value ? 'rgba(56,189,248,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56,189,248,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = opt === value ? 'rgba(56,189,248,0.1)' : 'transparent')}
            >
              {shortCity(opt)}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
              No cities found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Popup Card Component ───────────────────────────────────────────────────────
function PopupCard({
  data,
  onClose,
}: {
  data: PopupData
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const info = carriers[data.carrier] ?? { name: data.carrier, color: '#334155', textColor: '#ffffff' }
  const isDiscount = data.priceDiff < 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: Math.min(data.x + 10, window.innerWidth - 220),
        top: Math.max(10, Math.min(data.y - 60, window.innerHeight - 180)),
        width: '200px',
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: '12px',
        padding: '16px',
        zIndex: 200,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: info.color,
              color: info.textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            {data.carrier}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {data.type === 'dominant' ? 'Dominant' : 'LCC'} Carrier
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{info.name}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px', padding: 0 }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>Avg Fare (Q{data.quarter})</div>
        <div style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700 }}>${data.fare.toFixed(0)}</div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '10px', color: '#64748b' }}>Price Diff:</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: isDiscount ? 'rgba(50,231,148,0.15)' : 'rgba(235,84,74,0.15)',
          }}
        >
          <span style={{ fontSize: '14px' }}>{isDiscount ? '✓' : '▲'}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: isDiscount ? '#32E794' : '#EB544A' }}>
            {isDiscount ? '' : '+'}${Math.abs(data.priceDiff).toFixed(0)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#64748b' }}>
          {isDiscount ? 'discount' : 'premium'}
        </span>
      </div>
    </div>
  )
}

// ── Single Year Line Chart ─────────────────────────────────────────────────────
function YearChart({
  year,
  data,
  onPointClick,
}: {
  year: number
  data: RouteRecord[]
  onPointClick: (popup: PopupData) => void
}) {
  const availableQs = AVAILABLE_QUARTERS[year] || []
  const chartWidth = 200
  const chartHeight = 160
  const padding = { top: 30, right: 20, bottom: 30, left: 35 }
  const innerW = chartWidth - padding.left - padding.right
  const innerH = chartHeight - padding.top - padding.bottom

  // Get data points for each quarter
  const dataByQ = useMemo(() => {
    const map: Record<number, RouteRecord> = {}
    data.filter(d => d.year === year).forEach(d => { map[d.quarter] = d })
    return map
  }, [data, year])

  // Compute y scale based on available data
  const { minY, maxY } = useMemo(() => {
    let min = Infinity
    let max = -Infinity
    availableQs.forEach(q => {
      const rec = dataByQ[q]
      if (rec) {
        min = Math.min(min, rec.fare_lg, rec.fare_low)
        max = Math.max(max, rec.fare_lg, rec.fare_low)
      }
    })
    if (!isFinite(min)) { min = 0; max = 100 }
    const range = max - min || 10
    return { minY: Math.max(0, min - range * 0.1), maxY: max + range * 0.1 }
  }, [availableQs, dataByQ])

  const xScale = (q: number) => padding.left + ((q - 1) / 3) * innerW
  const yScale = (val: number) => padding.top + innerH - ((val - minY) / (maxY - minY)) * innerH

  // Build path strings
  const dominantPoints = availableQs.filter(q => dataByQ[q]).map(q => ({ q, val: dataByQ[q].fare_lg }))
  const lccPoints = availableQs.filter(q => dataByQ[q]).map(q => ({ q, val: dataByQ[q].fare_low }))

  const pathD = (pts: { q: number; val: number }[]) => {
    if (pts.length === 0) return ''
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.q)},${yScale(p.val)}`).join(' ')
  }

  const handlePointClick = useCallback((e: React.MouseEvent, q: number, type: 'dominant' | 'lcc') => {
    const rec = dataByQ[q]
    if (!rec) return
    const rect = (e.target as SVGElement).getBoundingClientRect()
    const fare = type === 'dominant' ? rec.fare_lg : rec.fare_low
    const otherFare = type === 'dominant' ? rec.fare_low : rec.fare_lg
    const carrier = type === 'dominant' ? rec.carrier_lg : rec.carrier_low
    onPointClick({
      x: rect.left + rect.width / 2,
      y: rect.top,
      type,
      carrier,
      fare,
      priceDiff: fare - otherFare,
      quarter: q,
    })
  }, [dataByQ, onPointClick])

  const noData = availableQs.every(q => !dataByQ[q])

  return (
    <div style={{ flex: '0 0 auto', width: chartWidth }}>
      {/* Year label */}
      <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
        Year = {year}
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#32E794' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Dominant Carrier</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Low Cost Carrier</span>
        </div>
      </div>

      <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
        {/* Y axis */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#334155" strokeWidth={1} />
        {/* Y axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const val = minY + t * (maxY - minY)
          const y = yScale(val)
          return (
            <g key={t}>
              <line x1={padding.left - 4} y1={y} x2={padding.left} y2={y} stroke="#334155" />
              <text x={padding.left - 8} y={y + 3} fontSize="9" fill="#64748b" textAnchor="end">
                {val.toFixed(0)}
              </text>
            </g>
          )
        })}
        
        {/* X axis */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#334155" strokeWidth={1} />
        {/* Quarter labels */}
        {QUARTERS.map((q) => (
          <text
            key={q}
            x={xScale(q)}
            y={padding.top + innerH + 18}
            fontSize="10"
            fill={availableQs.includes(q) ? '#94a3b8' : '#475569'}
            textAnchor="middle"
          >
            Q{q}
          </text>
        ))}

        {noData ? (
          <text x={chartWidth / 2} y={chartHeight / 2} fontSize="12" fill="#64748b" textAnchor="middle">
            No data
          </text>
        ) : (
          <>
            {/* Dominant line */}
            <path d={pathD(dominantPoints)} fill="none" stroke="#32E794" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {/* LCC line */}
            <path d={pathD(lccPoints)} fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Dominant points */}
            {dominantPoints.map(({ q, val }) => (
              <circle
                key={`dom-${q}`}
                cx={xScale(q)}
                cy={yScale(val)}
                r={6}
                fill="#32E794"
                stroke="#0f172a"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handlePointClick(e, q, 'dominant')}
              />
            ))}
            {/* LCC points */}
            {lccPoints.map(({ q, val }) => (
              <circle
                key={`lcc-${q}`}
                cx={xScale(q)}
                cy={yScale(val)}
                r={6}
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handlePointClick(e, q, 'lcc')}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  )
}

// ── Main SeasonalTrends Component ────────────────────────────────────────────
export function SeasonalTrends() {
  const [city1, setCity1] = useState('')
  const [city2, setCity2] = useState('')
  const [popup, setPopup] = useState<PopupData | null>(null)

  // Get unique cities
  const allCities = useMemo(() => {
    const set = new Set<string>()
    routes.forEach(r => {
      set.add(r.city1)
      set.add(r.city2)
    })
    return Array.from(set).sort((a, b) => shortCity(a).localeCompare(shortCity(b)))
  }, [])

  // Cities available for city2, excluding city1
  const city2Options = useMemo(() => {
    if (!city1) return allCities
    return allCities.filter(c => c !== city1)
  }, [allCities, city1])

  // Filter routes for selected pair
  const filteredRoutes = useMemo(() => {
    if (!city1 || !city2) return []
    return routes.filter(r =>
      (r.city1 === city1 && r.city2 === city2) ||
      (r.city1 === city2 && r.city2 === city1)
    )
  }, [city1, city2])

  // Auto-select first valid route when city1 changes
  useEffect(() => {
    if (city1 && !city2) {
      const firstMatch = routes.find(r => r.city1 === city1 || r.city2 === city1)
      if (firstMatch) {
        setCity2(firstMatch.city1 === city1 ? firstMatch.city2 : firstMatch.city1)
      }
    }
  }, [city1, city2])

  const handlePointClick = useCallback((data: PopupData) => {
    setPopup(data)
  }, [])

  // Set default selection on mount
  useEffect(() => {
    if (!city1 && routes.length > 0) {
      // Default to a popular route
      const defaultRoute = routes.find(r => 
        r.city1.includes('New York') && r.city2.includes('Los Angeles')
      ) || routes[0]
      if (defaultRoute) {
        setCity1(defaultRoute.city1)
        setCity2(defaultRoute.city2)
      }
    }
  }, [city1])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      {/* Title */}
      <h2 style={{
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        marginBottom: '4px',
      }}>
        Routes Seasonal Price Trends
      </h2>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
        Compare dominant vs. low-cost carrier fares by quarter
      </p>

      {/* Route selectors */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <RouteDropdown
          label="city1"
          value={city1}
          options={allCities}
          onChange={(val) => {
            setCity1(val)
            if (val === city2) setCity2('')
          }}
        />
        <RouteDropdown
          label="city2"
          value={city2}
          options={city2Options}
          onChange={setCity2}
        />
      </div>

      {/* Charts grid */}
      {filteredRoutes.length > 0 ? (
        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '900px',
        }}>
          {YEARS.map((year) => (
            <YearChart
              key={year}
              year={year}
              data={filteredRoutes}
              onPointClick={handlePointClick}
            />
          ))}
        </div>
      ) : (
        <div style={{
          color: '#64748b',
          fontSize: '14px',
          textAlign: 'center',
          padding: '60px 20px',
        }}>
          {city1 && city2 ? (
            <>No data available for route: {shortCity(city1)} → {shortCity(city2)}</>
          ) : (
            <>Select both cities to view seasonal trends</>
          )}
        </div>
      )}

      {/* Instruction hint */}
      <div style={{
        marginTop: '24px',
        color: '#475569',
        fontSize: '11px',
        textAlign: 'center',
      }}>
        Click on data points to see carrier details and price comparison
      </div>

      {/* Popup card */}
      {popup && <PopupCard data={popup} onClose={() => setPopup(null)} />}
    </div>
  )
}

export default SeasonalTrends
