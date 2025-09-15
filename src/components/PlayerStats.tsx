import { useGameStore } from "../state/store";

export default function PlayerStats() {
  const { tiles, currentPlayer } = useGameStore();
  // Filtrer les tuiles du joueur courant
  const myTiles = tiles.filter(t => t.owner === currentPlayer);
  const totalTroops = myTiles.reduce((sum, t) => sum + t.power, 0);
  const totalEco = myTiles.reduce((sum, t) => sum + (t.city ?? 0), 0);
  const totalCases = myTiles.length;
  const percent = tiles.length > 0 ? Math.round((myTiles.length / tiles.length) * 100) : 0;

  return (
  <div className="bg-[#20274a] border border-blue-900 rounded-xl p-6 text-white w-80">
      <h3 className="text-lg font-bold mb-4">Stats Joueur {currentPlayer}</h3>
      <ul className="space-y-2 text-base">
        <li><b>Troupes totales :</b> {totalTroops}</li>
        <li><b>Économie :</b> {totalEco}</li>
        <li><b>Cases contrôlées :</b> {totalCases}</li>
        <li><b>% de la carte :</b> {percent}%</li>
      </ul>
    </div>
  );
}
