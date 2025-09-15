import type { Axial, Terrain, Tile, PlayerID } from "../state/store";

export function axialToPixel(a: Axial, size = 26) {
  const x = size * Math.sqrt(3) * (a.q + a.r / 2);
  const y = size * (3 / 2) * a.r;
  return { x, y };
}

export function hexPolygonPoints(a: Axial, size = 26, gap = 2): string {
  const { x: cx, y: cy } = axialToPixel(a, size);
  const R = size - gap;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    pts.push({ x, y });
  }
  return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

export function isNeighbor(a: Axial, b: Axial) {
  const directions = [
    { q: +1, r: 0 }, { q: +1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: +1 }, { q: 0, r: +1 },
  ];
  return directions.some(d => a.q + d.q === b.q && a.r + d.r === b.r);
}
