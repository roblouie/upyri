export function magnitude(point: DOMPoint) {
  return Math.hypot(point.x, point.y, point.z);
}

export function clamp(point: DOMPoint, maxMagnitude: number) {
  const mag = magnitude(point);
  const multiplier = (mag > maxMagnitude) ? (maxMagnitude / mag) : 1;
  point.x *= multiplier;
  point.y *= multiplier;
  point.z *= multiplier;
  return point;
}
