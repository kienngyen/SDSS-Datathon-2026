import React, { useState } from 'react';
import USMap from './USMap';

const MapContainer: React.FC = () => {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);

  const handleMapClick = (coords: [number, number]) => {
    if (!start) {
      setStart(coords);
    } else if (!end) {
      setEnd(coords);
    } else {
      setStart(coords);
      setEnd(null);
    }
  };

  const reset = () => {
    setStart(null);
    setEnd(null);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <USMap
        onLocationClick={handleMapClick}
        flight={start && end ? { start, end } : undefined}
      />

      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-slate-400 text-sm tracking-wide">
          {!start && 'Click a state to set origin'}
          {start && !end && 'Click another state to set destination'}
          {start && end && 'Route selected — click to reset'}
        </p>
        {start && (
          <button
            onClick={reset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MapContainer;
