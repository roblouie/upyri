import { Face } from '@/engine/physics/face';
import { vec3 } from 'gl-matrix';
import { V3F } from '@/happy-vec-3';

function findFurthestPoint(vertices: vec3[], direction: vec3) {
  let maxDistance = -Infinity;
  let maxPoint: vec3;

  for (const vertex of vertices) {
    const distance = vec3.dot(vertex, direction);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxPoint = vec3.clone(vertex);
    }
  }

  return maxPoint!;
}

export function support(faceA: vec3[], faceB: vec3[], direction: vec3) {
  const farthestPointA = findFurthestPoint(faceA, direction);
  const farthestPointB = findFurthestPoint(faceB, vec3.scale([0, 0, 0], direction, -1));
  return vec3.subtract([0, 0, 0], farthestPointA, farthestPointB);
}


export function gjk(face1: vec3[], face2: vec3[]) {
  let maxIterations = 2;
  let currentIterations = 0;

  const direction: vec3 = [1, 0, 0];

  const simplex = [support(face1, face2, direction)];

  // Set direction to be the vector from the first point in the simplex towards the origin
  vec3.scale(direction, simplex[0], -1);
  vec3.normalize(direction, direction);

  while (true) {
    const latestPoint = support(face1, face2, direction);

    // The direction is from the previous point in the simplex towards the origin
    // If the latest point is pointing in the same direction, it has not crossed the origin
    // and therefor there is no collision
    if (vec3.dot(latestPoint, direction) < 0) {
      return { simplex, result: false };
    }

    simplex.push(latestPoint);

    if (handleSimplex(simplex, direction)) {
      return { simplex, result: true };
    }
  }
}

function handleSimplex(simplex: vec3[], direction: vec3) {
  if (simplex.length === 2) {
    // debugger;
    return handleLine(simplex, direction);
  } else if (simplex.length === 3) {
    // debugger;
    return handleTriangle(simplex, direction);
  }
}

function handleLine(simplex: vec3[], direction: vec3) {
  // a will always be the latest point added to the simplex
  // b will always be the previous point
  const a = simplex[1];
  const b = simplex[0];

  const aToB = vec3.subtract([0, 0, 0], b, a);
  const aToOrigin = vec3.scale([0, 0, 0], a, -1);

  // The next direction to check for the furthest point with is the one that points away from
  // the line AB towards the origin.
  vec3.normalize(direction, tripleProduct(aToB, aToOrigin, aToB));

  return false;
}

function handleTriangle(simplex: vec3[], direction: vec3) {
  const a = simplex[2];
  const b = simplex[1];
  const c = simplex[0];

  const aToB = vec3.subtract([0, 0, 0], b, a);
  const aToOrigin = vec3.scale([0, 0, 0], a, -1);
  const aToC = vec3.subtract([0, 0, 0], c, a);

  const abPerp = tripleProduct(aToC, aToB, aToB);
  const acPerp = tripleProduct(aToB, aToC, aToC);


  if (vec3.dot(abPerp, aToOrigin) > 0) {
    simplex.shift();
    vec3.normalize(direction, abPerp);
    return false;
  } else if (vec3.dot(acPerp, aToOrigin) > 0) {
    simplex.splice(1, 1);
    vec3.normalize(direction, acPerp);
    return false;
  }

  return true;
}

function tripleProduct(firstVec: vec3, secondVec: vec3, thirdVec: vec3) {
  const orthogonal = vec3.cross([0, 0, 0], firstVec, secondVec);
  return vec3.cross([0, 0, 0], orthogonal, thirdVec);
}
