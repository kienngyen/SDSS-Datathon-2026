import React from 'react';
import { geoCentroid, geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

// load local topojson data (saved under src/data)
import topoData from '../data/states-10m.json';

// convert once to geojson features
const topoFeatures = feature(topoData as any, (topoData as any).objects.states);

export interface USMapProps {
  /**
   * Whenever a geography is clicked we return its [long, lat] centroid.
   */
  onLocationClick: (coords: [number, number]) => void;
  /** optional flight path to draw on top of the map */
  flight?: { start: [number, number]; end: [number, number] };
}


const USMap: React.FC<USMapProps> = ({ onLocationClick, flight }) => {
  // no async loading; use precomputed features
  const geoData = topoFeatures as any;

  const handleFeatureClick = (
    feature: any,
    evt: React.MouseEvent<SVGPathElement, MouseEvent>,
  ) => {
    const centroid = geoCentroid(feature);
    onLocationClick(centroid as [number, number]);
  };

  // projection used for drawing the map and computing path coordinates.
  const width = 800;
  const height = 500;
  const projection = geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);
  const pathGenerator = geoPath().projection(projection);

  let pathElements: JSX.Element | null = null;
  if (flight) {
    const [sx, sy] = projection(flight.start) || [0, 0];
    const [ex, ey] = projection(flight.end) || [0, 0];
    pathElements = (
      <g>
        <line
          x1={sx}
          y1={sy}
          x2={ex}
          y2={ey}
          stroke="#f44336"
          strokeWidth={2}
        />
        <circle cx={sx} cy={sy} r={4} fill="#f44336" />
        <circle cx={ex} cy={ey} r={4} fill="#f44336" />
      </g>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <svg width={width} height={height} className="mx-auto">
        {geoData.features.map((feat: any) => {
          const path = pathGenerator(feat) || '';
          return (
            <path
              key={feat.id || feat.properties.name}
              d={path}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={0.7}
              className="hover:fill-blue-300 cursor-pointer"
              onClick={(evt) => handleFeatureClick(feat, evt)}
            />
          );
        })}
        {pathElements}
      </svg>
    </div>
  );
};

export default USMap;
