import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { SegmentedWall } from '@/modeling/building-blocks';
import { materials } from "@/textures";
import { Object3d } from "@/engine/renderer/object-3d";
import { AttributeLocation } from "@/engine/renderer/renderer";

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
  const obj = new Mesh(new MoldableCubeGeometry(1, 1, 1, 4, 4, 4)
      .spherify(1)
      .scale_(1, 1.3, 0.8)
      // .selectBy(vert => vert.y > 0.2)
      // .scale_(0.8)
      .computeNormals(true)
      .all_()
      .rotate_(Math.PI)
      // .rotate_(0,Math.PI / 64)
      .done_()
    , materials.face);

  const textures = MoldableCubeGeometry.TexturePerSide(4, 4, 4,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.face.texture!,
    materials.face.texture!,
  );

  obj.position_.y = 54;

  obj.geometry.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(textures), 1);

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
      .translate_(1 * swap, 0, -1)
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

  const barGeo = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2).translate_(0, 2.5).spreadTextureCoords();
  const barGeo2 = new MoldableCubeGeometry(width_ + .05, 0.5, 1.2).translate_(0, -2.5).spreadTextureCoords();

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
