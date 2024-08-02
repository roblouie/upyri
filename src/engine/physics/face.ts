import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { calculateFaceNormal } from '@/engine/helpers';

export class Face {
  points: EnhancedDOMPoint[];
  normal: EnhancedDOMPoint;

  constructor(points: EnhancedDOMPoint[], normal?: EnhancedDOMPoint) {
    this.points = points;
    this.normal = normal ?? calculateFaceNormal(points);
  }
}
