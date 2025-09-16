
import React, { useState } from "react";
import RulesModal from "./components/RulesModal";
import PlayerStats from "./components/PlayerStats";
import Menu from "./components/Menu";
import type { StartConfig } from "./components/Menu";
import HexGrid from "./components/HexGrid";
import TileHUD from "./components/TileHUD";
import { useGameStore } from "./state/store";



export default function App() {
  const [infoTileId, setInfoTileId] = useState<string|null>(null);
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const { initIfNeeded, currentPlayer, endTurn, reset, winner } = useGameStore();

  const handleStart = (cfg: StartConfig) => {
    reset();
    initIfNeeded({
      cols: cfg.cols,
      rows: cfg.rows,
      terrainWeights: cfg.terrainWeights,
      players: cfg.players,
    });
    setScreen("game");
  };

  // Pseudo state
  const [pseudo, setPseudo] = useState(() => localStorage.getItem("pseudo") || "Joueur");

  const [rulesOpen, setRulesOpen] = useState(false);


  // Reset timer and missed count if player acts (endTurn called by button or action)
  const handleEndTurn = React.useCallback(() => {
    endTurn();
  }, [endTurn]);

  // Reset timer on player change or game reset

  if (screen === "menu")
    return (
      <div className="min-h-screen flex flex-col bg-[#181e3a] relative overflow-hidden">
        {/* Lumières/flous de fond */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-[-10%] top-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-400 opacity-20 blur-3xl" style={{filter:'blur(120px)'}}></div>
          <div className="absolute right-[-10%] top-[10%] w-[350px] h-[350px] rounded-full bg-blue-600 opacity-20 blur-3xl" style={{filter:'blur(100px)'}}></div>
          <div className="absolute left-[20%] bottom-[-10%] w-[300px] h-[300px] rounded-full bg-fuchsia-500 opacity-15 blur-3xl" style={{filter:'blur(100px)'}}></div>
          <div className="absolute right-[15%] bottom-[-8%] w-[250px] h-[250px] rounded-full bg-indigo-400 opacity-15 blur-3xl" style={{filter:'blur(80px)'}}></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Header titre + version */}
          <header className="w-full flex flex-col items-center pt-2 pb-0">
            <h1 className="text-6xl font-extrabold tracking-widest text-white mb-2 drop-shadow-lg" style={{fontFamily:'Orbitron, sans-serif', letterSpacing:'0.15em'}}>Hexwars<span className="opacity-80 font-semibold">.io</span></h1>
            <span className="text-xs text-blue-200 tracking-widest mb-4">v0.1.2</span>
          </header>
          {/* Bloc pseudo style OpenFront */}
          <div className="flex flex-row items-center justify-center w-full max-w-4xl mb-8">
            <div className="flex flex-row items-center bg-[#1a2240] border border-blue-900 rounded-xl px-7 py-3 shadow-xl w-full max-w-xs" style={{boxShadow:'0 4px 24px 0 #1e293b55'}}>
              <label htmlFor="pseudo" className="text-base text-white font-bold mr-3 whitespace-nowrap " style={{fontFamily:'Orbitron, sans-serif', letterSpacing:'0.15em'}}>Pseudo :</label>
              <input
                id="pseudo"
                className="border-none rounded-md px-3 py-2 text-lg font-bold text-white bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-inner flex-1 min-w-0 placeholder-white"
                value={pseudo}
                onChange={e => {
                  setPseudo(e.target.value);
                  localStorage.setItem("pseudo", e.target.value);
                }}
                maxLength={16}
                autoComplete="off"
              />
            </div>
          </div>
          {/* Menu principal centré */}
          <main className="flex flex-col items-center w-full">
            <Menu onStart={handleStart} />
            <button
              className="w-full max-w-xs mt-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-lg border border-yellow-600 shadow-none mb-2 hover:from-yellow-600 hover:to-orange-700 transition"
              disabled
            >
              Leaderboard (à venir)
            </button>
            <button className="w-full max-w-xs py-3 rounded-xl bg-blue-700 text-white font-bold text-lg shadow border border-blue-800">Créer un salon (partie personnalisée)</button>
            <button className="w-full max-w-xs mt-3 py-2 rounded-xl bg-white/10 text-blue-200 font-semibold text-base border border-blue-800">Instructions</button>
          </main>
        </div>
        {/* Footer */}
        <footer className="w-full flex flex-col items-center pb-4 mt-8">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-blue-200">
            <button onClick={()=>setRulesOpen(true)} className="hover:underline">Comment jouer</button>
            <a href="#" className="hover:underline">Wiki</a>
            <span>©HexWars™</span>
            <a href="#" className="hover:underline">Conditions d'utilisation</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </footer>
        <RulesModal open={rulesOpen} onClose={()=>setRulesOpen(false)} />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#181c2b]">
      {/* Indicateur couleur joueur en haut à gauche */}
      <div className="absolute top-6 left-6 z-40 flex flex-col gap-2">
        {[1,2,3,4].map(num => {
          const colors = ["#4aa8ff","#ff4646","#ffdd33","#50dc78"];
          return (
            <div key={num} className="flex items-center gap-2">
              <span style={{width:24,height:24,background:colors[num-1],borderRadius:6,display:'inline-block',border:'2px solid #fff'}}></span>
              <span className="text-white font-bold text-base" style={{fontFamily:'Orbitron, sans-serif'}}>
                Joueur {num}
              </span>
            </div>
          );
        })}
      </div>
  {/* Header supprimé pour agrandir l'aire de jeu */}
      {winner ? (
        <div className="text-center bg-green-700 text-white py-2 text-lg font-bold">🎉 Victoire du Joueur {winner} !</div>
      ) : null}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-1 w-full max-w-full min-h-[80vh] rounded-2xl bg-[#20274a] p-6 m-0 relative">
          {/* Indication du tour du joueur en bas à gauche de l'aire de jeu, padding/margin ajusté */}
          <div className="absolute bottom-10 left-8 z-30">
            <span className="px-6 py-2 rounded-lg bg-blue-900/80 text-white text-base font-semibold shadow-lg border border-blue-700" style={{fontFamily:'Orbitron, sans-serif', letterSpacing:'0.05em'}}>
              Tour du joueur {currentPlayer === 1 ? (pseudo || "Joueur 1") : "Joueur 2"}
            </span>
          </div>
          <HexGrid onTileInfo={setInfoTileId} />
          {/* Sidebar stats + HUD en colonne */}
          <div className="hidden md:flex flex-col w-80 ml-8">
            <PlayerStats />
            <TileHUD tileId={infoTileId} onClose={() => setInfoTileId(null)} />
          </div>
          {/* Boutons en bas à droite */}
          <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-3 items-end">
            <button
              className="bg-white/10 px-5 py-2 rounded-xl shadow border-2 border-blue-800 hover:bg-blue-800/30 transition text-white font-bold text-lg"
              onClick={handleEndTurn}
              disabled={false}
            >Fin du tour</button>
            <button className="bg-red-700 px-5 py-2 rounded-xl shadow border-2 border-red-800 hover:bg-red-800/80 transition text-white font-bold text-lg" onClick={() => {
              reset();
              setScreen("menu");
            }}>Quitter la partie</button>
          </div>
        </div>
      </main>
  <footer className="text-center text-xs text-gray-500 p-0"></footer>
    </div>
  );
}
