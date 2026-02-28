import React, { useState, useRef, useEffect } from 'react';

interface TimeFilterProps {
  years: number[];
  selectedYears: Set<number>;
  selectedQuarters: Map<number, Set<number>>;
  onToggleYear: (year: number) => void;
  onToggleQuarter: (year: number, quarter: number) => void;
}

const QUARTER_MAP: Record<number, number[]> = {
  2022: [1, 2, 3, 4],
  2023: [1, 2, 3, 4],
  2024: [1, 2, 3, 4],
  2025: [1, 2],
};

const TimeFilter: React.FC<TimeFilterProps> = ({
  years,
  selectedYears,
  selectedQuarters,
  onToggleYear,
  onToggleQuarter,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleYearClick = (year: number) => {
    onToggleYear(year);
    setExpandedYear(expandedYear === year ? null : year);
  };

  const handleExpandToggle = (e: React.MouseEvent, year: number) => {
    e.stopPropagation();
    setExpandedYear(expandedYear === year ? null : year);
  };

  const hasAnySelection = selectedYears.size > 0;

  let label = 'Time';
  if (hasAnySelection) {
    const parts: string[] = [];
    for (const y of Array.from(selectedYears).sort()) {
      const qs = selectedQuarters.get(y);
      if (qs && qs.size > 0) {
        parts.push(`${y} ${Array.from(qs).sort().map((q) => `Q${q}`).join(',')}`);
      } else {
        parts.push(`${y}`);
      }
    }
    label = parts.join(' | ');
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`px-4 py-2 rounded-lg border text-sm transition-colors flex items-center gap-2
          ${hasAnySelection
            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
            : 'bg-slate-800 border-slate-600 text-slate-200 hover:border-slate-400'
          }`}
      >
        {label}
        <svg
          width="10" height="10" viewBox="0 0 10 10"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 3 L5 7 L9 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg
                        shadow-xl z-50 min-w-[160px] overflow-hidden py-1">
          {years.map((year) => {
            const isYearSelected = selectedYears.has(year);
            const quarters = QUARTER_MAP[year] || [1, 2, 3, 4];
            const yearQuarters = selectedQuarters.get(year);

            return (
              <div key={year}>
                <div className="flex items-center">
                  <button
                    onClick={() => handleYearClick(year)}
                    className={`flex-1 text-left px-4 py-2 text-sm transition-colors
                      ${isYearSelected
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    {year}
                  </button>
                  <button
                    onClick={(e) => handleExpandToggle(e, year)}
                    className={`px-3 py-2 text-sm transition-colors
                      ${isYearSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {expandedYear === year ? (
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <path d="M1 5 L4 2 L7 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ) : (
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <path d="M1 2 L4 5 L7 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>

                {expandedYear === year && (
                  <div className="bg-slate-900/50">
                    {quarters.map((q) => {
                      const isQSelected = yearQuarters?.has(q) ?? false;
                      return (
                        <button
                          key={q}
                          onClick={() => onToggleQuarter(year, q)}
                          className={`w-full text-left pl-8 pr-4 py-1.5 text-sm transition-colors
                            ${isQSelected
                              ? 'bg-blue-500/30 text-blue-300'
                              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                        >
                          Q{q}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeFilter;
