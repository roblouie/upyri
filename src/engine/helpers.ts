import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';


export function doTimes<T>(times: number, callback: (index: number) => T): T[] {
  const result: T[] = [];
  for (let i = 0; i < times; i++) {
    result.push(callback(i));
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
