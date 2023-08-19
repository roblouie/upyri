import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function makeEntry() {
  return new MoldableCubeGeometry(20, 5, 5, 10, 1, 1)
    .translate_(0, 21, 0)
    .done_();
}
