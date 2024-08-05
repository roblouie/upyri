import { Face } from './face';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Mesh } from '@/engine/renderer/mesh';

function indexToFaceVertexPoint(index: number, positionData: Float32Array, matrix: DOMMatrix): EnhancedDOMPoint {
  return new EnhancedDOMPoint().set(
    matrix.transformPoint(new EnhancedDOMPoint(positionData[index], positionData[index + 1], positionData[index + 2]))
  )
}


let mostNegativeX = Infinity;
let mostPositiveX = -Infinity;
let mostNegativeZ = Infinity;
let mostPositiveZ = -Infinity;

export function meshToFaces(meshes: Mesh[], transformMatrix?: DOMMatrix) {


  return meshes.flatMap(mesh => {
    const indices = mesh.geometry.getIndices();

    const positions = mesh.geometry.getAttribute_(AttributeLocation.Positions);
    const triangles = [];
    for (let i = 0; i < indices.length; i += 3) {
      const firstIndex = indices[i] * 3;
      const secondIndex = indices[i + 1] * 3;
      const thirdIndex = indices[i + 2] * 3;

      const point0 = indexToFaceVertexPoint(firstIndex, positions.data, transformMatrix ?? mesh.worldMatrix);
      const point1 = indexToFaceVertexPoint(secondIndex, positions.data, transformMatrix ?? mesh.worldMatrix);
      const point2 = indexToFaceVertexPoint(thirdIndex, positions.data, transformMatrix ?? mesh.worldMatrix);

      const trianglePoints = [
        point0,
        point1,
        point2,
      ];

      trianglePoints.forEach(p => {
        if (p.x < mostNegativeX) {
          mostNegativeX = p.x;
        }

        if (p.x > mostPositiveX) {
          mostPositiveX = p.x;
        }

        if (p.z < mostNegativeZ) {
          mostNegativeZ = p.z;
        }

        if (p.z > mostPositiveZ) {
          mostPositiveZ = p.z;
        }
      });

      triangles.push(trianglePoints);
    }

    return triangles.map(triangle => new Face(triangle));
  });
}
