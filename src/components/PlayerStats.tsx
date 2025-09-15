
import { useGameStore } from "../state/store";

export default function PlayerStats() {
  const { tiles, currentPlayer, gold } = useGameStore();
  // Filtrer les tuiles du joueur courant
  const myTiles = tiles.filter(t => t.owner === currentPlayer);
  const totalTroops = myTiles.reduce((sum, t) => sum + t.power, 0);
  // Comptage des bâtiments
  const nbAeroports = myTiles.filter(t => t.city === 1).length;
  const nbHotels = myTiles.filter(t => t.city === 2).length;
  // const nbMurailles = myTiles.filter(t => t.city === 3).length; // pour plus tard
  const totalCases = myTiles.length;
  const percent = tiles.length > 0 ? Math.round((myTiles.length / tiles.length) * 100) : 0;

  return (
    <div className="bg-[#20274a] border border-blue-900 rounded-xl p-6 text-white w-80">
      <h3 className="text-lg font-bold mb-4">Stats Joueur {currentPlayer}</h3>
      <ul className="space-y-2 text-base">
  <li><b>Or :</b> {gold?.[currentPlayer] ?? 0}</li>
  <li><b>Troupes totales :</b> {totalTroops}</li>
  <li><b>Nombre d’aéroports :</b> {nbAeroports}</li>
  <li><b>Nombre d’hôtels :</b> {nbHotels}</li>
  <li><b>Cases contrôlées :</b> {totalCases}</li>
  <li><b>% de la carte :</b> {percent}%</li>
      </ul>
    </div>
  );
}
