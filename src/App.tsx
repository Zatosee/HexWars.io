
import React, { useState } from "react";
import RulesModal from "./components/RulesModal";
import PlayerStats from "./components/PlayerStats";
import Menu from "./components/Menu";
import type { StartConfig } from "./components/Menu";
import HexGrid from "./components/HexGrid";
import TileHUD from "./components/TileHUD";
import TurnTimer from "./components/TurnTimer";
import { useGameStore } from "./state/store";



export default function App() {
  const [infoTileId, setInfoTileId] = useState<string|null>(null);
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const { initIfNeeded, currentPlayer, endTurn, reset, winner, strikes, timerSeed } = useGameStore();

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
  const [editPseudo, setEditPseudo] = useState(false);
  const handlePseudoChange = (e: React.FormEvent) => {
    e.preventDefault();
    setEditPseudo(false);
    localStorage.setItem("pseudo", pseudo);
  };

  const [rulesOpen, setRulesOpen] = useState(false);


  // Reset timer and missed count if player acts (endTurn called by button or action)
  const handleEndTurn = React.useCallback(() => {
    endTurn();
  }, [endTurn]);

  // Reset timer on player change or game reset
  // plus besoin de timerKey local, timerSeed du store suffit

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
  <header className="bg-gradient-to-b from-[#22337a] to-[#1a2240] text-white p-4 flex items-center justify-between border-b border-blue-900 shadow-[0_2px_12px_0_rgba(30,41,59,0.18)]">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-extrabold tracking-widest text-white drop-shadow-none ml-2" style={{fontFamily:'Orbitron, sans-serif', letterSpacing:'0.15em'}}>hexwars<span className="opacity-80 font-semibold">.io</span></h1>
        </div>
        <div className="flex gap-2 items-center absolute right-8 top-4">
          <span className={`px-3 py-1 rounded-full font-bold bg-blue-700 text-white shadow-none`}>Joueur {currentPlayer}</span>
          <button
            className="bg-white/10 px-3 py-1 rounded shadow-none border border-blue-800 hover:bg-blue-800/30 transition"
            onClick={handleEndTurn}
            disabled={false /* always enabled for currentPlayer, but you can add logic if needed */}
          >Fin du tour</button>
          <button className="bg-red-700 px-3 py-1 rounded shadow-none border border-red-800 hover:bg-red-800/80 transition text-white font-bold" onClick={() => {
            setStrikes({1:0,2:0,3:0,4:0});
            setTimerKey(k => k + 1);
            setScreen("menu");
          }}>Quitter la partie</button>
        </div>
      </header>
      {winner ? (
        <div className="text-center bg-green-700 text-white py-2 text-lg font-bold">🎉 Victoire du Joueur {winner} !</div>
      ) : null}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-1 w-full max-w-full min-h-[70vh] rounded-b-2xl bg-[#20274a] p-6 m-0 relative">
          <HexGrid onTileInfo={setInfoTileId} />
          {/* Sidebar stats joueur courant */}
          <aside className="hidden md:block w-80 ml-8">
            <PlayerStats />
          </aside>
          {/* Show TileHUD for selected or right-clicked tile */}
          <TileHUD tileId={infoTileId} onClose={() => setInfoTileId(null)} />
          {/* Timer HUD bottom right */}
          <div className="absolute bottom-6 right-6 z-20">
            <TurnTimer
              duration={[60,30,15][strikes[currentPlayer] || 0]}
              onExpire={() => endTurn({ afk: true })}
              currentPlayer={currentPlayer}
              keyReset={timerSeed}
              hud
            />
          </div>
        </div>
        {/* (Bloc règles supprimé, voir modal) */}
      </main>
  <footer className="text-center text-xs text-gray-500 p-0"></footer>
    </div>
  );
}
