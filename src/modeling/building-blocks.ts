import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';


export class SegmentedWall extends MoldableCubeGeometry {
  totalWidth = 0;
  constructor(segmentWidth: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0, depth = 2) {
    let runningSide = 0;
    let runningLeft = 0;

    super({
      width_: segmentWidth[0],
      height_: topSegments[0],
      depth,
      fixedTextureSize: 6,
      widthSegments: 6,
      segmentedWallArgs: { isTop: true, wallHeight: segmentHeight, runningLeft }
    });
    this.translate_(0, segmentHeight - topSegments[0] / 2).done_();

    topSegments.forEach((top, index) => {
      const currentWidth = segmentWidth.length === 1 ? segmentWidth[0] : segmentWidth[index];
      if (index > 0 && top > 0) {
        this.merge(new MoldableCubeGeometry({
          width_: currentWidth,
          height_: top,
          depth,
          fixedTextureSize: 6,
          widthSegments: 6,
          segmentedWallArgs: { isTop: true, wallHeight: segmentHeight, runningLeft}
        })
          .translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2)
          .done_()
        );
      }

      if (bottomSegments[index] > 0) {
        this.merge(new MoldableCubeGeometry({
          width_: currentWidth,
          height_: bottomSegments[index],
          depth,
          fixedTextureSize: 6,
          widthSegments: 6,
          segmentedWallArgs: { wallHeight: segmentHeight, isTop: false, runningLeft }
        })
          .translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2)
          .done_()
        );
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
  return createHallway(frontWall, backWall, (leftWall.totalWidth + 2) / 2)
    .merge(createHallway(leftWall, rightWall, (frontWall.totalWidth - 2) / 2).rotate_(0, Math.PI / 2)).computeNormals().done_();
}

// export function createHallwayOld(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number, spacing: number) {
//   const isHorizontal = width >= depth;
//   const wallGeometry2 = new MoldableCubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
//     .translate_(isHorizontal ? 0 : spacing, 0, isHorizontal ? spacing : 0);
//
//   return new MoldableCubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
//     .translate_(isHorizontal ? 0 : -spacing, 0, isHorizontal ? -spacing : 0)
//     .merge(wallGeometry2)
//     .computeNormals()
//     .done_();
// }

// export function createBoxOld(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number) {
//   const spacing = (width - depth) / 2;
//   const sideWidth = width - depth * 2;
//   const segmentWidth = width / widthSegments;
//   const widthInSegments = width / segmentWidth;
//   const sideSpacing = (segmentWidth / 2) * (widthInSegments - 1);
//   const verticalWalls = createHallwayOld(sideWidth, height, segmentWidth, Math.ceil(widthSegments * (sideWidth / width)), heightSegments, depthSegments, sideSpacing).all_().rotate_(0, Math.PI / 2, 0).done_();
//   return createHallwayOld(width, height, depth, widthSegments, heightSegments, depthSegments, spacing).merge(verticalWalls).computeNormals();
// }
//
// export function createTire() {
//   return createBoxOld(8, 10, 1, 6, 1, 1)
//     .selectBy(vertex => Math.abs(vertex.x) < 3.5 && Math.abs(vertex.z) < 3.5)
//     .cylindrify(4, 'y')
//     .invertSelection()
//     .cylindrify(5, 'y')
//     .all_()
//     .translate_(0, 21, 0)
//     .computeNormals(true)
//     .done_();
// }
