

import { create } from "zustand";
import { generateMap } from "../game/map";
import { canSelect, canAttack, resolveAttack, checkWinner, endTurnGrowth } from "../game/rules";




function nextPlayer(cur: PlayerID, order: PlayerID[]) {
  const i = order.indexOf(cur);
  return order[(i + 1) % order.length];
}
function durationFor(pid: PlayerID, strikes: Record<PlayerID, number>) {
  const s = strikes[pid] ?? 0;
  if (s >= 2) return 15;
  if (s === 1) return 30;
  return 60;
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
  // Extended for AFK/turn logic:
  players: PlayerID[];
  strikes: Record<PlayerID, number>;
  timerSeed: number;
  turn: number;
  gold: Record<PlayerID, number>;
};

const initial: GameState = {
  tiles: [],
  cols: 0,
  rows: 0,
  players: [1,2],
  currentPlayer: 1,
  turn: 1,
  strikes: {1:0,2:0,3:0,4:0},
  gold: {1:0,2:0,3:0,4:0},
  selectedId: undefined,
  winner: undefined,
  timerSeed: 0,
};

type Actions = {
  initIfNeeded: (cfg: {cols:number;rows:number;terrainWeights:Record<Terrain,number>;players:number[]}) => void;
  select: (id: string) => void;
  clickTile: (id: string) => void;
  endTurn: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState & Actions & {
  getDurationFor: (pid: PlayerID) => number;
}>((set, get) => ({
  ...initial,
  initIfNeeded: (cfg) => {
    const s = get();
    if (s.tiles.length > 0) return;
    const tiles = generateMap(cfg);
    const order: PlayerID[] = ("players" in cfg && (cfg as any).players?.length)
      ? ((cfg as any).players as PlayerID[])
      : [1,2];
    set({
      tiles,
      cols: cfg.cols, rows: cfg.rows,
      players: order,
      currentPlayer: order[0],
      turn: 1,
      strikes: {1:0,2:0,3:0,4:0},
      gold: {1:0,2:0,3:0,4:0},
      winner: undefined, selectedId: undefined,
      timerSeed: Math.random(),
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
  endTurn: (opts?: { afk?: boolean }) => {
    const s = get();
    if (s.winner) return;
    const me = s.currentPlayer;
    let strikes = { ...s.strikes };
    if (opts?.afk) {
      // AFK: on ajoute un strike
      const cur = strikes[me] ?? 0;
      strikes[me] = cur + 1;
      if (strikes[me] >= 3) {
        const other = s.players.find(p => p !== me) ?? me;
        set({ strikes, winner: other });
        return;
      }
    } else {
      // Si le joueur joue, on reset ses strikes
      strikes[me] = 0;
    }
    const resetTiles = s.tiles.map(t => ({ ...t, hasActed: false }));
    const grown = endTurnGrowth(resetTiles, me);
    const nxt = nextPlayer(me, s.players);
    set({
      tiles: grown,
      strikes,
      selectedId: undefined,
      currentPlayer: nxt,
      timerSeed: Math.random(),
      turn: s.turn + (nxt === s.players[0] ? 1 : 0),
    });
  },
  reset: () => set({ ...initial, timerSeed: Math.random() }),

  getDurationFor: (pid: PlayerID) => durationFor(pid, get().strikes),
}));
