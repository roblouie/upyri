import { vec3 } from 'gl-matrix';
import { Face } from '@/engine/physics/face';
import { support } from '@/engine/physics/gjk';

export function epa(polytope: vec3[], face1: vec3[], face2: vec3[]) {
  let minIndex = 0;
  let minDistance = Infinity;
  let minNormal: vec3 = [0, 0, 0];

  while (minDistance == Infinity) {
    for (let i = 0; i < polytope.length; i++) {
      let j = (i + 1) % polytope.length;

      let vertexI = vec3.copy([0, 0, 0], polytope[i]);
      let vertexJ = vec3.copy([0, 0, 0], polytope[j]);

      let ij = vec3.subtract([0, 0, 0], vertexJ, vertexI);

      let normal = vec3.normalize([0, 0, 0], vec3.fromValues(ij[1], -ij[0], 0));
      let distance = vec3.dot(normal, vertexI);

      if (distance < 0) {
        distance *= -1;
        vec3.scale(normal, normal, -1);
      }

      if (distance < minDistance) {
        minDistance = distance;
        minNormal = normal;
        minIndex = j;
      }
    }

    let s = support(face1, face2, minNormal);
    let sDistance = vec3.dot(minNormal, s);

    if (Math.abs(sDistance - minDistance) > 0.001) {
      minDistance = Infinity;
      polytope.splice(minIndex, 0, s);
    }
  }

  debugger;

  return vec3.scale([0, 0, 0], minNormal, minDistance + 0.001);
}
