export function canSelect(tile: Tile, player: PlayerID) {
  return tile.owner === player && tile.power > 0;
}
import type { Tile, PlayerID, Terrain } from "../state/store";
import { isNeighbor } from "./hex";

export function canAttack(from: Tile, to: Tile) {
  return from.owner !== undefined && to.owner !== from.owner && isNeighbor(from.axial, to.axial) && from.power > 0;
}

export function resolveAttack(from: Tile, to: Tile): { from: Tile; to: Tile } {
  let atk = from.power;
  let def = to.power;
  // Apply resistance: mountain = x2, desert = x3
  let resistance = 1;
  if (to.terrain === "MOUNTAIN") resistance = 2;
  if (to.terrain === "DESERT") resistance = 3;
  const effectiveAtk = Math.max(1, Math.floor((atk - 1) / resistance) + 1); // always at least 1 used
  if (atk > def * resistance) {
    // Capture: attacker > defender * resistance
    const remaining = Math.max(1, atk - def * resistance);
    const newFrom: Tile = { ...from, power: 0 };
    const newTo: Tile = { ...to, owner: from.owner, power: remaining };
    return { from: newFrom, to: newTo };
  } else {
    // Only weaken
    const newFrom: Tile = { ...from, power: 1 };
    const newTo: Tile = { ...to, power: Math.max(1, def - effectiveAtk) };
    return { from: newFrom, to: newTo };
  }
}


export function checkWinner(tiles: Tile[]): PlayerID | undefined {
  const owners = new Set(tiles.filter(t => t.owner).map(t => t.owner as PlayerID));
  if (owners.size === 1) return [...owners][0];
  return undefined;
}

export function endTurnGrowth(all: Tile[], player: PlayerID): Tile[] {
  // Each tile needs a turn counter for growth
  return all.map(tile => {
    // Add or increment growthTurn property
    const growthTurn = (tile as any).growthTurn ? (tile as any).growthTurn + 1 : 1;
    let grow = false;
    let growEvery = 0;
    if (tile.terrain === "PLAINS") growEvery = 2;
    if (tile.terrain === "MOUNTAIN") growEvery = 3;
    if (tile.terrain === "DESERT") growEvery = 5;
    if (!tile.owner) {
      // Neutral tile: increment by terrain
      grow = (growthTurn % growEvery === 0);
    } else if (tile.owner === player) {
      // Owned tile: increment by terrain
      grow = (growthTurn % growEvery === 0);
    }
    const newPower = grow ? Math.min(10, tile.power + 1) : tile.power;
    return { ...tile, power: newPower, growthTurn };
  });
}
