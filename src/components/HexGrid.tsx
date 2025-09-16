
import React, { useEffect, useState } from "react";
import { axialToPixel, hexPolygonPoints } from "../game/hex";
import { canSelect } from "../game/rules";

import { useGameStore } from "../state/store";

export default function HexGrid() {
  const { tiles, currentPlayer, turn, select, clickTile, selectedId } = useGameStore();

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
  }, [tiles]);

  return (
    <div className="flex-1 flex items-center justify-center rounded-2xl shadow-2xl p-4 relative overflow-hidden">
      {/* Texture pixel art background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{opacity:0.18}}>
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}>
          <pattern id="bg-texture" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect x="0" y="0" width="40" height="40" fill="#23284d" />
            <circle cx="10" cy="10" r="4" fill="#3b82f6" opacity="0.25" />
            <rect x="20" y="20" width="8" height="8" fill="#38bdf8" opacity="0.12" />
            <rect x="30" y="5" width="6" height="6" fill="#fff" opacity="0.07" />
          </pattern>
          <rect x="0" y="0" width="800" height="600" fill="url(#bg-texture)" />
        </svg>
      </div>
      <svg className="w-full h-full max-w-4xl max-h-[80vh] relative z-10" viewBox={`${minX} ${minY} ${width} ${height}`} role="img" aria-label="Hex board">
        {tiles.map((t) => {
          // Case jouable : overlay plus clair
          let playableOverlay = null;
          if (canSelect(t, currentPlayer)) {
            let color = '';
            if (t.owner === 1) color = 'rgba(74,168,255,0.35)';
            if (t.owner === 2) color = t.hasActed ? 'rgba(255,70,70,0.35)' : 'rgba(255,140,140,0.55)';
            if (t.owner === 3) color = 'rgba(255,221,51,0.35)';
            if (t.owner === 4) color = 'rgba(80,220,120,0.35)';
            playableOverlay = (
              <polygon
                points={hexPolygonPoints(t.axial)}
                fill={color}
                stroke="none"
                style={{filter:'brightness(1.5)'}}
              />
            );
          }
          // ...existing code...
          const baseColor = t.terrain === "PLAINS" ? "#7cc27a" : t.terrain === "MOUNTAIN" ? "#8f8fb2" : "#d9b56b";
          // Texture pixel art SVG
          const textureId = `hex-texture-${t.id}`;
          const texture = (
            <pattern id={textureId} patternUnits="userSpaceOnUse" width="12" height="12">
              <rect x="0" y="0" width="12" height="12" fill={baseColor} />
              <rect x="0" y="0" width="6" height="6" fill="#a3e635" opacity="0.15" />
              <rect x="6" y="6" width="6" height="6" fill="#22d3ee" opacity="0.10" />
              <rect x="3" y="3" width="3" height="3" fill="#fff" opacity="0.07" />
            </pattern>
          );
          let overlay = "";
          // Player colors: 1=blue, 2=red, 3=yellow, 4=green
          if (t.owner === 1) overlay = "rgba(74,168,255,0.75)";    // blue
          if (t.owner === 2) overlay = "rgba(255,70,70,0.75)";     // red
          if (t.owner === 3) overlay = "rgba(255,221,51,0.75)";    // yellow
          if (t.owner === 4) overlay = "rgba(80,220,120,0.75)";    // green
          // Muraille: contour orange
          let murailleStroke = t.city === 3 ? "#ff9900" : "#0a0d1b";
          let murailleStrokeWidth = t.city === 3 ? 4 : 1.5;
          // Contour sélectionné
          if (selectedId === t.id) {
            murailleStroke = "#fff";
            murailleStrokeWidth = 6;
          }
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
                select(t.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <polygon
                points={hexPolygonPoints(t.axial)}
                fill={`url(#${textureId})`}
                stroke={murailleStroke}
                strokeWidth={murailleStrokeWidth}
                // ...className supprimé
              />
              {texture}
              {t.owner && (
                <polygon
                  points={hexPolygonPoints(t.axial)}
                  fill={overlay}
                  stroke="none"
                />
              )}
              {icon}
              {playableOverlay}
              <text x={center.x} y={center.y + 2} className="text-xs font-bold fill-black" textAnchor="middle">{t.power}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
