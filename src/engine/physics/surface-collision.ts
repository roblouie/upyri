import { Face } from './face';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { FirstPersonPlayer } from '@/core/first-person-player';


// TODO: simple optimization would be to sort floor faces first, as long as there are no moving floor pieces they
// could be pre sorted
export function findFloorHeightAtPosition(floorFaces: Face[], positionPoint: EnhancedDOMPoint) {
  let height: number;
  const collisions = [];

  for (const floor of floorFaces) {
    const { x: x1, z: z1 } = floor.points[0];
    const { x: x2, z: z2 } = floor.points[1];
    const { x: x3, z: z3 } = floor.points[2];

    if ((z1 - positionPoint.z) * (x2 - x1) - (x1 - positionPoint.x) * (z2 - z1) < 0) {
      continue;
    }

    if ((z2 - positionPoint.z) * (x3 - x2) - (x2 - positionPoint.x) * (z3 - z2) < 0) {
      continue;
    }

    if ((z3 - positionPoint.z) * (x1 - x3) - (x3 - positionPoint.x) * (z1 - z3) < 0) {
      continue;
    }

    height = -(positionPoint.x * floor.normal.x + floor.normal.z * positionPoint.z + floor.originOffset) / floor.normal.y;

    const buffer = -3; // original mario 64 code uses a 78 unit buffer, but mario is 160 units tall compared to our presently much smaller sizes
    if (positionPoint.y - (height + buffer) < 0) {
      continue;
    }

    collisions.push({ height, floor });
  }

  return collisions.sort((a, b) => b.height - a.height)[0];
}



export function findWallCollisionsFromList(walls: Face[], position: EnhancedDOMPoint, offsetY: number, radius: number, player: FirstPersonPlayer) {
  const collisionData = {
    xPush: 0,
    zPush: 0,
    walls: [] as Face[],
    numberOfWallsHit: 0,
  };


  for (const wall of walls) {


    // const newWallHit = isPointInTriangle(test, wall.points[0], wall.points[1], wall.points[2]);
    // const oldResult = findWallCollisionsFromListOld(wall, position, offsetY, radius);
    const newWallHit = testSphereTriangle(player.collisionSphere, wall.points[0], wall.points[1], wall.points[2]);

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

      collisionData.walls.push(wall);
      collisionData.numberOfWallsHit++;
    }

  return collisionData;

  }


function testSphereTriangle(s: Sphere, a: EnhancedDOMPoint, b: EnhancedDOMPoint, c: EnhancedDOMPoint) {
  const p = closestPointInTriangle(s.center, a, b, c);
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
