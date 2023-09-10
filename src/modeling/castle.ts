import {
  createBox,
  createHallway,
  createStairs,
  mergeCubes,
  patternFill,
  SegmentedWall
} from '@/modeling/building-blocks';
import { doTimes } from '@/engine/helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

// TODO: Build castle at 0, translate whole thing up to 21
const windowTopHeight = 6;
const windowBottomHeight = 2;
const doorTopHeight = 5;
const windowWidth = 2;
const doorWidth = 4;

export const castleContainer: { value?: MoldableCubeGeometry } = { value: undefined };

export const frontLeftCornerRoom = [
  // First Floor
  [
    // Front Wall
    [
      [9, 4, 5, 2, 2], [12, 5, 12, 6, 12], [0, 0, 0, 2, 0]
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
      [10, 2, 10], [12, 3, 12], [0, 2, 0]
    ],
    // Left Wall
    [
      [2, 2, 4, 4, 8], [12, 4, 12, 5, 12], [0, 2, 0, 0, 0]
    ],
    // Right Wall
    [
      [9, 2, 9], [12, 3, 12], [0, 2, 0]
    ]
  ]
];

export const rearRightCornerRoom = structuredClone(frontLeftCornerRoom);
rearRightCornerRoom[0][0] = [[9.25, doorWidth - 0.5, 6.25, 3], [12, 5.5, 12, 5], [0]];
rearRightCornerRoom[1][0] = [[9, 4, 4, 2, 3], [12, 5, 12, 4, 12], [0, 0, 0, 2, 0]];

export const otherCorners = [
  // First Floor
  [
    // Front Wall
    [
      [2, 2, 5, 4, 5, 2, 2], [12, windowTopHeight, 12, doorTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, 0, 0, windowBottomHeight, 0]
    ],
    // Back Wall
    [
      [3, 2, 12, 2, 3], [12, windowTopHeight, 12, 12, 12], [0, windowBottomHeight, 0, 0, 0]
    ],
    // Left Wall
    [
      [1, 2, 14, 2, 1], [12, windowTopHeight, 12, 12, 12], [0, windowBottomHeight, 0, 0, 0]
    ],
    // Right Wall
    [
      [1, 2, 14, 2, 1], [12, windowTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, windowBottomHeight, 0]
    ]
  ],
  // Second Floor
  [
    // Front Wall
    [
      [2, 2, 5, 4, 5, 2, 2], [12, windowTopHeight, 12, doorTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, 0, 0, windowBottomHeight, 0]
    ],
    // Back Wall
    [
      [3, 2, 12, 2, 3], [12, windowTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, windowBottomHeight, 0]
    ],
    // Left Wall
    [
      [1, 2, 14, 2, 1], [12, windowTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, windowBottomHeight, 0]
    ],
    // Right Wall
    [
      [3, 4, 6, 4, 3], [12, windowTopHeight, 12, windowTopHeight, 12], [0, windowBottomHeight, 0, windowBottomHeight, 0]
    ]
  ]
]

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
    .merge(castleKeep())

    // Key pedestal
    .merge(new MoldableCubeGeometry(2, 3, 2, 2, 1, 2).cylindrify(1.2).translate_(-32,13.1,59.5).spreadTextureCoords())

    // Key doorway
    .merge(new SegmentedWall([1.5, 4, 1.5], 8, [8, 1, 8], [0], 0, 0, 0.5).rotate_(0, Math.PI / 2).translate_(-27, 11.5, 59.5).computeNormals())

    .done_();
}

function castleKeep() {
  return corner([
    [
      [
        [54], [12], [0],
      ],
      [
        [19, 2, 2, 8, 2, 2, 19], [12, 2, 12, 5, 12, 2, 12], [0, 3, 0, 0, 0, 3, 0],
      ],
      [
        [18, 2, 8, 2, 8, 2, 8, 2, 18], [12, 4, 12, 4, 12, 4, 12, 4, 12], [0, 3, 0, 3, 0, 3, 0, 3, 0]
      ],
      [
        [18, 2, 8, 2, 8, 2, 8, 2, 18], [12, 4, 12, 4, 12, 4, 12, 4, 12], [0, 3, 0, 3, 0, 3, 0, 3, 0]
      ],
    ],
    [
      [
        [3, 12, 39], [12, 6, 12], [0, 2, 0],
      ],
      [
        [15.5, 2, 5, 2, 5, 2, 5, 2, 15.5], [12, 3, 12, 3, 12, 3, 12, 3, 12], [0, 3, 0, 3, 0, 3, 0, 3, 0],
      ],
      [
        [18, 2, 8, 2, 8, 2, 8, 2, 18], [12, 4, 12, 4, 12, 4, 12, 4, 12], [0, 3, 0, 3, 0, 3, 0, 3, 0]
      ],
      [
        [18, 2, 8, 2, 8, 2, 8, 2, 18], [12, 4, 12, 4, 12, 4, 12, 4, 12], [0, 3, 0, 3, 0, 3, 0, 3, 0]
      ],
    ]
  ], true)
    // backdrop
    .merge(new MoldableCubeGeometry(22, 12, 24).translate_(0, 6, 22).spreadTextureCoords())
    // ceiling
    .merge(
      new SegmentedWall([2.5, 9, 4, 19, 4, 9, 2.5], 69, [69, 5, 69, 7.5, 69, 50, 69], [0, 5, 0, 45, 0, 5, 0], 0, 0, 2)
        .rotate_(Math.PI / 2)
        .translate_(0, 22.5, -34.5)
    )
    .merge(new MoldableCubeGeometry(9, 2, 38).translate_(-18, 22.5, 0).spreadTextureCoords().translate_(0, 0, 1.5))


    // Ramp to second level
    .merge(cornerRamp(false, false, false).rotate_(0, -Math.PI / 2).translate_(16, 0.5, 25))

    // Ramp to lever
    .merge(
      new MoldableCubeGeometry(4, 12, 20)
        .selectBy(vert => vert.y > 0 && vert.z < 0)
        .translate_(0, -12)
        .all_()
        .translate_(-18, 6, 16)
        .spreadTextureCoords()
        .merge(new MoldableCubeGeometry(14, 12, 8).translate_(-18, 6, 30).spreadTextureCoords())
    )

    // Transition to roof
    .merge(
      corner([
        [
          [
            [2, 18, 2], [12, 1, 5], [0],
          ],
          [
            [22], [12], [0],
          ],
          [
            [4, 16], [5, 12], [0],
          ],
          [
            [20], [12], [0],
          ],
        ],
        [
          [
            [22], [12], [0],
          ],
          [
            [22], [12], [0],
          ],
          [
            [1, 4, 15], [12, 5, 12], [0],
          ],
          [
            [20], [12], [0],
          ],
        ]
      ], true)
        .merge(cornerRamp(false, false, false))
        .translate_(0, 12, 22)
    )

    // Final Tower
    .merge(corner([
      [
        [
          [22], [12], [0],
        ],
        [
          [10, 2, 10], [12, 12, 12], [0],
        ],
        [
          [20], [12], [0],
        ],
        [
          [20], [12], [0],
        ],
      ],
      [
        [
          [9, 4, 9], [12, 5, 12], [0],
        ],
        [
          [10, 2, 10], [12, 7, 12], [0, 0.6, 0],
        ],
        [
          [20], [12], [0],
        ],
        [
          [20], [12], [0],
        ],
      ]
    ], true).selectBy(vert => vert.z < -10 && Math.abs(vert.x) <= 2 && vert.y > 11 && vert.y < 13)
      .translate_(0, -0.5, 0.5)
      .all_()
      .merge(createCastleFloors(21, 20))
      .translate_(0, 22.5, -22))

    // Ramp to final tower
    .merge(cornerRamp(false, true, false).translate_(-6.5, 23, -5))

    // Corner separator for ramp
    .merge(new MoldableCubeGeometry(10, 24, 12).translate_(16, 10, 23).spreadTextureCoords())


    // Floor
    .merge(new MoldableCubeGeometry(54, 0.5, 68).spreadTextureCoords())

    .merge(new MoldableCubeGeometry(2, 24, 2, 3, 1, 3).cylindrify(2).translate_(-10, 11).computeNormals(true).spreadTextureCoords())
    .merge(new MoldableCubeGeometry(2, 24, 2, 3, 1, 3).cylindrify(2).translate_(-10, 11, -20).computeNormals(true).spreadTextureCoords())
    .merge(new MoldableCubeGeometry(2, 24, 2, 3, 1, 3).cylindrify(2).translate_(10, 11).computeNormals(true).spreadTextureCoords())
    .merge(new MoldableCubeGeometry(2, 24, 2, 3, 1, 3).cylindrify(2).translate_(10, 11, -20).computeNormals(true).spreadTextureCoords())

    .translate_(0, 0, 20)
    .computeNormals();
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
    .translate_(0,0, z)
    .done_();
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
    .all_()
    .done_();
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
    ).done_();
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
