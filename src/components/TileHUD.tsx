
import { useGameStore } from "../state/store";

type TileHUDProps = {
  tileId: string|null;
  onClose?: () => void;
};

export default function TileHUD({ tileId, onClose }: TileHUDProps) {
  const { tiles, currentPlayer, gold, buildOnTile } = useGameStore();
  const tile = tiles.find(t => t.id === tileId);
  if (!tile) return null;
  const isOwned = tile.owner === currentPlayer;
  const hasBuilding = tile.city && tile.city > 0;

  // Couleurs vives pour les terrains
  const color = tile.terrain === "PLAINS" ? "#4ade80" : tile.terrain === "MOUNTAIN" ? "#818cf8" : "#facc15";
  const owner = tile.owner ? (tile.owner === 1 ? "Joueur 1" : "Joueur 2") : "Neutre";

  // Calcul de l'or généré par la tuile
  let goldGen = 0;
  if (tile.owner) {
    goldGen = 1;
    if (tile.city === 1) goldGen += 1; // aéroport
    if (tile.city === 2) goldGen += 2; // hôtel
    // muraille (city === 3) n'augmente pas l'or
  }

  // Prix des bâtiments
  const prices = { 1: 50, 2: 50, 3: 25 };
  const canBuild = isOwned && !hasBuilding;
  const playerGold = gold?.[currentPlayer] ?? 0;

  // Description du bâtiment
  let buildingDesc = null;
  if (tile.city === 1) buildingDesc = <div className="mb-2 text-blue-300">🏢 <b>Aéroport</b> : +1 or/tour. Un seul bâtiment par case.</div>;
  if (tile.city === 2) buildingDesc = <div className="mb-2 text-pink-300">🏨 <b>Hôtel</b> : +2 or/tour. Un seul bâtiment par case.</div>;
  if (tile.city === 3) buildingDesc = <div className="mb-2 text-yellow-300">🛡️ <b>Muraille</b> : rend la case deux fois plus difficile à capturer. Un seul bâtiment par case.</div>;

  return (
  <aside className="w-80 bg-[#20274a] border border-blue-900 rounded-xl p-6 text-white animate-fade-in shadow-xl mt-8">
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
      <div className="mb-2 text-white/80">Or généré : <b className="text-yellow-300">{goldGen}</b> <span className="text-xs text-white/50">/tour</span></div>
      {buildingDesc}

      {/* Choix des bâtiments */}
      <div className="mt-4 space-y-2">
        <button
          className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold transition disabled:opacity-50 mb-2"
          disabled={!canBuild || playerGold < prices[1]}
          onClick={() => buildOnTile(tile.id, 1)}
        >Acheter un aéroport ({prices[1]} or)</button>
        <button
          className="w-full py-2 rounded-lg bg-pink-700 hover:bg-pink-800 text-white font-bold transition disabled:opacity-50 mb-2"
          disabled={!canBuild || playerGold < prices[2]}
          onClick={() => buildOnTile(tile.id, 2)}
        >Acheter un hôtel ({prices[2]} or)</button>
        <button
          className="w-full py-2 rounded-lg bg-yellow-700 hover:bg-yellow-800 text-white font-bold transition disabled:opacity-50"
          disabled={!canBuild || playerGold < prices[3]}
          onClick={() => buildOnTile(tile.id, 3)}
        >Acheter une muraille ({prices[3]} or)</button>
      </div>
    </aside>
  );
}
