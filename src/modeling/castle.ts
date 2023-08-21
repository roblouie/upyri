import { createBox, createHallway, SegmentedWall } from '@/modeling/building-blocks';
import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable';

// TODO: Build castle at 0, translate whole thing up to 21
const BaseLevel = 0;

const frontLeftCornerRoom = [
  // First Floor
  [
    // Front Wall
    [
      [9, 4, 5, 2, 2], [12, 5, 12, 6, 12], [0, 0, 0, 3, 0]
    ],
    // Back Wall
    [
      [11, 11], [12, 12], [0,0]
    ],
    // Left Wall
    [
      [4, 3, 13], [5, 12, 12], [0, 0, 0]
    ],
    // Right Wall
    [
      [10, 10], [12, 12], [0, 0]
    ]
  ],
  // Second Floor
  [
    // Front Wall
    [
      [9, 4, 4, 2, 3], [12, 5, 12, 4, 12], [0, 0, 0, 3, 0]
    ],
    // Back Wall
    [
      [10, 2, 10], [12, 3, 12], [0, 4, 0]
    ],
    // Left Wall
    [
      [2, 2, 4, 4, 8], [12, 4, 12, 5, 12], [0, 3, 0, 0, 0]
    ],
    // Right Wall
    [
      [9, 2, 9], [12, 3, 12], [0, 4, 0]
    ]
  ]
];

const rearRightCornerRoom = [
  // First Floor
  [
    // Front Wall
    [
      [11,11], [12,12], [0,0]
    ],
    // Back Wall
    [
      [7, 4, 7, 4], [12, 5, 12, 5], [0, 0, 0]
    ],
    // Left Wall
    [
      [13, 3, 4], [12, 12, 5], [0, 0, 0]
    ],
    // Right Wall
    [
      [10, 10], [12, 12], [0, 0]
    ]
  ],
  // Second Floor
  [
    // Front Wall
    [
      [9, 4, 4, 2, 3], [12, 5, 12, 4, 12], [0, 0, 0, 3, 0]
    ],
    // Back Wall
    [
      [6, 2, 3, 2, 5, 4], [12, 4, 12, 4, 12, 5], [0, 3, 0, 3, 0, 0]
    ],
    // Left Wall
    [
      [13, 3, 4], [12, 12, 5], [0, 0, 0]
    ],
    // Right Wall
    [
      [9, 2, 9], [12, 3, 12], [0, 4, 0]
    ]
  ]
];

export function createCastle() {
  return solidCastleWall(-48, true) // front Wall
    .merge(corner(frontLeftCornerRoom, true).translate_(42, 0, -48).computeNormals()) // front-right Corner
    .merge(corner(frontLeftCornerRoom, true).translate_(-42, 0, -48)) // front-left Corner
    .merge(corner(frontLeftCornerRoom, true, true).translate_(-42, 0, 48)) // rear-right Corner
    .merge(corner(rearRightCornerRoom, true, true).rotate_(0, Math.PI / 4).computeNormals(true).translate_(42, 0, 48)) // rear-left Corner
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
  return new SegmentedWall([26, 12, 26], 12, [12, hasDoor ? 1 : 12, 12], [0, 0, 0], 0, BaseLevel, 6)
    .merge(castleTopper(63, 12, 3))
    .merge(castleTopper(63, 12, -3))
    .translate_(0,0, z)
    .done_();
}

export function hollowCastleWall(x: number) {
  const testWall = new SegmentedWall(patternFill([3, 1], 18), 12, patternFill([12, 5], 18), patternFill([0, 4], 18), 0, 0);
  const testWall2 = new SegmentedWall(patternFill([3, 1], 18), 12, patternFill([12, 5], 18), patternFill([0, 4], 18), 0, 0);
  return createHallway(testWall, testWall2, 5)
    .merge(castleTopper(75, 12, 6))
    .merge(castleTopper(75, 12, -6))
    .rotate_(0, Math.PI / 2, 0)
    .translate_(x)
    .computeNormals();
}

export function corner(floors: number[][][][], isTopped?: boolean, isRounded?: boolean) {
  const rooms = floors.map((walls, floorNumber) => {
    const segmentedWalls = walls.map(wall => {
      return new SegmentedWall(wall[0], 12, wall[1], wall[2], 0, floorNumber * 12);
    });

    // @ts-ignore
    return isRounded ? tubify(createBox(...segmentedWalls), 10, 10, 13.5) : createBox(...segmentedWalls);
  });

  if (isTopped) {
    const top = createBox(
      castleTopper(24, 24, 0),
      castleTopper(24, 24, 0),
      castleTopper(20, 24, 0),
      castleTopper(20, 24, 0),
    );
    rooms.push(isRounded ? tubify(top,  11, 12, 14) : top);
  }

  return rooms.reduce((acc, current) => acc.merge(current));
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
