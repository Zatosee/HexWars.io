
import { create } from "zustand";
import { generateMap } from "../game/map";
import { canSelect, canAttack, resolveAttack, checkWinner, endTurnGrowth } from "../game/rules";

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
};
export type GameState = {
  tiles: Tile[];
  cols: number;
  rows: number;
  currentPlayer: PlayerID;
  selectedId?: string;
  winner?: PlayerID;
};

const initial: GameState = {
  tiles: [],
  cols: 0,
  rows: 0,
  currentPlayer: 1,
  selectedId: undefined,
  winner: undefined,
};

type Actions = {
  initIfNeeded: (cfg: {cols:number;rows:number;terrainWeights:Record<Terrain,number>;players:number[]}) => void;
  select: (id: string) => void;
  clickTile: (id: string) => void;
  endTurn: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState & Actions>((set, get) => ({
  ...initial,
  initIfNeeded: (cfg) => {
    const s = get();
    if (s.tiles.length > 0) return;
    const tiles = generateMap(cfg);
    // Ajout pop et city à chaque tuile si absent
    const tilesWithEconomy = tiles.map(t => ({
      ...t,
      pop: t.pop ?? 0,
      city: t.city ?? 0,
    }));
    set({ tiles: tilesWithEconomy, cols: cfg.cols, rows: cfg.rows });
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
    if (canAttack(from, target)) {
      const { from: newFrom, to: newTo } = resolveAttack(from, target);
      const newTiles: Tile[] = tiles.map(t => {
        if (t.id === newFrom.id) return newFrom;
        if (t.id === newTo.id) return newTo;
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
    const { tiles, currentPlayer } = get();
    const grown = endTurnGrowth(tiles, currentPlayer);
    const next = currentPlayer === 1 ? 2 : 1;
    const winner = checkWinner(grown);
    set({ tiles: grown, currentPlayer: next, selectedId: undefined, winner });
  },
  reset: () => set({ ...initial }),
}));
