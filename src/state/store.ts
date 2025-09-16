

import { create } from "zustand";
import { generateMap } from "../game/map";
import { canSelect, canAttack, resolveAttack, checkWinner, endTurnGrowth } from "../game/rules";




function nextPlayer(cur: PlayerID, order: PlayerID[]) {
  const i = order.indexOf(cur);
  return order[(i + 1) % order.length];
}


export type PlayerID = 1 | 2 | 3 | 4;
export type Terrain = "PLAINS" | "MOUNTAIN" | "DESERT";
export type Axial = { q: number; r: number };
export type Tile = {
  id: string;
  axial: Axial;
  terrain: Terrain;
  owner?: PlayerID;
  power: number;
  pop?: number;
  city?: number;
  hasActed?: boolean; // true if this tile has acted this turn
};

export type GameState = {
  tiles: Tile[];
  cols: number;
  rows: number;
  currentPlayer: PlayerID;
  selectedId?: string;
  winner?: PlayerID;
  players: PlayerID[];
  turn: number;
  gold: Record<PlayerID, number>;
  playerColors: Record<PlayerID, string>;
  playerColorsLight: Record<PlayerID, string>;
};

const initial: GameState = {
  tiles: [],
  cols: 0,
  rows: 0,
  players: [1,2],
  currentPlayer: 1,
  turn: 1,
  gold: {1:0,2:0,3:0,4:0},
  selectedId: undefined,
  winner: undefined,
  playerColors: {1:'#4aa8ff',2:'#ff4646',3:'#ffdd33',4:'#50dc78'},
  playerColorsLight: {1:'#a3d8ff',2:'#ffb3b3',3:'#fff7b3',4:'#a3ffd8'},
};

type Actions = {
  initIfNeeded: (cfg: {cols:number;rows:number;terrainWeights:Record<Terrain,number>;players:number[]}) => void;
  select: (id: string) => void;
  clickTile: (id: string) => void;
  endTurn: () => void;
  reset: () => void;
  buildOnTile: (tileId: string, type: number) => void; // type: 1=aéroport, 2=hotel, 3=muraille
};

export const useGameStore = create<GameState & Actions>((set, get) => ({
  ...initial,
  initIfNeeded: (cfg) => {
    const s = get();
    if (s.tiles.length > 0) return;
    const tiles = generateMap(cfg);
    const order: PlayerID[] = ("players" in cfg && (cfg as any).players?.length)
      ? ((cfg as any).players as PlayerID[])
      : [1,2];
    // Génération dynamique des couleurs
    function randomColor() {
      // HSL: luminosité > 55%, saturation < 80%, évite noir/violet
      const hue = Math.floor(Math.random()*360);
      const sat = 60 + Math.floor(Math.random()*20);
      const lum = 55 + Math.floor(Math.random()*25);
      return `hsl(${hue},${sat}%,${lum}%)`;
    }
    function lightenColor(hsl:string) {
      // hsl(x,y%,z%) => hsl(x,y%,z+25%)
      const m = hsl.match(/hsl\((\d+),(\d+)%?,(\d+)%?\)/);
      if (!m) return hsl;
      const [h,s,l] = [m[1],m[2],m[3]];
      return `hsl(${h},${s}%,${Math.min(95,parseInt(l)+25)}%)`;
    }
    const playerColors: Record<PlayerID,string> = {};
    const playerColorsLight: Record<PlayerID,string> = {};
    order.forEach(pid => {
      let col = randomColor();
      // Si trop sombre, recommence
      let lum = parseInt(col.match(/(\d+)%\)$/)?.[1]||'60');
      while (lum < 50) { col = randomColor(); lum = parseInt(col.match(/(\d+)%\)$/)?.[1]||'60'); }
      playerColors[pid] = col;
      playerColorsLight[pid] = lightenColor(col);
    });
    set({
      tiles,
      cols: cfg.cols, rows: cfg.rows,
      players: order,
      currentPlayer: order[0],
      turn: 1,
      gold: {1:0,2:0,3:0,4:0},
      winner: undefined, selectedId: undefined,
      playerColors,
      playerColorsLight,
    });
  },
  select: (id: string) => {
    const { tiles, currentPlayer } = get();
    const t = tiles.find(x => x.id === id);
    if (!t) return;
    if (canSelect(t, currentPlayer)) {
      set({ selectedId: id });
    }
  },
  clickTile: (id: string) => {
    const { tiles, selectedId, currentPlayer } = get();
    const target = tiles.find(t => t.id === id);
    if (!target) return;
    if (!selectedId) {
      if (canSelect(target, currentPlayer)) set({ selectedId: id });
      return;
    }
    const from = tiles.find(t => t.id === selectedId)!;
    if (from.id === target.id) {
      set({ selectedId: undefined });
      return;
    }
    // If moving to another of your own tiles: move half the troops (rounded down)
    if (from.owner === currentPlayer && target.owner === currentPlayer && from.id !== target.id) {
      if (from.hasActed) {
        set({ selectedId: undefined });
        return;
      }
      const move = Math.floor(from.power / 2);
      if (move > 0) {
        const newFrom = { ...from, power: from.power - move, hasActed: true };
        const newTo = { ...target, power: Math.min(10, target.power + move) };
        const newTiles: Tile[] = tiles.map(t => {
          if (t.id === newFrom.id) return newFrom;
          if (t.id === newTo.id) return newTo;
          return t;
        });
        set({ tiles: newTiles, selectedId: undefined });
      } else {
        set({ selectedId: undefined });
      }
      return;
    }
    // Attack/capture logic
    if (canAttack(from, target)) {
      if (from.hasActed) {
        set({ selectedId: undefined });
        return;
      }
      // Special capture: if defender has less than half the attacker's power, only half the attacker's troops move, rest stay
      if (target.owner !== currentPlayer && target.power < Math.floor(from.power / 2)) {
        const move = Math.floor(from.power / 2);
        const newFrom = { ...from, power: from.power - move, hasActed: true };
        const newTo = { ...target, owner: currentPlayer, power: move, hasActed: true };
        const newTiles: Tile[] = tiles.map(t => {
          if (t.id === newFrom.id) return newFrom;
          if (t.id === newTo.id) return newTo;
          return t;
        });
        const winner = checkWinner(newTiles);
        set({ tiles: newTiles, selectedId: undefined, winner });
        return;
      }
      // Default attack/capture logic
      const { from: newFrom, to: newTo } = resolveAttack(from, target);
      newFrom.hasActed = true;
      let newToFinal = { ...newTo };
      if (newTo.owner === currentPlayer && newTo.id !== newFrom.id) {
        newToFinal.hasActed = true;
      }
      const newTiles: Tile[] = tiles.map(t => {
        if (t.id === newFrom.id) return newFrom;
        if (t.id === newTo.id) return newToFinal;
        return t;
      });
      const winner = checkWinner(newTiles);
      set({ tiles: newTiles, selectedId: undefined, winner });
    } else {
      if (canSelect(target, currentPlayer)) {
        set({ selectedId: target.id });
      } else {
        set({ selectedId: undefined });
      }
    }
  },
  endTurn: () => {
    const s = get();
    if (s.winner) return;
    const me = s.currentPlayer;
    const resetTiles = s.tiles.map(t => ({ ...t, hasActed: false }));
    const grown = endTurnGrowth(resetTiles, me);
    // Gold generation: 1 gold per owned tile, +1 per building (city > 0), for ALL players
    let gold = { ...s.gold };
    for (const pid of s.players) {
      const ownedTiles = grown.filter(t => t.owner === pid);
      let goldGain = 0;
      for (const t of ownedTiles) {
        goldGain += 1;
        if (t.city && t.city > 0) goldGain += 1;
      }
      gold[pid] = (gold[pid] ?? 0) + goldGain;
    }
    const nxt = nextPlayer(me, s.players);
    set({
      tiles: grown,
      gold,
      selectedId: undefined,
      currentPlayer: nxt,
      turn: s.turn + (nxt === s.players[0] ? 1 : 0),
    });
  },
  reset: () => set({ ...initial }),

  buildOnTile: (tileId: string, type: number) => {
    const s = get();
    const tile = s.tiles.find((t: Tile) => t.id === tileId);
    if (!tile) return;
    if (!tile.owner || tile.owner !== s.currentPlayer) return;
    if (tile.city && tile.city > 0) return; // déjà un bâtiment
    // prix : aéroport=50, hotel=50, muraille=25
    const prices: Record<number, number> = {1: 50, 2: 50, 3: 25};
    const price = prices[type] || 50;
    if ((s.gold[s.currentPlayer] ?? 0) < price) return;
    // payer
    const newGold = {...s.gold, [s.currentPlayer]: s.gold[s.currentPlayer] - price};
    // maj tuile
    const newTiles = s.tiles.map((t: Tile) => t.id === tileId ? {...t, city: type} : t);
    set({ tiles: newTiles, gold: newGold });
  },

}));
