
import React from "react";
import { useGameStore } from "../state/store";
import type { Tile } from "../state/store";

type TileHUDProps = {
  tileId: string|null;
  onClose?: () => void;
};

export default function TileHUD({ tileId, onClose }: TileHUDProps) {
  const { tiles } = useGameStore();
  const tile = tiles.find(t => t.id === tileId);
  if (!tile) return null;

  // Couleurs vives pour les terrains
  const color = tile.terrain === "PLAINS" ? "#4ade80" : tile.terrain === "MOUNTAIN" ? "#818cf8" : "#facc15";
  const owner = tile.owner ? (tile.owner === 1 ? "Joueur 1" : "Joueur 2") : "Neutre";

  return (
    <aside className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-80 bg-[#20274a] border border-blue-900 rounded-xl p-6 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Détail de la tuile</h2>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl font-bold">×</button>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-700" style={{background: color}}></span>
        <span className="font-semibold text-white/90">{tile.terrain === "PLAINS" ? "Plaine" : tile.terrain === "MOUNTAIN" ? "Montagne" : "Désert"}</span>
      </div>
      <div className="mb-2 text-white/80">Propriétaire : <b className="text-white">{owner}</b></div>
      <div className="mb-2 text-white/80">Puissance : <b className="text-cyan-300">{tile.power}</b></div>
      <div className="mb-2 text-white/80">Population : <b className="text-blue-400 font-bold">{tile.pop ?? 0}</b></div>
      <div className="mb-4 text-white/80">Économie : <b className="text-yellow-300">{tile.city ? tile.city * 2 : 0}</b></div>
      <button className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold mt-2 transition">Acheter un bâtiment (+économie)</button>
    </aside>
  );
}
