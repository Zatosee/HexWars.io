import React from "react";
import { useGameStore } from "../state/store";
import type { Tile } from "../state/store";

export default function TileHUD() {
  const { tiles, selectedId, currentPlayer } = useGameStore();
  const tile = tiles.find(t => t.id === selectedId);
  // Afficher le HUD seulement si la tuile appartient au joueur courant
  if (!tile || tile.owner !== currentPlayer) return null;

  // Couleurs vives pour les terrains
  const color = tile.terrain === "PLAINS" ? "#4ade80" : tile.terrain === "MOUNTAIN" ? "#818cf8" : "#facc15";
  const owner = tile.owner ? (tile.owner === 1 ? "Joueur 1" : "Joueur 2") : "Neutre";

  return (
    <aside className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-80 bg-[#20274a] border border-blue-900 rounded-xl p-6 text-white animate-fade-in">
      <h2 className="text-lg font-bold mb-3">Détail de la tuile</h2>
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
