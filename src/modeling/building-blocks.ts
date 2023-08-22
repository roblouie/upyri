import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export const mergeCubes = (cubes: MoldableCubeGeometry[]) => cubes.reduce((acc, curr) => acc.merge(curr));



export class SegmentedWall extends MoldableCubeGeometry {
  totalWidth = 0;
  constructor(segmentWidth: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0, depth = 2) {
    let runningSide = 0;
    let runningLeft = 0;

    super(segmentWidth[0], topSegments[0], depth, 6, 1, 1, 6);
    this.translate_(0, segmentHeight - topSegments[0] / 2 + startingY).spreadTextureCoords();

    topSegments.forEach((top, index) => {
      const currentWidth = segmentWidth.length === 1 ? segmentWidth[0] : segmentWidth[index];
      if (index > 0 && top > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, top, depth,6,1,1,6).translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2 + startingY).spreadTextureCoords());
      }

      if (bottomSegments[index] > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, bottomSegments[index], depth, 6, 1, 1, 6).translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2 + startingY).spreadTextureCoords());
      }
      runningSide+= (index === 0 ? currentWidth / 2 : currentWidth);
      runningLeft += currentWidth;
    });

    this.totalWidth = runningLeft;
    //TODO: Refactor to do this per wall instead of all at once
    this.all_().translate_((segmentWidth[0] - runningLeft) / 2, 0).computeNormals().done_();
  }
}

export function createHallway(frontWall: SegmentedWall, backWall: SegmentedWall, spacing: number) {
  return frontWall.translate_(0, 0, spacing).merge(backWall.translate_(0, 0, -spacing)).done_();
}

export function createBox(frontWall: SegmentedWall, backWall: SegmentedWall, leftWall: SegmentedWall, rightWall: SegmentedWall) {
  return createHallway(frontWall, backWall, (leftWall.totalWidth + 2) / 2)
    .merge(createHallway(leftWall, rightWall, (frontWall.totalWidth - 2) / 2).rotate_(0, Math.PI / 2)).computeNormals().done_();
}


// TODO: Remove this if i stick with ramps only
export function createStairs(stepCount: number, startingHeight = 0) {
  const stepHeight = 1;
  return mergeCubes(doTimes(stepCount, index => {
    const currentHeight = index * stepHeight + stepHeight + startingHeight;
    return new MoldableCubeGeometry(1, currentHeight, 3).translate_(index, currentHeight/2);
  })).done_();
}
