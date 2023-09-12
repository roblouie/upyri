export interface VectorLike {
  x: number;
  y: number;
  z: number;
  w?: number;
}

export class EnhancedDOMPoint extends DOMPoint {
  add_(otherVector: VectorLike) {
    this.addVectors(this, otherVector);
    return this;
  }

  addVectors(v1: VectorLike, v2: VectorLike) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    this.z = v1.z + v2.z;
    return this;
  }

  set(x?: number | VectorLike, y?: number, z?: number): EnhancedDOMPoint {
    if (x && typeof x === 'object') {
      y = x.y;
      z = x.z;
      x = x.x;
    }
    this.x = x ?? this.x;
    this.y = y ?? this.y;
    this.z = z ?? this.z;
    return this;
  }

  clone_() {
    return new EnhancedDOMPoint(this.x, this.y, this.z, this.w);
  }

  scale_(scaleBy: number) {
    this.x *= scaleBy;
    this.y *= scaleBy;
    this.z *= scaleBy;
    return this;
  }

  subtract(otherVector: VectorLike) {
   this.subtractVectors(this, otherVector);
    return this;
  }

  subtractVectors(v1: VectorLike, v2: VectorLike) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
    this.z = v1.z - v2.z;
    return this;
  }

  crossVectors(v1: EnhancedDOMPoint, v2: EnhancedDOMPoint) {
    const x = v1.y * v2.z - v1.z * v2.y;
    const y = v1.z * v2.x - v1.x * v2.z;
    const z = v1.x * v2.y - v1.y * v2.x;
    this.x = x
    this.y = y
    this.z = z
    return this;
  }

  dot(otherVector: VectorLike): number {
    return this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  get magnitude() {
    return Math.hypot(...this.toArray());
  }

  normalize_() {
    const magnitude = this.magnitude;
    if (magnitude === 0) {
      return new EnhancedDOMPoint();
    }
    this.x /= magnitude;
    this.y /= magnitude;
    this.z /= magnitude;
    return this;
  }

  moveTowards(otherVector: EnhancedDOMPoint, speed: number) {
    const distance = new EnhancedDOMPoint().subtractVectors(otherVector, this);

    if (distance.magnitude > 2) {
      const direction_ = distance.normalize_().scale_(speed);
      this.add_(direction_);
    }

    return this;
  }

  isEqualTo(otherVector: EnhancedDOMPoint): boolean {
    return this.x === otherVector.x && this.y === otherVector.y && this.z === otherVector.z;
  }
}
