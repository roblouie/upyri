import {
  createBox,
  createHallway,
  mergeCubes,
  patternFill,
  SegmentedWall
} from '@/modeling/building-blocks';
import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';


export const castleContainer: { value?: MoldableCubeGeometry } = { value: undefined };

// @ts-ignore
const levelDecompressor = (compressedData: any[]) => compressedData.map(floor => floor.map(wall => wall.map(segment => segment.split('').map(s => s.charCodeAt() - 65))));

export const frontLeftCornerRoom = levelDecompressor([
  [
    [
      'JEFCC',
      'MFMGM',
      'AAACA'
    ],
    [
      'LL',
      'MM',
      'AA'
    ],
    [
      'EDN',
      'FMM',
      'AAA'
    ],
    [
      'KK',
      'MM',
      'AA'
    ]
  ],
  [
    [
      'JEECD',
      'MFMEM',
      'AAADA'
    ],
    [
      'KCK',
      'MDM',
      'ACA'
    ],
    [
      'CCEEI',
      'MEMFM',
      'ACAAA'
    ],
    [
      'JCJ',
      'MDM',
      'ACA'
    ]
  ]
]);

export const rearRightCornerRoom = structuredClone(frontLeftCornerRoom);
rearRightCornerRoom[0][0] = [[9.25, 4 - 0.5, 6.25, 3], [12, 5, 12, 5], [0]];
rearRightCornerRoom[1][0] = [[9, 4, 4, 2, 3], [12, 5, 12, 4, 12], [0, 0, 0, 2, 0]];

export const otherCorners = levelDecompressor([
  [
    [
      'CCFEFCC',
      'MGMFMGM',
      'ACAAACA'
    ],
    [
      'DCMCD',
      'MGMMM',
      'ACAAA'
    ],
    [
      'BCOCB',
      'MGMMM',
      'ACAAA'
    ],
    [
      'BCOCB',
      'MGMGM',
      'ACACA'
    ]
  ],
  [
    [
      'CCFEFCC',
      'MGMFMGM',
      'ACAAACA'
    ],
    [
      'DCFCFCD',
      'MGMGMGM',
      'ACACACA'
    ],
    [
      'BCOCB',
      'MGMGM',
      'ACACA'
    ],
    [
      'DEGED',
      'MGMGM',
      'ACACA'
    ]
  ]
]);

export const getSize = (sizes: number[]) => sizes.reduce((acc, curr) => acc + curr);

export function createCastle() {

  return solidCastleWall(-60, true) // front Wall

    // front-right Corner
    .merge(corner(otherCorners, true)
      .merge(cornerRamp())
      .merge(castleTopper(5, 0, 0).rotate_(Math.PI / 2, -1, 0).translate_(-20, 1, 13))
      .translate_(53, 0, -60)
      .computeNormals()
    )

    // front-left Corner
    .merge(
      // walls
      corner(frontLeftCornerRoom, true)
        // floors
        .merge(createCastleFloors(getSize(frontLeftCornerRoom[0][2][0]), getSize(frontLeftCornerRoom[0][0][0])))
        .translate_(-53, 0, -60)
    )

    // rear-left Corner
    .merge(
      corner(otherCorners, true, true)
        .scale_(-1, 1, -1)
        .computeNormals(true)
        .merge(
          cornerRamp(true, true)
            .rotate_(0, -Math.PI / 2)
        )
        // floors
        .merge(
          createCastleFloors(getSize(otherCorners[0][2][0]), getSize(otherCorners[0][0][0]), true, true)
        )
        .translate_(-53, 0, 60)
    )

    // rear-right corner
    .merge(
      corner(rearRightCornerRoom, true, true)
        .rotate_(0, Math.PI)
        .computeNormals(true)
        .merge(
          cornerRamp(true, true)
            .rotate_(0, -Math.PI / 4)
        )
        // floors
        .merge(
          createCastleFloors(getSize(rearRightCornerRoom[0][2][0]), getSize(rearRightCornerRoom[0][0][0]), true, true)
        )
        .translate_(53, 0, 60)) // rear-left Corner


    .merge(solidCastleWall(60)) // back Wall

    // Left Wall
    .merge(hollowCastleWall(-53))
    .merge(hollowCastleWall(53))

    // Key pedestal
    .merge(new MoldableCubeGeometry(2, 3, 2, 2, 1, 2).cylindrify(1.2).translate_(-32,13.1,59.5).spreadTextureCoords())

    // Key doorway
    .merge(new SegmentedWall([1.5, 4, 1.5], 8, [8, 1, 8], [0], 0, 0, 0.5).rotate_(0, Math.PI / 2).translate_(-27, 11.5, 59.5).computeNormals());
}


export function createCastleFloors(width_: number, depth: number, skipMiddle?: boolean, cylindrify?: boolean, skipTop?: boolean) {
  const cyli = (cube: MoldableCubeGeometry) => cylindrify ? cube.cylindrify(12) : cube;
  const floors = cyli(new MoldableCubeGeometry(width_, 1, depth, cylindrify ? 4 : 1, 1, cylindrify ? 4 : 1).translate_(0,cylindrify ? -0.3 : -0.4)).spreadTextureCoords();

  if (!skipTop) {
    floors.merge(cyli(new MoldableCubeGeometry(width_, 1, depth, cylindrify ? 4 : 1, 1, cylindrify ? 4 : 1).translate_(0, 23)).spreadTextureCoords());
  }

  if (!skipMiddle) {
    floors.merge(cyli(new MoldableCubeGeometry(width_, 1, depth, cylindrify ? 4 : 1, 1, cylindrify ? 4 : 1).translate_(0, 11)).spreadTextureCoords());
  }

  return floors;
}



export function castleTopper(length: number, startingHeight: number, zPos: number, isRounded = false) {
  const segmentWidths = patternFill([1, 2], length * 2);
  return new SegmentedWall(segmentWidths, 3, patternFill([1.1, 3], segmentWidths.length / 3), [0, 0], 0, 0, 2, isRounded, isRounded)
    .rotate_(0, 0, Math.PI)
    .translate_(0, startingHeight + 3, zPos)
    .computeNormals();
}

export function solidCastleWall(z: number, hasDoor?: boolean) {
  return new SegmentedWall([36, 12, 36], 11.5, [12, hasDoor ? 1 : 12, 12], [0, 0, 0], 0, 0, 8)
    .merge(castleTopper(hasDoor ? 76 : 82, 11.5, 4).translate_(hasDoor ? -4 : 0))
    .merge(castleTopper(hasDoor ? 85 : 13, 11.5, -4).translate_(hasDoor ? 0 : 33.5))
    .translate_(0,0, z);
}

export function hollowCastleWall(x: number) {
  const walls = [
    new SegmentedWall(patternFill([5, 2, 5], 24), 12, patternFill([12, 3, 12], 24), patternFill([0, 2, 0], 24), 0, 0),
    new MoldableCubeGeometry(96, 24, 2).spreadTextureCoords()
  ];
  if (x > 0) {
    walls.reverse();
  }
  // @ts-ignore
  return createHallway(...walls, 5)
    .merge(castleTopper(95, 12, 6))
    .merge(castleTopper(95, 12, -6))
    .merge(createCastleFloors(98, 9, false, false, true))
    .rotate_(0, Math.PI / 2, 0)
    .translate_(x)
    .computeNormals();
}

export function corner(floors: number[][][][], isTopped?: boolean, isRounded?: boolean) {
  const rooms = floors.map((walls, floorNumber) => {
    const segmentedWalls = walls.map(wall => {
      return new SegmentedWall(wall[0], 12, wall[1], wall[2], 0, floorNumber * 12, 2, isRounded, isRounded);
    });

    // @ts-ignore
    return isRounded ? tubify(createBox(...segmentedWalls), 10, 11, 13.5) : createBox(...segmentedWalls);
  });

  if (isTopped) {
    const top = createBox(
      castleTopper(getSize(floors[0][0][0]) + 2, 24, 0, isRounded),
      castleTopper(getSize(floors[0][0][0]) + 2, 24, 0, isRounded),
      castleTopper(getSize(floors[0][2][0]), 24, 0, isRounded),
      castleTopper(getSize(floors[0][2][0]), 24, 0, isRounded),
    );
    rooms.push(isRounded ? tubify(top,  11, 12, 14) : top);
  }

  return mergeCubes(rooms);
}

function tubify(moldableCubeBox: MoldableCubeGeometry, selectSize: number, innerRadius: number, outerRadius: number) {
  return moldableCubeBox
    .selectBy(vertex => Math.abs(vertex.x) <= selectSize && Math.abs(vertex.z) <= selectSize)
    .cylindrify(innerRadius, 'y')
    .invertSelection()
    .cylindrify(outerRadius, 'y')
    .computeNormals(true)
    .all_();
}

export function cornerRamp(isRounded?: boolean, isFlipped?: boolean, includeWalkway = true) {
  const rampWidth = 5;
  const flip = isFlipped ? -1 : 1;

  function makeRamp(length: number, baseHeight: number, endHeight: number, width: number, transformCallback: (cube: MoldableCubeGeometry) => MoldableCubeGeometry) {
    const subdivisions = 2;
    const stepCount =  Math.floor(length / subdivisions);
    const stepWidth = length / stepCount;
    const heightDifference = endHeight - baseHeight;
    const stepHeight = heightDifference / stepCount;
    return mergeCubes(doTimes(stepCount, index => {
        const currentHeight = baseHeight + index * stepHeight + stepHeight;
        return transformCallback(new MoldableCubeGeometry(stepWidth, currentHeight, width)
          .selectBy(vert => vert.x < 0 && vert.y > 0)
          .translate_(0, -stepHeight)
          .all_()
          .translate_(index * stepWidth + stepWidth / 2, currentHeight / 2)).spreadTextureCoords()
      })
    );
  }


  // room are 22x20
  const ramp = makeRamp(11, 0, 5, rampWidth, cube => cube.translate_(-7, 0, -7.5 * flip))
    .merge(new MoldableCubeGeometry(rampWidth, 5, rampWidth, 3).translate_(6.5, 2.5, -7.5 * flip).spreadTextureCoords())
    .merge(makeRamp(10, 5, 11.5, rampWidth, cube => cube).rotate_(0, -Math.PI / 2 * flip).translate_(6.5, 0, -5 * flip))

  if (includeWalkway) {
    ramp.merge(new MoldableCubeGeometry(18, 1, 5, 4).translate_(0, 11, 7.5 * flip).spreadTextureCoords())
      .merge(new MoldableCubeGeometry(5, 1, 15, 1, 1, 6).translate_(-6.5, 11, -2.5 * flip).spreadTextureCoords());
  }

  return isRounded ? ramp.selectBy(vert => Math.abs(vert.x) <= 8 && Math.abs(vert.z) <= 5).invertSelection().cylindrify(12).all_() : ramp;
}
