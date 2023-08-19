import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { SegmentedWall } from '@/modeling/building-blocks';
import { doTimes } from '@/engine/helpers';

// TODO: Build castle at 0, translate whole thing up to 21
const BaseLevel = 21;

function patternFill(pattern: number[], times: number) {
  return doTimes(times, () => pattern).flat();
}

export function castleTopper(length: number, startingHeight: number, zPos: number) {
  const segmentWidths = patternFill([2, 1], Math.ceil(length / 3));
  return new SegmentedWall(segmentWidths, 3, patternFill([3, 1], segmentWidths.length / 2), [0, 0, 0, 0], 0, 0)
    .rotate_(0, 0, Math.PI)
    .translate_(0, startingHeight + BaseLevel + 3, zPos)
    .computeNormals();
}

export function frontWall() {
  return new SegmentedWall([30, 12, 30], 12, [12, 1, 12], [0, 0, 0], 0, BaseLevel, 6)
    .merge(castleTopper(72, 12, 3))
    .merge(castleTopper(72, 12, -3))
    .done_();
}
