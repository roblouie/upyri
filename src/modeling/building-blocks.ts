import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export const mergeCubes = (cubes: MoldableCubeGeometry[]) => cubes.reduce((acc, curr) => acc.merge(curr));

export class SegmentedWall extends MoldableCubeGeometry {
  totalWidth = 0;
  constructor(segmentWidths: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0, depth = 2, segmentTop = false, segmentBottom = false) {
    let runningSide = 0;
    let runningLeft = 0;

    super(segmentWidths[0], topSegments[0], depth, segmentTop ? 6 : 1, 1, 1, 6);
    this.translate_(0, segmentHeight - topSegments[0] / 2 + startingY).spreadTextureCoords();

    topSegments.forEach((top, index) => {
      const currentWidth = segmentWidths.length === 1 ? segmentWidths[0] : segmentWidths[index];
      if (index > 0 && top > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, top, depth,segmentTop ? 6 : 1,1,1,6).translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2 + startingY).spreadTextureCoords());
      }

      if (bottomSegments[index] > 0) {
        this.merge(new MoldableCubeGeometry(currentWidth, bottomSegments[index], depth, segmentBottom ? 6 : 1, 1, 1, 6).translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2 + startingY).spreadTextureCoords());
      }
      runningSide+= (index === 0 ? currentWidth / 2 : currentWidth);
      runningLeft += currentWidth;
    });

    this.totalWidth = runningLeft;
    this.all_().translate_((segmentWidths[0] - runningLeft) / 2, 0).computeNormals();
  }
}

export function createHallway(frontWall: SegmentedWall, backWall: MoldableCubeGeometry, spacing: number) {
  return frontWall.translate_(0, 0, spacing).merge(backWall.translate_(0, 0, -spacing));
}

export function createBox(frontWall: SegmentedWall, backWall: SegmentedWall, leftWall: SegmentedWall, rightWall: SegmentedWall) {
  return createHallway(frontWall, backWall, (leftWall.totalWidth + 2) / 2)
    .merge(createHallway(leftWall, rightWall, (frontWall.totalWidth - 2) / 2).rotate_(0, Math.PI / 2)).computeNormals();
}

export function patternFill(pattern: number[], times: number) {
  return doTimes(times, (index) => pattern[index % pattern.length]);
}
