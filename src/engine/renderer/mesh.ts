import { Object3d } from './object-3d';
import { Material } from './material';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';

export class Mesh extends Object3d {
  geometry: MoldableCubeGeometry;
  material: Material;

  constructor(geometry: MoldableCubeGeometry, material: Material) {
    geometry.setAttribute_(AttributeLocation.Positions, new Float32Array(geometry.vertices.flatMap(point => point.toArray())), 3);
    super();
    this.geometry = geometry;
    this.material = material;
  }
}
