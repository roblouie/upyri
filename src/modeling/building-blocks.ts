import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function segmentedWall(segmentWidth: number, segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0) {
  let runningSide = 0;
  const depth = 3; // TODO: Add to args

  const result = new MoldableCubeGeometry(segmentWidth, topSegments[0], depth).translate_(startingX, segmentHeight - topSegments[0] / 2 + startingY).done_();

  topSegments.forEach((top, index) => {
    if (index > 0 && top > 0) {
      result.merge(new MoldableCubeGeometry(segmentWidth, top, depth).translate_(startingX + runningSide, segmentHeight - top / 2 + startingY).done_());
    }

    if (bottomSegments[index] > 0) {
      result.merge(new MoldableCubeGeometry(segmentWidth, bottomSegments[index], depth).translate_(startingX + runningSide, bottomSegments[index] / 2 + startingY).done_());
    }
    runningSide+= segmentWidth;
  });

  return result.computeNormals().done_();
}
