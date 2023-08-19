import { createBox, createHallway, SegmentedWall } from '@/modeling/building-blocks';
import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable';

// TODO: Build castle at 0, translate whole thing up to 21
const BaseLevel = 0;

export function createCastle() {
  return solidCastleWall(-48, true) // front Wall
    .merge(corner().translate_(42, 0, -48)) // front-right Corner
    .merge(corner().translate_(-42, 0, -48)) // front-left Corner
    .merge(corner(true).translate_(-42, 0, 48)) // rear-right Corner
    .merge(corner(true).translate_(42, 0, 48)) // rear-left Corner
    .merge(solidCastleWall(48)) // back Wall
    .merge(hollowCastleWall(-42))
    .merge(hollowCastleWall(42))
    .done_();
}

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

export function solidCastleWall(z: number, hasDoor?: boolean) {
  return new SegmentedWall([30, 12, 30], 12, [12, hasDoor ? 1 : 12, 12], [0, 0, 0], 0, BaseLevel, 6)
    .merge(castleTopper(72, 12, 3))
    .merge(castleTopper(72, 12, -3))
    .translate_(0,0, z)
    .done_();
}

export function hollowCastleWall(x: number) {
  const testWall = new SegmentedWall(patternFill([3, 1], 24), 12, patternFill([12, 5], 24), patternFill([0, 4], 24), 0, 0);
  const testWall2 = new SegmentedWall(patternFill([3, 1], 24), 12, patternFill([12, 5], 24), patternFill([0, 4], 24), 0, 0);
  return createHallway(testWall, testWall2, 5)
    .merge(castleTopper(80, 12, 6))
    .merge(castleTopper(80, 12, -6))
    .rotate_(0, Math.PI / 2, 0)
    .translate_(x)
    .computeNormals();
}

export function corner(isRounded?: boolean) {
  const testWall = new SegmentedWall([5, 2, 5], 12, [12, 3, 12], [0, 4, 0], 0, 0);
  const testWall2 = new SegmentedWall([4, 4, 4], 12, [12, 5, 12], [0, 0, 0], 0, 0);
  const testWall3 = new SegmentedWall([4, 2, 4], 12, [12, 3, 12], [0, 4, 0], 0, 0);
  const testWall4 = new SegmentedWall([4, 2, 4], 12, [12, 3, 12], [0, 4, 0], 0, 0);

  const testWall5 = new SegmentedWall([5, 2, 5], 12, [12, 3, 12], [0, 4, 0], 0, 12);
  const testWall6 = new SegmentedWall([4, 4, 4], 12, [12, 5, 12], [0, 0, 0], 0, 12);
  const testWall7 = new SegmentedWall([4, 2, 4], 12, [12, 3, 12], [0, 4, 0], 0, 12);
  const testWall8 = new SegmentedWall([4, 2, 4], 12, [12, 3, 12], [0, 4, 0], 0, 12);

  const top = createBox(
    castleTopper(14, 24, 0),
    castleTopper(14, 24, 0),
    castleTopper(10, 24, 0),
    castleTopper(10, 24, 0),
  );

  return (isRounded ? tubify(createBox(testWall, testWall2, testWall3, testWall4), 5, 4.5, 6.5 ): createBox(testWall, testWall2, testWall3, testWall4))
    .merge(isRounded ? tubify(createBox(testWall5, testWall6, testWall7, testWall8), 5, 4.5, 6.5 ): createBox(testWall5, testWall6, testWall7, testWall8))
    .merge(isRounded ? tubify(top, 7, 5.5, 7.5) : top);
}

function tubify(moldableCubeBox: MoldableCubeGeometry, selectSize: number, innerRadius: number, outerRadius: number) {
  return moldableCubeBox
    .selectBy(vertex => Math.abs(vertex.x) <= selectSize && Math.abs(vertex.z) <= selectSize)
    .cylindrify(innerRadius, 'y')
    .invertSelection()
    .cylindrify(outerRadius, 'y')
    .computeNormals(true)
    .all_()
    .done_();
}
