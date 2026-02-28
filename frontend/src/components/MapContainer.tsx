import React, { useCallback, useState } from 'react';
import USMap from './USMap';
import TimeFilter from './TimeFilter';

const YEARS = [2022, 2023, 2024, 2025];

const MapContainer: React.FC = () => {
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [selectedQuarters, setSelectedQuarters] = useState<Map<number, Set<number>>>(new Map());

  const handleToggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
        setSelectedQuarters((qm) => {
          const nq = new Map(qm);
          nq.delete(year);
          return nq;
        });
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  const handleToggleQuarter = useCallback((year: number, quarter: number) => {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      next.add(year);
      return next;
    });
    setSelectedQuarters((prev) => {
      const next = new Map(prev);
      const qs = new Set(next.get(year) || []);
      if (qs.has(quarter)) {
        qs.delete(quarter);
      } else {
        qs.add(quarter);
      }
      if (qs.size === 0) {
        next.delete(year);
      } else {
        next.set(year, qs);
      }
      return next;
    });
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <TimeFilter
          years={YEARS}
          selectedYears={selectedYears}
          selectedQuarters={selectedQuarters}
          onToggleYear={handleToggleYear}
          onToggleQuarter={handleToggleQuarter}
        />
      </div>
      <USMap selectedYears={selectedYears} selectedQuarters={selectedQuarters} />
    </div>
  );
};

export default MapContainer;
