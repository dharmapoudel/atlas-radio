// Simplified world map view - the "atlas" in Radio Atlas.
// Equirectangular projection of simplified Natural Earth country geometry
// (derived from the Omarchy plugin's assets/countries.json, public domain).
// Station dots are tappable; tapping a country browses its stations.

import { useMemo } from 'react';
import world from './world.json';
import type { Station } from './types';

interface CountryGeom {
  c: string;
  n: string;
  p: number[][][];
}

const COUNTRIES = world as CountryGeom[];

const W = 800;
const H = 400;

function project(lon: number, lat: number): [number, number] {
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

function countryPath(polys: number[][][]): string {
  return polys
    .map(ring => ring.map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join('') + 'Z')
    .join('');
}

interface Props {
  stations: Station[];
  playingUuid: string | null;
  isPaused: boolean;
  zoom: number;
  onPlayStation: (s: Station) => void;
  onBrowseCountry: (code: string, name: string) => void;
}

export default function WorldMap({ stations, playingUuid, isPaused, zoom, onPlayStation, onBrowseCountry }: Props) {
  const paths = useMemo(
    () => COUNTRIES.map(c => ({ c: c.c, n: c.n, d: countryPath(c.p) })),
    []
  );

  const dots = useMemo(
    () => stations.filter(s => s.latitude != null && s.longitude != null),
    [stations]
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-screen">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="World map of stations">
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`}>
        {/* graticule */}
        {Array.from({ length: 11 }, (_, i) => (i + 1) * 30 - 180).map(lon => {
          const [x] = project(lon, 0);
          return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={H} stroke="currentColor" className="text-rule" strokeWidth={0.5} />;
        })}
        {Array.from({ length: 5 }, (_, i) => (i + 1) * 30 - 90).map(lat => {
          const [, y] = project(0, lat);
          return <line key={`lat${lat}`} x1={0} y1={y} x2={W} y2={y} stroke="currentColor" className="text-rule" strokeWidth={0.5} />;
        })}

        {/* countries */}
        {paths.map(({ c, n, d }) => (
          <path
            key={c || n}
            d={d}
            className="fill-[#283039] stroke-[#7d8791]"
            strokeWidth={0.6}
            onClick={() => { if (/^[A-Z]{2}$/.test(c)) onBrowseCountry(c, n); }}
            style={{ cursor: /^[A-Z]{2}$/.test(c) ? 'pointer' : 'default' }}
          />
        ))}

        {/* station signals */}
        {dots.map(s => {
          const [x, y] = project(s.longitude as number, s.latitude as number);
          const isPlaying = playingUuid === s.uuid;
          return (
            <g key={s.uuid} onClick={() => onPlayStation(s)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={10} fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={isPlaying ? 6 : 3.5}
                className={isPlaying ? 'fill-accent' : 'fill-[#d9dee3]'}
                opacity={isPlaying ? 1 : 0.85}
              >
                {isPlaying && !isPaused && (
                  <animate attributeName="r" values="6;9;6" dur="1.6s" repeatCount="indefinite" />
                )}
              </circle>
            </g>
          );
        })}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-2 left-4 font-mono text-hint text-dim">
        Knob zooms · tap a dot to play · tap a country to browse · {dots.length} signals
      </div>
    </div>
  );
}
