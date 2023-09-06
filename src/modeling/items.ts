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
      .translate_(-22,36,60.5)
      .done_(),
    materials.stone);
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
