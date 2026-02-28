import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { geoCentroid, geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';

// note: the built-in projection string ensures the library will render properly without
// trying to pass an object which sometimes fails silently.

export interface USMapProps {
  /**
   * Whenever a geography is clicked we return its [long, lat] centroid.
   */
  onLocationClick: (coords: [number, number]) => void;
  /** optional flight path to draw on top of the map */
  flight?: { start: [number, number]; end: [number, number] };
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// simple fallback polygon covering contiguous U.S. if the CDN can't be reached
const fallbackGeo: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'USA (approx)' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-125, 24],
          [-66, 24],
          [-66, 49],
          [-125, 49],
          [-125, 24],
        ]],
      },
    },
  ],
};

const USMap: React.FC<USMapProps> = ({ onLocationClick, flight }) => {
  const [geoData, setGeoData] = React.useState<any>(null);

  // attempt to fetch the official topology; if it fails we'll just render the fallback
  React.useEffect(() => {
    fetch(geoUrl)
      .then((r) => r.json())
      .then((json) => {
        try {
          // us-atlas stores topology under objects.states
          const geo = feature(json as any, (json as any).objects.states);
          setGeoData(geo);
        } catch (e) {
          console.warn('failed to convert topojson, using raw data', e);
          setGeoData(json);
        }
      })
      .catch((err) => {
        console.warn('could not load geojson, using fallback', err);
      });
  }, []);

  const handleGeoClick = (
    geo: any,
    evt: React.MouseEvent<SVGPathElement, MouseEvent>,
  ) => {
    const centroid = geoCentroid(geo);
    onLocationClick(centroid as [number, number]);
  };

  // to compute the pixel locations for flight endpoints we create a separate
  // projection with the same configuration that the ComposableMap uses.
  const width = 800;
  const height = 500;
  const projection = geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

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
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={width}
        height={height}
        className="mx-auto"
      >
        <Geographies geography={geoData || fallbackGeo}>
          {({ geographies }) => {
            if (!geographies || geographies.length === 0) {
              return <text>loading map...</text>;
            }
            return geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={0.7}
                onClick={(evt) => handleGeoClick(geo, evt)}
                className="hover:fill-blue-300 cursor-pointer"
              />
            ));
          }}
        </Geographies>
        {pathElements}
      </ComposableMap>
    </div>
  );
};

export default USMap;
