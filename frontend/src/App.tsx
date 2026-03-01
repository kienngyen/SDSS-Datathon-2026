import './App.css'
import MapContainer from './components/MapContainer'
import { RouteStats } from './components/RouteStats'

function App() {
  return (
    <div className="snap-container">
      {/* Landing hero */}
      <div className="snap-section">
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <p
            style={{
              color: '#475569',
              fontSize: '13px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            SDSS Datathon 2026
          </p>
          <h1
            style={{
              color: '#ffffff',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textAlign: 'center',
              margin: '0 0 12px 0',
              lineHeight: 1.1,
            }}
          >
            Airfare Markets
            <br />
            Under Pressure
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '16px',
              maxWidth: '480px',
              textAlign: 'center',
              lineHeight: 1.6,
              margin: '0 0 40px 0',
              padding: '0 24px',
            }}
          >
            Explore how competition, hub dominance, and route demand shape
            domestic U.S. airfare from 2022 to 2025.
          </p>
          {/* Scroll indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'bounce 2s infinite',
            }}
          >
            <span style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.1em' }}>
              Scroll to explore
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
              <path d="M4 8 L10 14 L16 8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="snap-section" style={{ overflow: 'hidden' }} id="map-section">
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 24px 24px',
          }}
        >
          <h2
            style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: '2px',
            }}
          >
            US Domestic Airfare Explorer
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            Interactive route map
          </p>
          <MapContainer />
        </div>
      </div>
      {/* Market Dashboard section */}
      <div className="snap-section" style={{ overflow: 'hidden' }}>
        <RouteStats />
      </div>
    </div>
  )
}

export default App
