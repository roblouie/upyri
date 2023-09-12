import { getTextureForSide, MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { patternFill, SegmentedWall } from '@/modeling/building-blocks';
import { materials } from "@/textures";
import { AttributeLocation } from "@/engine/renderer/renderer";
import { DoorData, LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { PlaneGeometry } from '@/engine/plane-geometry';

export function stake() {
  return new Mesh(new MoldableCubeGeometry(0.5, 0.5, 2, 2, 2)
    .selectBy(vert => vert.z > 0 && vert.x === 0)
    .translate_(0, 0, 1)
    .scale_(1, 0, 1)
    .all_()
    .spreadTextureCoords(), materials.wood);
}

export function key() {
  return new Mesh(
    new MoldableCubeGeometry(1, 1, 0.5, 1, 3)
      .cylindrify(1, 'z')
      .merge(new SegmentedWall([1, 0.5, 0.5, 0.5], 1, [0.25, 1, 0.25, 1], [0], 0, 0, 0.5).translate_(2, -0.75))
      .scale_(0.5, 0.5, 0.5)
      .rotate_(0, Math.PI / 2)
      .translate_(-32,36,60),
    materials.gold);
}

export function upyri() {
  const fang = () => new MoldableCubeGeometry(2, 0.5, 2, 3, 1, 3)
    .cylindrify(0.08)
    .selectBy(vert => vert.y > 0)
    .scale_(0, 1, 0)
    .all_()
    .translate_(0, 0.3, 0.53)
    .rotate_(0.2)
    .setAttribute_(AttributeLocation.TextureDepth,  new Float32Array(getTextureForSide(9, 9, materials.silver.texture!)), 1);

  const obj = new Mesh(new MoldableCubeGeometry(1, 1, 1, 6, 6, 6)
      .spherify(0.8)
      .scale_(1, 1.3, 0.8)
      .selectBy(vert => vert.y > 0.7)
      .scale_(3, 1, 1)
      .selectBy(vert => vert.y > 0.8)
      .scale_(1.5, 8, 2)
      .texturePerSide(
        materials.iron.texture!,
        materials.iron.texture!,
        materials.iron.texture!,
        materials.iron.texture!,
        materials.face.texture!,
        materials.face.texture!,
      )
      .merge(fang().translate_(-0.2))
      .merge(fang().translate_(0.2))
      .computeNormals(true)
      .all_()
      .rotate_(Math.PI)
    , materials.face);

  obj.position_.set(0, 54, 2);

  return obj;
}

export function makeCoffinBottomTop() {
  return new MoldableCubeGeometry(3, 0.5, 7.5, 1, 1, 2)
    .selectBy(vertex => vertex.z === 0)
    .translate_(0, 0, -1)
    .scale_(1.5)
    .all_()
    .translate_(0, -0.2, 9)
    .spreadTextureCoords();
}

export function makeCoffin() {
  function makeCoffinSide(swap = 1) {
    return new MoldableCubeGeometry(0.5, 2, 7.5, 1, 1, 2)
      .selectBy(vertex => vertex.z === 0)
      .translate_(swap, 0, -1)
      .all_()
      .translate_(1.5 * swap, 0.4, 9)
      .spreadTextureCoords();
  }

  function makeCoffinFrontBack(isSwap = false) {
    return new MoldableCubeGeometry(3, 2, 0.5)
      .selectBy(vertex => (isSwap ? -vertex.z : vertex.z) > 0)
      .scale_(1.17)
      .all_()
      .translate_(0, 0.4, isSwap ? 13 : 5)
      .spreadTextureCoords();
  }

  return makeCoffinSide(-1)
    .merge(makeCoffinSide())
    .merge(makeCoffinFrontBack())
    .merge(makeCoffinFrontBack(true))
    .merge(makeCoffinBottomTop())
    .computeNormals();
}

export function fenceDoor() {
  return new Mesh(
    new SegmentedWall([0.25, ...patternFill([0.5, 0.1], 11), 0.25], 7, patternFill([7, 1], 13), patternFill([0, 1], 13), 0, 0, 0.15)
      .translate_(0, -3.5),
    materials.silver);
}

export function woodenDoor(hasLock = false, width_ = 4, height_ = 7) {
  const doorGeo = new MoldableCubeGeometry(width_, height_, 1)
    .texturePerSide(
      materials.wood.texture!,
      materials.wood.texture!,
      materials.wood.texture!,
      materials.wood.texture!,
      materials.planks.texture!,
      materials.planks.texture!,
    );

  const barGeo = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2)
    .translate_(0, width_ === 4 ? 2.5: 5)
    .texturePerSide(
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
    )
    .spreadTextureCoords();
  const barGeo2 = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2)
    .translate_(0, width_ === 4 ? -2.5: -1)
    .texturePerSide(
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
      materials.iron.texture!,
    )
    .spreadTextureCoords();

  const lock = new MoldableCubeGeometry(1, 1, 1.2)
    .texturePerSide(
      materials.gold.texture!,
      materials.gold.texture!,
      materials.gold.texture!,
      materials.gold.texture!,
      materials.keyLock.texture!,
      materials.keyLock.texture!,
    )
    .translate_(-1.4);

  doorGeo.merge(barGeo).merge(barGeo2);

  if (hasLock) {
    doorGeo.merge(lock);
  }

  return new Mesh(doorGeo, new Material());
}

export function getLeverDoors() {
 return [
   // Corner entrance
     new LeverDoorObject3d(new EnhancedDOMPoint(42, 36, -60), [
      new DoorData(fenceDoor(), new EnhancedDOMPoint(53, 36.5, -49))
    ], -90),


    // Keep entrance
    new LeverDoorObject3d(new EnhancedDOMPoint(57, 24, 42), [
      new DoorData(woodenDoor(), new EnhancedDOMPoint(-2, 24.5, -15)),
      new DoorData(woodenDoor(), new EnhancedDOMPoint(2, 24.5, -15), -1, 1),
      new DoorData(woodenDoor(), new EnhancedDOMPoint(53, 24.5, 47), -1, -1)
    ], -90),

    // Locked door to upper keep
    new LeverDoorObject3d(new EnhancedDOMPoint(23, 0, 37.5), [
      new DoorData(woodenDoor(true), new EnhancedDOMPoint(23, 24.5, 37.5), -1)
    ]),


    // Front gate
    new LeverDoorObject3d(new EnhancedDOMPoint(3, 58, -12), [
      new DoorData(woodenDoor(false, 6, 15), new EnhancedDOMPoint(-3, 24, -60), 1, 1, false, true),
      new DoorData(woodenDoor(false, 6, 15), new EnhancedDOMPoint(3, 24, -60), -1, 1, false, true)
    ]),

    // Door to key
    new LeverDoorObject3d(new EnhancedDOMPoint(-11, 36, 50), [
      new DoorData(fenceDoor(), new EnhancedDOMPoint(-25, 36, 61.5), 1, 1, true)
    ], -90)
   ];
}

function bannerMaker(bannerHeightmap: number[]) {
    const banner = new PlaneGeometry(64, 64, 31, 31, bannerHeightmap)
      .selectBy(vert => vert.z <= 20)
      .modifyEachVertex(vert => vert.z -= Math.abs(vert.x) / 3)
      .all_()
      .spreadTextureCoords(60, 12, 0.5, 0.18)
      .scale_(0.05, 1, 0.2)
      .rotate_(-Math.PI / 2)
      .computeNormals(true);

  const textureDepths = banner.vertices.map(vert => {
    if (vert.y < -2.6 && vert.y > -5) {
      return materials.bannerIcon.texture!.id;
    } else {
      return materials.banner.texture!.id;
    }
  });

    banner.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(textureDepths), 1);

    return banner;
}

export function makeBanners(bannerHeightmap: number[]) {
  return new Mesh(
    bannerMaker(bannerHeightmap).translate_(18, 32, -16.6)
      .merge(bannerMaker(bannerHeightmap).translate_(-18, 32, -16.6)),
    materials.banner);
}

export function makeSymbols() {
  return new Mesh(new MoldableCubeGeometry(3, 3, 2, 12, 12, 1)
    .cylindrify(1.1, 'z')
      .spreadTextureCoords(40, 40)
    .merge(
      new MoldableCubeGeometry(3, 0.5, 2, 8, 1, 1)
        .translate_(0, 1.25)
        .spreadTextureCoords(40, 40)
        .merge(new MoldableCubeGeometry(0.4, 1, 2, 1, 8, 1).translate_(-1.3, 0.5).spreadTextureCoords(40, 40))
        .merge(new MoldableCubeGeometry(0.4, 1, 2, 1, 8, 1).translate_(1.3, 0.5).spreadTextureCoords(40, 40))
        .selectBy(vert => Math.abs(vert.y) <= 1 && Math.abs(vert.x) <= 1.2)
        .cylindrify(1, 'z', new EnhancedDOMPoint(0, -1, 0))
        .translate_(0, -0.2)
        .invertSelection()
        .cylindrify(1.2, 'z')
        .all_()
        .translate_(0, -2.3)
    )
      .scale_(3, 3)
      .translate_(0, 35, 30)
    .computeNormals(true)
    , materials.golds);
}
