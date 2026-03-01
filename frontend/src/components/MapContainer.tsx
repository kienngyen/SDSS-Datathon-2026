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
  const [currentYear, setCurrentYear] = useState(2022);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [lockedYear, setLockedYear] = useState<number>(2022);
  const [simulating, setSimulating] = useState(false);
  const [visibleFares, setVisibleFares] = useState({ cheap: true, mid: true, expensive: true });
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedQuarters = new Set(
    selectedQuarter !== null && lockedYear === currentYear ? [selectedQuarter] : [],
  );

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleToggleQuarter = useCallback((quarter: number) => {
    setSelectedQuarter(quarter);
    setLockedYear(currentYear);
  }, [currentYear]);

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

  const mapYears = new Set([lockedYear]);
  const mapQuarters = new Map([[lockedYear, new Set([selectedQuarter])]]);


  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '800px' }}>
      <USMap selectedYears={mapYears} selectedQuarters={mapQuarters} displayYear={lockedYear} displayQuarter={selectedQuarter} visibleFares={visibleFares} onToggleFare={(key) => setVisibleFares((prev) => ({ ...prev, [key]: !prev[key] }))} />
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
        <button
          onClick={simulating ? stopSimulation : startSimulation}
          style={{
            background: 'none',
            border: '1px solid',
            borderColor: simulating ? '#f87171' : '#64748b',
            borderRadius: '6px',
            padding: '6px 20px',
            color: simulating ? '#f87171' : '#cbd5e1',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {simulating ? 'Stop Simulation' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
};

export default MapContainer;
