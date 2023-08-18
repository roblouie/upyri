import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

const DEPTH = 1; // TODO: make argument instead of hard coded

export class SegmentedWall extends MoldableCubeGeometry {
  totalWidth = 0;
  constructor(segmentWidth: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0) {
    let runningSide = 0;
    let runningLeft = 0;

    super(segmentWidth[0], topSegments[0], DEPTH, 1, 1, 1, 6, { isTop: true, wallHeight: segmentHeight, runningLeft });
    this.translate_(0, segmentHeight - topSegments[0] / 2).done_();

    topSegments.forEach((top, index) => {
      const currentWidth = segmentWidth.length === 1 ? segmentWidth[0] : segmentWidth[index];
      if (index > 0 && top > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, top, DEPTH,1,1,1,6,{ isTop: true, wallHeight: segmentHeight, runningLeft}).translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2).done_());
      }

      if (bottomSegments[index] > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, bottomSegments[index], DEPTH, 1, 1, 1, 6, { wallHeight: segmentHeight, isTop: false, runningLeft }).translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2).done_());
      }
      runningSide+= (index === 0 ? currentWidth / 2 : currentWidth);
      runningLeft += currentWidth;
    });

    this.totalWidth = runningLeft;
    this.all_().translate_((segmentWidth[0] - runningLeft) / 2, startingY).computeNormals().done_();
  }
}

export function createHallway(frontWall: SegmentedWall, backWall: SegmentedWall, spacing: number) {
  return frontWall.translate_(0, 0, spacing).merge(backWall.translate_(0, 0, -spacing)).done_();
}

export function createBox(frontWall: SegmentedWall, backWall: SegmentedWall, leftWall: SegmentedWall, rightWall: SegmentedWall) {
  return createHallway(frontWall, backWall, (leftWall.totalWidth + DEPTH) / 2)
    .merge(createHallway(leftWall, rightWall, (frontWall.totalWidth - DEPTH) / 2).rotate_(0, Math.PI / 2)).computeNormals().done_();
}
