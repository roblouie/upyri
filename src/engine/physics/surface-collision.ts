import { Face } from './face';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { FirstPersonPlayer } from '@/core/first-person-player';

export const halfLevelSize = 128;
const cellSize = 8;
const cellsInEachDirection = 16;

export function getGridPosition(point: EnhancedDOMPoint) {
  return Math.floor((point.x + halfLevelSize) / cellSize) + (Math.floor((point.z + halfLevelSize) / cellSize) * cellsInEachDirection);
}

export function getGridPositionWithNeighbors(point: EnhancedDOMPoint, gridLength: number) {
  const gridPos = getGridPosition(point);
  return [
    gridPos,
    gridPos - 1 - cellsInEachDirection, // Upper left neighbor
    gridPos - cellsInEachDirection, // upper neighbor
    gridPos + 1 - cellsInEachDirection, // upper right neighbor
    gridPos - 1, // left neighbor
    gridPos + 1, // right neighbor
    gridPos - 1 + cellsInEachDirection, // lower left neighbor
    gridPos + cellsInEachDirection, // lower neighbor
    gridPos + 1 + cellsInEachDirection // lower right neighbor
  ].filter(gp => gp >= 0 && gp < gridLength);
}


export function build2dGrid(allFaces: Face[]) {
  const gridFaces: Set<Face>[] = [];

  allFaces.forEach(face => {
    face.points.map(getGridPosition).forEach(gp => {
      if (!gridFaces[gp]) {
        gridFaces[gp] = new Set<Face>();
      }
      gridFaces[gp].add(face);
    });
  });

  return gridFaces;
}


export function findWallCollisionsFromList(walls: Set<Face>, player: FirstPersonPlayer) {
  for (const wall of walls) {
    const newWallHit = testSphereTriangle(player.collisionSphere, wall);

    if (newWallHit) {
      const correctionVector = newWallHit.penetrationNormal.scale_(newWallHit.penetrationDepth + 0.00000001);
      player.collisionSphere.center.add_(correctionVector);

      const normalComponent = newWallHit.penetrationNormal.scale_(player.velocity.dot(newWallHit.penetrationNormal));
      player.velocity.subtract(normalComponent);

      // Slightly sketch way of dealing with gravity on a sloped surface, but it does work
      if (wall.normal.y >= 0.6 && player.velocity.y < 0) {
        player.velocity.y = 0;
        player.isJumping = false;
      } else if (wall.normal.y <= -0.6 && player.velocity.y > 0) {
        player.velocity.y = 0;
      }
    }
    }
  }


function testSphereTriangle(s: Sphere, wall: Face) {
  // Ignore back sides of triangles
  const dist = new EnhancedDOMPoint().subtractVectors(s.center, wall.points[0]).dot(wall.normal);
  if (dist < 0) {
    return;
  }

  const p = closestPointInTriangle(s.center, wall.points[0], wall.points[1], wall.points[2]);
  const v = new EnhancedDOMPoint().subtractVectors(s.center, p);
  const squaredDistanceFromPointOnTriangle = v.dot(v);
  const isColliding = squaredDistanceFromPointOnTriangle <= s.radius * s.radius;
  if (isColliding) {

    const penetrationNormal = v.normalize_();
    const penetrationDepth = s.radius - Math.sqrt(squaredDistanceFromPointOnTriangle);
    return {
      penetrationNormal,
      penetrationDepth,
    };
  }
}

function closestPointInTriangle(p: EnhancedDOMPoint, a: EnhancedDOMPoint, b: EnhancedDOMPoint, c: EnhancedDOMPoint) {
  const ab = new EnhancedDOMPoint().subtractVectors(b, a);
  const ac = new EnhancedDOMPoint().subtractVectors(c, a);
  const ap = new EnhancedDOMPoint().subtractVectors(p, a);

  const d1 = ab.dot(ap);
  const d2 = ac.dot(ap);

  if (d1 <= 0 && d2 <= 0) return a;

  const bp = new EnhancedDOMPoint().subtractVectors(p, b);
  const d3 = ab.dot(bp);
  const d4 = ac.dot(bp);

  if (d3 >= 0 && d4 <= d3) return b;

  const vc = d1 * d4 - d3 * d2;

  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return new EnhancedDOMPoint().addVectors(a, new EnhancedDOMPoint().set(ab).scale_(v));
  }

  const cp = new EnhancedDOMPoint().subtractVectors(p, c);
  const d5 = ab.dot(cp);
  const d6 = ac.dot(cp);

  if (d6 >= 0 && d5 <= d6) return c;

  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return new EnhancedDOMPoint().addVectors(a, new EnhancedDOMPoint().set(ac).scale_(w));
  }

  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    const wbc = new EnhancedDOMPoint().subtractVectors(c, b).scale_(w);
    return new EnhancedDOMPoint().addVectors(b, wbc);
  }

  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  const abv = new EnhancedDOMPoint().set(ab).scale_(v);
  const acw = new EnhancedDOMPoint().set(ac).scale_(w);
  return new EnhancedDOMPoint().addVectors(abv, acw).add_(a);
}
