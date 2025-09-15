
import type { Tile, Terrain, PlayerID, Axial } from "../state/store";
// Génère une liste de coordonnées hexagonales selon une forme et une orientation aléatoire
function generateShape(shape: "circle"|"semicircle"|"thin"|"random", cols: number, rows: number): Axial[] {
  const coords: Axial[] = [];
  const centerQ = Math.floor(cols / 2);
  const centerR = Math.floor(rows / 2);
  const radius = Math.min(cols, rows) / 2 - 1;
  // Orientation aléatoire (rotation 0, 60, 120, 180, 240, 300°)
  const rotations = [0, 1, 2, 3, 4, 5];
  const rot = rotations[Math.floor(Math.random()*rotations.length)];
  // Pour demi-cercle, choisir haut/bas/gauche/droite aléatoirement
  const semicircleDir = ["top","bottom","left","right"][Math.floor(Math.random()*4)];
  const pick = shape === "random" ? ["circle","semicircle","thin"][Math.floor(Math.random()*3)] : shape;
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      // Décalage pour centrer
      let dq = q - centerQ;
      let dr = r - centerR;
      // Appliquer une rotation aléatoire sur l'axe hex
      for (let i = 0; i < rot; i++) {
        [dq, dr] = [-dr, dq + dr];
      }
      if (pick === "circle") {
        if (dq*dq + dr*dr <= radius*radius) coords.push({q, r});
      } else if (pick === "semicircle") {
        // Demi-cercle dans une direction aléatoire
        let inSemi = false;
        if (semicircleDir === "top") inSemi = dr <= 0;
        else if (semicircleDir === "bottom") inSemi = dr >= 0;
        else if (semicircleDir === "left") inSemi = dq <= 0;
        else if (semicircleDir === "right") inSemi = dq >= 0;
        if (inSemi && dq*dq + dr*dr <= radius*radius) coords.push({q, r});
        else if (!inSemi && Math.random() < 0.15 && dq*dq + dr*dr <= radius*radius) coords.push({q, r});
      } else if (pick === "thin") {
        // Bande fine aléatoire, orientation aléatoire
        if (Math.abs(dq) < 2 + Math.random()*2 && Math.abs(dr) < radius) coords.push({q, r});
      }
    }
  }
  // Mélange fort pour éviter la monotonie
  return coords.sort(()=>Math.random()-0.5);
}

export function pickTerrain(weights: Record<Terrain, number>): Terrain {
  const entries = Object.entries(weights) as Array<[Terrain, number]>;
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  const r = Math.random() * sum;
  let acc = 0;
  for (const [t, w] of entries) {
    acc += w;
    if (r <= acc) return t;
  }
  return "PLAINS";
}

export function generateMap(cfg: {cols:number;rows:number;terrainWeights:Record<Terrain,number>;players:number[]; mapSize?: "small"|"medium"|"large" }): Tile[] {
  const tiles: Tile[] = [];
  let { cols, rows, terrainWeights, mapSize } = cfg;
  // Préréglages selon la taille
  if (mapSize === "small") { cols = 11; rows = 9; }
  else if (mapSize === "medium") { cols = 15; rows = 13; }
  else if (mapSize === "large") { cols = 19; rows = 17; }

  // Forme selon la taille et le nombre de joueurs
  let shape: "circle"|"semicircle"|"thin"|"random"|"split" = "circle";
  if (mapSize === "small") shape = "circle";
  else if (mapSize === "medium") shape = Math.random() < 0.5 ? "circle" : "semicircle";
  else if (mapSize === "large") shape = Math.random() < 0.5 ? "circle" : "thin";
  // Plus tard : split = carte coupée en deux (eau)
  // TODO: ajouter la forme "split" pour l'eau/avion
  const coords = generateShape(shape, cols, rows);
  for (const {q, r} of coords) {
    const terrain = pickTerrain(terrainWeights);
    tiles.push({
      id: `${q},${r}`,
      axial: { q, r },
      terrain,
      owner: undefined,
      power: 0,
    });
  }
  // Génération de points de spawn vraiment aléatoires sur la carte générée
  const available = [...tiles];
  const spots: {q:number, r:number}[] = [];
  for (let i = 0; i < cfg.players.length; i++) {
    // Prend une tuile au hasard parmi les plus éloignées des autres spawns déjà placés
    let best: Tile|undefined;
    let maxDist = -1;
    for (const t of available) {
      let minDist = Infinity;
      for (const s of spots) {
        const d = Math.abs(t.axial.q - s.q) + Math.abs(t.axial.r - s.r);
        if (d < minDist) minDist = d;
      }
      if (minDist > maxDist) { maxDist = minDist; best = t; }
    }
    if (best) {
      spots.push(best.axial);
      // Retire la tuile pour éviter double spawn
      const idx = available.findIndex(tt => tt.id === best!.id);
      if (idx !== -1) available.splice(idx, 1);
    }
  }
  cfg.players.slice(0, 4).forEach((pid, i) => {
    // Cherche la tuile la plus proche du spot choisi
    let minDist = Infinity, best: Tile|undefined;
    for (const t of tiles) {
      const d = Math.abs(t.axial.q - spots[i].q) + Math.abs(t.axial.r - spots[i].r);
      if (d < minDist) { minDist = d; best = t; }
    }
    if (best) { best.owner = pid as PlayerID; best.power = 8; best.terrain = "PLAINS"; }
  });
  return tiles;
}
