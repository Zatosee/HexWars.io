import type { Tile, PlayerID, Terrain } from "../state/store";
import { isNeighbor } from "./hex";

export function canSelect(tile: Tile, player: PlayerID) {
  return tile.owner === player && tile.power > 0;
}

export function canAttack(from: Tile, to: Tile) {
  return from.owner !== undefined && to.owner !== from.owner && isNeighbor(from.axial, to.axial) && from.power > 0;
}

export function resolveAttack(from: Tile, to: Tile): { from: Tile; to: Tile } {
  const atk = from.power;
  const def = to.power;
  if (atk > def) {
    // Capture: attacker > defender
    const remaining = Math.max(1, atk - def);
    const newFrom: Tile = { ...from, power: 0 };
    const newTo: Tile = { ...to, owner: from.owner, power: remaining };
    return { from: newFrom, to: newTo };
  } else {
    // New rule: attacker <= defender, cannot capture, only weaken
    // Attacker drops to 1, defender loses (attacker-1), but not below 1
    const attackUsed = Math.max(1, atk - 1);
    const newFrom: Tile = { ...from, power: 1 };
    const newTo: Tile = { ...to, power: Math.max(1, def - attackUsed) };
    return { from: newFrom, to: newTo };
  }
}

export function checkWinner(tiles: Tile[]): PlayerID | undefined {
  const owners = new Set(tiles.filter(t => t.owner).map(t => t.owner as PlayerID));
  if (owners.size === 1) return [...owners][0];
  return undefined;
}

export function endTurnGrowth(all: Tile[], player: PlayerID): Tile[] {
  return all.map(tile => {
    if (tile.owner !== player) return tile;
    return { ...tile, power: Math.min(10, tile.power + (tile.terrain === "PLAINS" ? 1 : 0)) };
  });
}
