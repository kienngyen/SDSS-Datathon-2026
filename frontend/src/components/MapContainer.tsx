import React, { useState } from 'react';
import USMap from './USMap';

const MapContainer: React.FC = () => {
  const [start, setStart] = useState<[number, number] | null>(null); // [lon, lat]
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

  return (
    <div className="relative w-full max-w-3xl h-96 border border-gray-300 rounded-md bg-white">
      {/* always-visible label to help debugging */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-gray-500">map container</span>
      </div>

      <USMap
        onLocationClick={handleMapClick}
        flight={start && end ? { start, end } : undefined}
      />
      {/* display state for debug */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 p-1 text-xs">
        {start ? `start: ${start[0].toFixed(3)},${start[1].toFixed(3)}` : 'click a state'}
        {end ? ` end: ${end[0].toFixed(3)},${end[1].toFixed(3)}` : ''}
      </div>
    </div>
  );
};

export default MapContainer;
