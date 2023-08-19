import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function makeEntry() {
  return new MoldableCubeGeometry({ width_: 20, height_: 5, depth: 5, widthSegments: 10, fixedTextureSize: 6 })
    .translate_(0, 6, 0)
    .selectBy(vert => vert.y > 5)
    .cylindrify(3, 'z')
    .done_();
}
