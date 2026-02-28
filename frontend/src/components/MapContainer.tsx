import React, { useCallback, useState, useRef, useEffect } from 'react';
import USMap from './USMap';
import TimeFilter from './TimeFilter';

const YEARS = [2022, 2023, 2024, 2025];

const AVAILABLE_QUARTERS: Record<number, number[]> = {
  2022: [1, 2, 3, 4],
  2023: [1, 2, 3, 4],
  2024: [1, 2, 3, 4],
  2025: [1, 2],
};

function buildSteps(startYear: number, startQuarter: number | null) {
  const steps: { year: number; quarter: number }[] = [];
  let started = false;

  for (const y of YEARS) {
    const qs = AVAILABLE_QUARTERS[y] || [1, 2, 3, 4];
    for (const q of qs) {
      if (!started) {
        if (y === startYear && (startQuarter === null || q === startQuarter)) {
          started = true;
        }
        if (!started) continue;
      }
      steps.push({ year: y, quarter: q });
    }
  }
  return steps;
}

const MapContainer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [lockedYear, setLockedYear] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedQuarters = new Set(
    selectedQuarter !== null && lockedYear === currentYear ? [selectedQuarter] : [],
  );

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleToggleQuarter = useCallback((quarter: number) => {
    setSelectedQuarter((prev) => {
      if (prev === quarter) {
        setLockedYear(null);
        return null;
      }
      return quarter;
    });
    setLockedYear((prev) => {
      if (selectedQuarter === quarter) return null;
      return currentYear;
    });
  }, [currentYear, selectedQuarter]);

  const startSimulation = useCallback(() => {
    const steps = buildSteps(lockedYear || currentYear, selectedQuarter);
    if (steps.length <= 1) return;

    setSimulating(true);
    let idx = 0;

    setCurrentYear(steps[0].year);
    setLockedYear(steps[0].year);
    setSelectedQuarter(steps[0].quarter);

    simRef.current = setInterval(() => {
      idx++;
      if (idx >= steps.length) {
        if (simRef.current) clearInterval(simRef.current);
        setSimulating(false);
        return;
      }
      setCurrentYear(steps[idx].year);
      setLockedYear(steps[idx].year);
      setSelectedQuarter(steps[idx].quarter);
    }, 1000);
  }, [currentYear, lockedYear, selectedQuarter]);

  const stopSimulation = useCallback(() => {
    if (simRef.current) clearInterval(simRef.current);
    setSimulating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  const hasSelection = selectedQuarter !== null && lockedYear !== null;
  const mapYears = hasSelection ? new Set([lockedYear]) : new Set<number>();
  const mapQuarters = hasSelection
    ? new Map([[lockedYear, new Set([selectedQuarter])]])
    : new Map<number, Set<number>>();

  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '800px' }}>
      <USMap selectedYears={mapYears} selectedQuarters={mapQuarters} />
      <div className="mt-3">
        <TimeFilter
          years={YEARS}
          currentYear={currentYear}
          selectedQuarters={selectedQuarters}
          onYearChange={handleYearChange}
          onToggleQuarter={handleToggleQuarter}
        />
      </div>
      <div className="mt-3 flex justify-center">
        {(() => {
          const canRun = simulating || selectedQuarter !== null;
          return (
            <button
              onClick={simulating ? stopSimulation : canRun ? startSimulation : undefined}
              disabled={!canRun}
              style={{
                background: 'none',
                border: '1px solid',
                borderColor: simulating ? '#f87171' : canRun ? '#64748b' : '#1e293b',
                borderRadius: '6px',
                padding: '6px 20px',
                color: simulating ? '#f87171' : canRun ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                cursor: canRun ? 'pointer' : 'default',
                opacity: canRun ? 1 : 0.4,
                transition: 'all 0.2s',
              }}
            >
              {simulating ? 'Stop Simulation' : 'Run Simulation'}
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default MapContainer;
