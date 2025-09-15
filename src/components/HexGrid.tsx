
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
          if (t.owner === 1) overlay = "rgba(74,168,255,0.45)";
          if (t.owner === 2) overlay = "rgba(255,111,177,0.45)";
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
                stroke={selectedId === t.id ? "#fff" : "#0a0d1b"}
                strokeWidth={selectedId === t.id ? 3 : 1.5}
                className={selectedId === t.id ? "drop-shadow-lg" : ""}
              />
              {t.owner && (
                <polygon
                  points={hexPolygonPoints(t.axial)}
                  fill={overlay}
                  stroke="none"
                />
              )}
              <text x={axialToPixel(t.axial).x} y={axialToPixel(t.axial).y + 2} className="text-xs font-bold fill-black" textAnchor="middle">{t.power}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
