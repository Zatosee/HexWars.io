
import React from "react";
import { axialToPixel, hexPolygonPoints } from "../game/hex";

type HexGridProps = {
  onTileInfo?: (tileId: string) => void;
};

import { useGameStore } from "../state/store";

export default function HexGrid({ onTileInfo }: HexGridProps = {}) {
  const { tiles, cols, rows, selectedId, clickTile, currentPlayer } = useGameStore();

  // Calculer le viewBox pour auto-fit
  const { minX, minY, width, height } = React.useMemo(() => {
    if (tiles.length === 0) {
      return { minX: -200, minY: -200, width: 400, height: 400 };
    }
    let xs: number[] = [], ys: number[] = [];
    tiles.forEach((t) => {
      const p = axialToPixel(t.axial);
      xs.push(p.x); ys.push(p.y);
    });
    const pad = 80;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }, [tiles, cols, rows]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#23284d] to-[#2a1c3a] rounded-2xl shadow-2xl p-4">
      <svg className="w-full h-full max-w-4xl max-h-[80vh]" viewBox={`${minX} ${minY} ${width} ${height}`} role="img" aria-label="Hex board">
        {tiles.map((t) => {
          const baseColor = t.terrain === "PLAINS" ? "#7cc27a" : t.terrain === "MOUNTAIN" ? "#8f8fb2" : "#d9b56b";
          let overlay = "";
          // Player colors: 1=blue, 2=red, 3=yellow, 4=green
          if (t.owner === 1) overlay = "rgba(74,168,255,0.75)";    // blue
          if (t.owner === 2) overlay = "rgba(255,70,70,0.75)";     // red
          if (t.owner === 3) overlay = "rgba(255,221,51,0.75)";    // yellow
          if (t.owner === 4) overlay = "rgba(80,220,120,0.75)";    // green
          // Muraille: contour orange
          const murailleStroke = t.city === 3 ? "#ff9900" : (selectedId === t.id ? "#fff" : "#0a0d1b");
          const murailleStrokeWidth = t.city === 3 ? 4 : (selectedId === t.id ? 3 : 1.5);
          // Icônes SVG
          const center = axialToPixel(t.axial);
          let icon = null;
          if (t.city === 1) {
            // Avion (aéroport)
            icon = (
              <svg x={center.x - 10} y={center.y - 10} width="20" height="20" viewBox="0 0 24 24">
                <path d="M2 16l20-5-20-5v7l16 3-16 3z" fill="#fff"/>
                <rect x="10" y="7" width="4" height="10" rx="2" fill="#60a5fa"/>
              </svg>
            );
          } else if (t.city === 2 || t.city === 3) {
            // Maison (hôtel ou muraille)
            icon = (
              <svg x={center.x - 10} y={center.y - 10} width="20" height="20" viewBox="0 0 24 24">
                <rect x="4" y="10" width="16" height="8" rx="2" fill="#fff"/>
                <polygon points="12,4 2,12 22,12" fill="#fbbf24"/>
              </svg>
            );
          }
          return (
            <g
              key={t.id}
              onClick={e => {
                if (e.button === 0) clickTile(t.id);
              }}
              onContextMenu={e => {
                e.preventDefault();
                if (onTileInfo) onTileInfo(t.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <polygon
                points={hexPolygonPoints(t.axial)}
                fill={baseColor}
                stroke={murailleStroke}
                strokeWidth={murailleStrokeWidth}
                className={selectedId === t.id ? "drop-shadow-lg" : ""}
              />
              {t.owner && (
                <polygon
                  points={hexPolygonPoints(t.axial)}
                  fill={overlay}
                  stroke="none"
                />
              )}
              {icon}
              <text x={center.x} y={center.y + 2} className="text-xs font-bold fill-black" textAnchor="middle">{t.power}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
