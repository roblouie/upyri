import { Object3d } from '@/engine/renderer/object-3d';

export class OrthoCamera extends Object3d {
  projection: DOMMatrix;

  constructor(bottom: number, top: number, left: number, right: number, near: number, far: number) {
    super();
    this.projection = new DOMMatrix([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1,
    ]);
  }
}
