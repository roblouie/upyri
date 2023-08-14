import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function segmentedWall(segmentWidth: number, segmentHeight: number, topSegments: number[], bottomSegments: number[]) {
  let runningSide = 0;
  const depth = 3; // TODO: Add to args

  const result = new MoldableCubeGeometry(segmentWidth, topSegments[0], depth).translate_(0, segmentHeight - topSegments[0] / 2).done_();

  topSegments.forEach((top, index) => {
    if (index > 0 && top > 0) {
      result.merge(new MoldableCubeGeometry(segmentWidth, top, depth).translate_(runningSide, segmentHeight - top / 2).done_());
    }

    if (bottomSegments[index] > 0) {
      result.merge(new MoldableCubeGeometry(segmentWidth, bottomSegments[index], depth).translate_(runningSide, bottomSegments[index] / 2).done_());
    }
    runningSide+= segmentWidth;
  });

  return result.computeNormals().done_();
}
