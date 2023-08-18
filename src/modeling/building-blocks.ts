import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function segmentedWall(segmentWidth: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0) {
  let runningSide = 0;
  let runningLeft = 0;
  const depth = 3; // TODO: Add to args

  const result = new MoldableCubeGeometry(segmentWidth[0], topSegments[0], depth, 1, 1, 1, 6, { isTop: true, wallHeight: segmentHeight, runningLeft }).translate_(startingX, segmentHeight - topSegments[0] / 2 + startingY).done_();

  topSegments.forEach((top, index) => {
    const currentWidth = segmentWidth.length === 1 ? segmentWidth[0] : segmentWidth[index];
    if (index > 0 && top > 0) {
      result.merge(new MoldableCubeGeometry(currentWidth, top, depth,1,1,1,6,{ isTop: true, wallHeight: segmentHeight, runningLeft}).translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2 + startingY).done_());
    }

    if (bottomSegments[index] > 0) {
      result.merge(new MoldableCubeGeometry(currentWidth, bottomSegments[index], depth, 1, 1, 1, 6, { wallHeight: segmentHeight, isTop: false, runningLeft }).translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2 + startingY).done_());
    }
    runningSide+= (index === 0 ? currentWidth / 2 : currentWidth);
    runningLeft += currentWidth;
  });


  return result.computeNormals().done_();
}
