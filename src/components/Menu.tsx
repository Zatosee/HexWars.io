import { useState } from "react";

export type StartConfig = {
  cols: number;
  rows: number;
  players: number[];
  difficulty: "easy" | "normal" | "hard";
  terrainWeights: Record<"PLAINS"|"MOUNTAIN"|"DESERT", number>;
  mapSize?: "small"|"medium"|"large";
};

const DEFAULT_TERRAIN: StartConfig["terrainWeights"] = {
  PLAINS: 0.6, MOUNTAIN: 0.2, DESERT: 0.2,
};

export default function Menu({ onStart }: { onStart: (cfg: StartConfig) => void }) {
  const [tab, setTab] = useState<"quick"|"custom"|"ranked">("quick");
  const [mapSize, setMapSize] = useState<"small"|"medium"|"large">("small");
  const [bots, setBots] = useState(1); // 0..3
  const [difficulty, setDifficulty] = useState<"easy"|"normal"|"hard">("normal");

  const startQuick = () => {
    onStart({
      cols: 11,
      rows: 9,
      players: [1, 2],
      difficulty: "normal",
      terrainWeights: DEFAULT_TERRAIN,
    });
  };

  const sizePresets = {
    small: { cols: 11, rows: 9 },
    medium: { cols: 15, rows: 13 },
    large: { cols: 19, rows: 17 },
  };
  const startCustom = () => {
    const players = [1, 2, 3, 4].slice(0, bots + 1);
    const { cols: presetCols, rows: presetRows } = sizePresets[mapSize];
    onStart({
      cols: presetCols, rows: presetRows, players, difficulty,
      terrainWeights: DEFAULT_TERRAIN,
      mapSize,
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-visible">
      <div className="pointer-events-none absolute inset-0 z-0">
        <span className="absolute left-[8%] top-[10%] w-40 h-32 opacity-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-[20%]" style={{clipPath:'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}}></span>
        <span className="absolute right-[10%] top-[18%] w-40 h-32 opacity-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-[20%]" style={{clipPath:'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}}></span>
        <span className="absolute left-[20%] bottom-[12%] w-40 h-32 opacity-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-[20%]" style={{clipPath:'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}}></span>
        <span className="absolute right-[16%] bottom-[18%] w-40 h-32 opacity-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-[20%]" style={{clipPath:'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}}></span>
        <span className="absolute left-1/2 top-[45%] w-40 h-32 opacity-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-[20%] -translate-x-1/2" style={{clipPath:'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)'}}></span>
      </div>
  <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-blue-800 rounded-3xl shadow-lg p-8 w-full max-w-xl mt-0">
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 min-w-0 py-2 rounded-lg font-semibold border border-blue-800 ${tab === "quick" ? "bg-blue-700 text-white" : "bg-white/10 text-gray-200"}`}
            onClick={() => setTab("quick")}
          >
            Partie rapide
          </button>
          <button
            className={`flex-1 min-w-0 py-2 rounded-lg font-semibold border border-yellow-600 ${tab === "ranked" ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white" : "bg-white/10 text-yellow-400"}`}
            onClick={() => setTab("ranked")}
          >
            Jouer (1v1 classé)
          </button>
          <button
            className={`flex-1 min-w-0 py-2 rounded-lg font-semibold border border-blue-800 ${tab === "custom" ? "bg-blue-700 text-white" : "bg-white/10 text-gray-200"}`}
            onClick={() => setTab("custom")}
          >
            Mode solo (vs IA)
          </button>
        </div>
        {tab === "ranked" ? (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-4 mb-2">
            <ul className="text-yellow-200 mb-2">
              <li>Carte : <b>Moyenne (1v1 classé)</b></li>
              <li>Mode : <b>1 contre 1 classé</b></li>
              <li>Nombre de trophées : <b>149 T</b></li>
                <li className="text-red-400 font-bold mt-2">⚠ Quitter la partie entraîne une perte de trophées !</li>

            </ul>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold border border-yellow-600" onClick={() => onStart({
                cols: 15,
                rows: 13,
                players: [1, 2],
                difficulty: "normal",
                terrainWeights: DEFAULT_TERRAIN,
                mapSize: "medium",
                // ranked: true (à gérer côté App)
              })}>Jouer (classé)</button>
            </div>
            
          </div>
        ) : tab === "quick" ? (
          <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4 mb-4">
            <ul className="text-gray-200 mb-2">
              <li>Carte : <b>Petite carte</b></li>
              <li>Mode : <b>1 contre 1</b></li>
            </ul>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold" onClick={startQuick}>Jouer</button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex flex-col text-gray-200 col-span-2">
                <span>Taille de carte</span>
                <select value={mapSize} onChange={e=>setMapSize(e.target.value as any)} className="rounded px-2 py-1 bg-gray-800 text-white">
                  <option value="small">Petite (1v1)</option>
                  <option value="medium">Moyenne (3-4 joueurs)</option>
                  <option value="large">Grande (4 joueurs+)</option>
                </select>
              </label>
            
            
              <label className="flex flex-col text-gray-200">
                <span>IA (0–3)</span>
                <input type="number" min={0} max={3} value={bots} onChange={e=>setBots(+e.target.value)} className="rounded px-2 py-1 bg-gray-800 text-white" />
              </label>
              <label className="flex flex-col text-gray-200">
                <span>Difficulté</span>
                <select value={difficulty} onChange={e=>setDifficulty(e.target.value as any)} className="rounded px-2 py-1 bg-gray-800 text-white">
                  <option value="easy">Facile</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Difficile</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 rounded-lg bg-white/10 text-gray-200 border border-blue-800" onClick={()=>{
                setMapSize("small"); setBots(1); setDifficulty("normal");
              }}>Par défaut</button>
              <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold border border-blue-800" onClick={startCustom}>Lancer</button>
            </div>
          </div>
        )}
        <div className="text-right text-xs text-gray-400 mt-2">Astuce : taille moyenne (11×9) pour débuter.</div>
      </div>
    </div>
  );
}
