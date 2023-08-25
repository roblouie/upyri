import { Texture } from '@/engine/renderer/texture';

export class Material {
  color = [1.0, 1.0, 1.0, 1.0];
  emissive = [0.0, 0.0, 0.0, 0.0];
  texture?: Texture;
  isTransparent = false;

  constructor(props?: { color?: [number, number, number, number], texture?: Texture, emissive?: [number, number, number, number], isTransparent?: boolean }) {
    this.color = props?.color ? props.color : this.color;
    this.texture = props?.texture;
    this.emissive = props?.emissive ? props.emissive : this.emissive;
    this.isTransparent = props?.isTransparent ?? this.isTransparent;
  }
}
