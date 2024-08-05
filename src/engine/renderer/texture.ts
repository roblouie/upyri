import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Texture {
  id: number;
  source: TexImageSource;
  textureRepeat = new EnhancedDOMPoint(1, 1);
  animationFunction?: Function;

  constructor(id: number, source: TexImageSource, animationFunction?: Function) {
    this.source = source;
    this.id = id;
    this.animationFunction = animationFunction;
  }
}
