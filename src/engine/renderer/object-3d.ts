import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { radsToDegrees } from '@/engine/helpers';

export class Object3d {
  position_: EnhancedDOMPoint;
  scale_: EnhancedDOMPoint;
  children_: Object3d[];
  parent_?: Object3d;
  localMatrix: DOMMatrix;
  worldMatrix: DOMMatrix;
  up: EnhancedDOMPoint;
  rotationMatrix: DOMMatrix;

  constructor(...children: Object3d[]) {
    this.position_ = new EnhancedDOMPoint();
    this.scale_ = new EnhancedDOMPoint(1, 1, 1);
    this.children_ = [];
    this.localMatrix = new DOMMatrix();
    this.worldMatrix = new DOMMatrix();
    this.up = new EnhancedDOMPoint(0, 1, 0);
    this.rotationMatrix = new DOMMatrix();
    if (children) {
      this.add_(...children);
    }
  }

  add_(...object3ds: Object3d[]) {
    object3ds.forEach(object3d => {
      if (object3d.parent_) {
        object3d.parent_.children_ = object3d.parent_.children_.filter(child => child !== this);
      }
      object3d.parent_ = this;
      this.children_.push(object3d);
    })
  }

  remove_(object3d: Object3d) {
    this.children_ = this.children_.filter(child => child !== object3d);
  }

  rotation_ = new EnhancedDOMPoint();
  rotate_(xRads: number, yRads: number, zRads: number) {
    this.rotation_.add_({x: radsToDegrees(xRads), y: radsToDegrees(yRads), z: radsToDegrees(zRads)});
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  setRotation_(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix = new DOMMatrix();
    this.rotation_.set(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  isUsingLookAt = false;
  getMatrix() {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.position_.x, this.position_.y, this.position_.z);
    if (this.isUsingLookAt) {
      matrix.multiplySelf(this.rotationMatrix);
    } else {
      matrix.rotateSelf(this.rotation_.x, this.rotation_.y, this.rotation_.z);
    }
    matrix.scaleSelf(this.scale_.x, this.scale_.y, this.scale_.z);
    return matrix;
  }

  updateWorldMatrix() {
    // Don't udpate spirits to save time on matrix multiplication. Bit of a hack but ya it works...
    // @ts-ignore
    if (this.color !== undefined) {
      return;
    }

    this.localMatrix = this.getMatrix();

    if (this.parent_) {
      this.worldMatrix = this.parent_.worldMatrix.multiply(this.localMatrix);
    } else {
      this.worldMatrix = DOMMatrix.fromMatrix(this.localMatrix);
    }

      this.children_.forEach(child => child.updateWorldMatrix());
  }

  allChildren(): Object3d[] {
    function getChildren(object3d: Object3d, all: Object3d[]) {
      object3d.children_.forEach(child => {
        all.push(child);
        getChildren(child, all);
      });
    }

    const allChildren: Object3d[] = [];
    getChildren(this, allChildren);
    return allChildren;
  }

  private right = new EnhancedDOMPoint();
  private lookatUp = new EnhancedDOMPoint();
  forward = new EnhancedDOMPoint();

  lookAt(target: EnhancedDOMPoint) {
    this.isUsingLookAt = true;
    this.forward.subtractVectors(target, this.position_).normalize_();
    this.right.crossVectors(this.up, this.forward).normalize_();
    this.lookatUp.crossVectors(this.forward, this.right).normalize_();

    this.rotationMatrix = new DOMMatrix([
      this.right.x, this.right.y, this.right.z, 0,
      this.lookatUp.x, this.lookatUp.y, this.lookatUp.z, 0,
      -this.forward.x, -this.forward.y, -this.forward.z, 0,
      0, 0, 0, 1,
    ]);
  }
}

export function createLookAt2(position: EnhancedDOMPoint, target: EnhancedDOMPoint, up = { x: 0, y: 1, z: 0}) {
  const forward = new EnhancedDOMPoint().subtractVectors(target, position).normalize_();
  const right = new EnhancedDOMPoint().crossVectors(forward, up).normalize_();
  const lookAtUp = new EnhancedDOMPoint().crossVectors(right, forward);

  const invertedZ = new EnhancedDOMPoint(forward.x * -1, forward.y * -1, forward.z * -1);

  return new DOMMatrix([
    right.x, lookAtUp.x, invertedZ.x, 0,
    right.y, lookAtUp.y, invertedZ.y, 0,
    right.z, lookAtUp.z, invertedZ.z, 0,
    -right.dot(position), -lookAtUp.dot(position), -invertedZ.dot(position), 1,
  ]);
}

export function createOrtho(bottom, top, left, right, near, far) {
  return new DOMMatrix([
    2 / (right - left), 0, 0, 0,
    0, 2 / (top - bottom), 0, 0,
    0, 0, -2 / (far - near), 0,
    -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1,
  ]);
}

