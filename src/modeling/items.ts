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
    .rotate_(0, -1)
    .translate_(-40, 21.5, -53)
    .done_(), materials.wood);
}

export function key() {
  return new Mesh(
    new MoldableCubeGeometry(1, 1, 0.5, 1, 3)
      .cylindrify(1, 'z')
      .merge(new SegmentedWall([1, 0.5, 0.5, 0.5], 1, [0.25, 1, 0.25, 1], [0], 0, 0, 0.5).translate_(2, -0.75))
      .scale_(0.5, 0.5, 0.5)
      .rotate_(0, Math.PI / 2)
      .translate_(-24,36,48.5)
      .done_(),
    materials.stone);
}

export function upyri() {
  const obj = new Object3d(new Mesh(new MoldableCubeGeometry(1, 1, 1, 4, 4, 4)
      .spherify(1)
      .scale_(1, 1.3, 0.8)
      // .selectBy(vert => vert.y > 0.2)
      // .scale_(0.8)
      .computeNormals(true)
      .all_()
      .rotate_(Math.PI / 2)
      .rotate_(0,Math.PI / 64)
      .done_()
    , materials.face));

  const textures = MoldableCubeGeometry.TexturePerSide(4, 4, 4,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.wood.texture!,
    materials.face.texture!,
    materials.face.texture!,
  )

  obj.position_.y = 48;

  (obj.children_[0] as Mesh).geometry.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(textures), 1);

  return obj;
}
