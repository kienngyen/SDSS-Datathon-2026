import React from 'react';

const ALL_QUARTERS = [1, 2, 3, 4];

const AVAILABLE_QUARTERS: Record<number, Set<number>> = {
  2022: new Set([1, 2, 3, 4]),
  2023: new Set([1, 2, 3, 4]),
  2024: new Set([1, 2, 3, 4]),
  2025: new Set([1, 2]),
};

interface TimeFilterProps {
  years: number[];
  currentYear: number;
  selectedQuarters: Set<number>;
  onYearChange: (year: number) => void;
  onToggleQuarter: (quarter: number) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  years,
  currentYear,
  selectedQuarters,
  onYearChange,
  onToggleQuarter,
}) => {
  const yearIdx = years.indexOf(currentYear);
  const hasPrev = yearIdx > 0;
  const hasNext = yearIdx < years.length - 1;
  const available = AVAILABLE_QUARTERS[currentYear] || new Set([1, 2, 3, 4]);

  return (
    <div className="w-full flex flex-col items-center gap-1">
      {/* Year label */}
      <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}>
        {currentYear}
      </span>

      {/* < *----*----*----* > all aligned on one row */}
      <div className="flex items-start w-full" style={{ gap: '8px' }}>
        {/* Prev arrow aligned to dot center */}
        <button
          onClick={() => hasPrev && onYearChange(years[yearIdx - 1])}
          disabled={!hasPrev}
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            margin: '0',
            marginTop: '1px',
            cursor: hasPrev ? 'pointer' : 'default',
            color: hasPrev ? '#cbd5e1' : '#334155',
            transition: 'color 0.2s',
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 4 L6 10 L12 16" />
          </svg>
        </button>

        {/* Timeline dots + lines */}
        <div className="flex-1 flex items-start">
          {ALL_QUARTERS.map((q, i) => {
            const hasData = available.has(q);
            const isSelected = hasData && selectedQuarters.has(q);
            return (
              <React.Fragment key={q}>
                <button
                  onClick={() => hasData && onToggleQuarter(q)}
                  className="relative group z-10"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    margin: '0',
                    cursor: hasData ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute animate-pulse"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.25)',
                        top: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: isSelected ? '#f87171' : hasData ? '#64748b' : '#2d3748',
                      backgroundColor: isSelected ? '#ef4444' : '#0f172a',
                      boxShadow: isSelected ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none',
                      opacity: hasData ? 1 : 0.3,
                      transition: 'all 0.2s',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 500,
                      marginTop: '4px',
                      color: isSelected ? '#f87171' : hasData ? '#64748b' : '#2d3748',
                      opacity: hasData ? 1 : 0.3,
                      transition: 'color 0.2s',
                    }}
                  >
                    Q{q}
                  </span>
                </button>
                {i < ALL_QUARTERS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', backgroundColor: 'rgba(239, 68, 68, 0.5)', marginTop: '6px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Next arrow aligned to dot center */}
        <button
          onClick={() => hasNext && onYearChange(years[yearIdx + 1])}
          disabled={!hasNext}
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            margin: '0',
            marginTop: '1px',
            cursor: hasNext ? 'pointer' : 'default',
            color: hasNext ? '#cbd5e1' : '#334155',
            transition: 'color 0.2s',
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 4 L14 10 L8 16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TimeFilter;
