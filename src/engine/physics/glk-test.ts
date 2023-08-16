import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { vec3 } from 'gl-matrix';

export function findFurthestPoint(vertices: vec3[], direction: vec3) {
  let maxDistance = -Infinity;
  let maxPoint;

  for (const vertex of vertices) {
    const distance = vec3.dot(vertex, direction);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxPoint = vec3.clone(vertex);
    }
  }

  return maxPoint;
}

export function support(faceA: vec3[], faceB: vec3[], direction: vec3) {
  const farthestPointA = findFurthestPoint(faceA, direction);
  // @ts-ignore
  const farthestPointB = findFurthestPoint(faceB, vec3.scale([], vec3.clone(direction), -1));
  // @ts-ignore
  return vec3.subtract([], farthestPointA, farthestPointB);
}

export function gjk(faceA: Face, faceB: Face) {
  const sp = support(faceA, faceB, new EnhancedDOMPoint(1, 0, 0).normalize_());

  const simplex = [sp];

  const newDirection = sp.clone_().scale_(-1);

  while (true) {
    const sp2 = support(faceA, faceB, newDirection);

    if (sp2.dot(newDirection) <= 0) {
      return false;
    }

    simplex.unshift(sp2);

    if (nextSimplex(simplex, newDirection)) {
      return true;
    }
  }
}

function nextSimplex(simplex: EnhancedDOMPoint[], direction: EnhancedDOMPoint): boolean {
  switch (simplex.length) {
    case 2: return line(simplex, direction);
    case 3: return triangle(simplex, direction);
    case 4: return tetrahedron(simplex, direction);
  }

  return false;
}

function sameDirection(direction: EnhancedDOMPoint, ao: EnhancedDOMPoint) {
  return direction.dot(ao) > 0;
}

function line(simplex: EnhancedDOMPoint[], direction: EnhancedDOMPoint) {
  const a = simplex[0];
  const b = simplex[1];

  const ab = new EnhancedDOMPoint().subtractVectors(b, a);
  const ao = new EnhancedDOMPoint().set(b).scale_(-1);

  if (sameDirection(ab, ao)) {
    const abCrossAo = new EnhancedDOMPoint().crossVectors(ab, ao);
    const crossedWithAb = new EnhancedDOMPoint().crossVectors(abCrossAo, ab);
    direction.set(crossedWithAb);
  } else {
    simplex.pop();
    simplex[0] = a;
    direction.set(ao);
  }

  return false;
}

function triangle(simplex: EnhancedDOMPoint[], direction: EnhancedDOMPoint) {
  const a = simplex[0];
  const b = simplex[1];
  const c = simplex[2];

  const ab = new EnhancedDOMPoint().subtractVectors(b, a);
  const ac = new EnhancedDOMPoint().subtractVectors(c, a);
  const abc = new EnhancedDOMPoint().crossVectors(ab, ac);

  const ao = a.clone_().scale_(-1);

  if (sameDirection(new EnhancedDOMPoint().crossVectors(abc, ac), ao)) {
    if (sameDirection(ac, ao)) {
      const acCrossAo = new EnhancedDOMPoint().crossVectors(ac, ao);
      const crossedWithAc = new EnhancedDOMPoint().crossVectors(acCrossAo, ab);
      direction.set(crossedWithAc);
      simplex.pop();
      simplex[0] = a;
      simplex[1] = c;
    } else {
      simplex.pop();
      nextSimplex(simplex, direction);
    }
  } else {
    if (sameDirection(new EnhancedDOMPoint().crossVectors(ab, abc), ao)) {
      simplex.pop();
      nextSimplex(simplex, direction);
    } else {
      return true;
    }
  }

  return false;
}
