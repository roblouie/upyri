import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { SegmentedWall } from '@/modeling/building-blocks';

export function stake() {
  return new Mesh(new MoldableCubeGeometry(0.5, 0.5, 2, 2, 2)
    .selectBy(vert => vert.z > 0 && vert.x === 0)
    .translate_(0, 0, 1)
    .scale_(1, 0, 1)
    .all_()
    .rotate_(0, -1)
    .translate_(-40, 21.5, -53)
    .done_(), new Material({ color: [1, 0, 0, 1] }));
}

export function key() {
  return new Mesh(
    new MoldableCubeGeometry(1, 1, 0.5, 1, 3)
      .cylindrify(1, 'z')
      .merge(new SegmentedWall([1, 0.5, 0.5, 0.5], 1, [0.25, 1, 0.25, 1], [0], 0, 0, 0.5).translate_(2, -0.75))
      .scale_(0.5, 0.5, 0.5)
      .rotate_(0, Math.PI / 2)
      .translate_(-24,36,48.5)
      .done_(),
    new Material({ color: [1, 1, 0, 1] }));
}
