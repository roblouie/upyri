import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

const context = new OffscreenCanvas(1,1).getContext('2d')!;

// DO NOT USE FOR REAL TIME COLOR CHANGES
// This is a very small way to convert color but not a fast one obviously
export function hexToWebgl(hex: string): number[] {
  // @ts-ignore
  context.clearRect(0, 0, 1, 1);
  // @ts-ignore
  context.fillStyle = hex;
  // @ts-ignore
  context.fillRect(0, 0, 1, 1);
  // @ts-ignore
  return [...context.getImageData(0, 0, 1, 1).data].map(val => val / 255);
}

export function doTimes(times: number, callback: (index: number) => void) {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function moveValueTowardsTarget(currentValue: number, maxValue: number, step: number) {
  const isIncrease = maxValue >= currentValue;
  if (isIncrease) {
    return Math.min(currentValue + step, maxValue);
  }
  return Math.max(currentValue - step, maxValue);
}

export function radsToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function unormalizedNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  const u = points[2].clone_().subtract(points[1]);
  const v = points[0].clone_().subtract(points[1]);
  return new EnhancedDOMPoint().crossVectors(u, v);
}

export function calculateFaceNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  return unormalizedNormal(points).normalize_();
}

export function calculateVertexNormals(points: EnhancedDOMPoint[], indices: number[] | Uint16Array): EnhancedDOMPoint[] {
  const vertexNormals = points.map(_ => new EnhancedDOMPoint());
  for (let i = 0; i < indices.length; i+= 3) {
    const faceNormal = unormalizedNormal([points[indices[i]], points[indices[i + 1]], points[indices[i + 2]]]);
    vertexNormals[indices[i]].add_(faceNormal);
    vertexNormals[indices[i + 1]].add_(faceNormal);
    vertexNormals[indices[i + 2]].add_(faceNormal);
  }

  return vertexNormals.map(vector => vector.normalize_());
}