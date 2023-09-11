import { getTextureForSide, MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { SegmentedWall } from '@/modeling/building-blocks';
import { materials } from "@/textures";
import { Object3d } from "@/engine/renderer/object-3d";
import { AttributeLocation } from "@/engine/renderer/renderer";
import { DoorData, LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export function stake() {
  return new Mesh(new MoldableCubeGeometry(0.5, 0.5, 2, 2, 2)
    .selectBy(vert => vert.z > 0 && vert.x === 0)
    .translate_(0, 0, 1)
    .scale_(1, 0, 1)
    .all_()
    .spreadTextureCoords()
    // .rotate_(0, -1)
    // .translate_(-51, 21.5, -65)
    .done_(), materials.wood);
}

export function key() {
  return new Mesh(
    new MoldableCubeGeometry(1, 1, 0.5, 1, 3)
      .cylindrify(1, 'z')
      .merge(new SegmentedWall([1, 0.5, 0.5, 0.5], 1, [0.25, 1, 0.25, 1], [0], 0, 0, 0.5).translate_(2, -0.75))
      .scale_(0.5, 0.5, 0.5)
      .rotate_(0, Math.PI / 2)
      .translate_(-32,36,60)
      .done_(),
    materials.gold);
}

export function upyri() {
  const fang = () => new MoldableCubeGeometry(2, 0.5, 2, 3, 1, 3)
    .cylindrify(0.08)
    .selectBy(vert => vert.y > 0)
    .scale_(0, 1, 0)
    .all_()
    .translate_(0, 0.25, -0.3)
    .rotate_(0.1)
    .setAttribute_(AttributeLocation.TextureDepth,  new Float32Array(getTextureForSide(9, 9, materials.silver.texture!)), 1);

  const obj = new Mesh(new MoldableCubeGeometry(1, 1, 1, 6, 6, 6)
      .spherify(0.8)
      .scale_(1, 1.3, 0.8)
      .selectBy(vert => vert.y > 0.7)
      .scale_(3, 1, 1)
      .selectBy(vert => vert.y > 0.8)
      .scale_(1.5, 8, 2)
      .setAttribute_(AttributeLocation.TextureDepth, new Float32Array(MoldableCubeGeometry.TexturePerSide(6, 6, 6,
        materials.iron.texture!,
        materials.iron.texture!,
        materials.iron.texture!,
        materials.iron.texture!,
        materials.face.texture!,
        materials.face.texture!,
      )), 1)
      .merge(fang().translate_(-0.2))
      .merge(fang().translate_(0.2))
      .computeNormals(true)
      .all_()
      .rotate_(Math.PI)
      .done_()
    , materials.face);

  obj.position_.y = 54;

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
    .computeNormals()
    .done_();
}

export function fenceDoor() {
  return new Mesh(
    new SegmentedWall([0.25, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.25], 7, [7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], 0, 0, 0.15)
      .translate_(0, -3.5)
      .done_(),
    materials.silver);
}

export function woodenDoor(hasLock = false, width_ = 4, height_ = 7) {
  const doorTextures = MoldableCubeGeometry.TexturePerSide(1, 1, 1,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.planks.texture!,
    materials.planks.texture!,
  );
  const doorGeo = new MoldableCubeGeometry(width_, height_, 1);

  doorGeo.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(doorTextures), 1);

  const barGeo = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2).translate_(0, width_ === 4 ? 2.5: 5).spreadTextureCoords();
  const barGeo2 = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2).translate_(0, width_ === 4 ? -2.5: -1).spreadTextureCoords();

  const barTextures = MoldableCubeGeometry.TexturePerSide(1, 1, 1,
    materials.iron.texture!,
    materials.iron.texture!,
    materials.iron.texture!,
    materials.iron.texture!,
    materials.iron.texture!,
    materials.iron.texture!,
  );

  barGeo.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(barTextures), 1);
  barGeo2.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(barTextures), 1);


  const lock = new MoldableCubeGeometry(1, 1, 1.2).translate_(-1.4).done_();

  const lockTextures = MoldableCubeGeometry.TexturePerSide(1, 1, 1,
    materials.gold.texture!,
    materials.gold.texture!,
    materials.gold.texture!,
    materials.gold.texture!,
    materials.keyLock.texture!,
    materials.keyLock.texture!,
  );

  lock.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(lockTextures), 1);

  doorGeo.merge(barGeo).merge(barGeo2);

  if (hasLock) {
    doorGeo.merge(lock);
  }

  doorGeo.done_();

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
