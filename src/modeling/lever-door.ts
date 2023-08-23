import { Object3d } from '@/engine/renderer/object-3d';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Face } from '@/engine/physics/face';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';

export class LeverDoorObject3d extends Object3d {
  door: Object3d;
  isPulled = false;
  isFinished = false;
  switchPosition: EnhancedDOMPoint;
  closedDoorCollisionM: Mesh;
  openDoorCollisionM: Mesh;
  closedDoorCollision: Face[];
  openDoorCollision: Face[];

  constructor(switchPosition: EnhancedDOMPoint, doorPosition: EnhancedDOMPoint, switchRotationDegrees = 0, doorRotationDegrees = 0) {
    const base = new Mesh(new MoldableCubeGeometry(1, 2, 1), new Material({ color: 'green' }));
    const lever = new Mesh(new MoldableCubeGeometry(1, 1, 4, 3, 3).cylindrify(0.25, 'z').done_(), new Material({ color: 'red' }));
    super(base, lever);

    this.switchPosition = switchPosition;
    this.position_.set(switchPosition);
    this.rotation_.y = switchRotationDegrees;

    lever.rotation_.x = -45;
    this.door = new Object3d(new Mesh(new MoldableCubeGeometry(4, 7, 1), new Material({ color: 'blue' })));
    this.door.position_.set(doorPosition.x - 2, doorPosition.y, doorPosition.z);
    this.door.children_[0].position_.x = 2;

    this.closedDoorCollisionM = new Mesh(new MoldableCubeGeometry(4, 7, 1).translate_(doorPosition.x, doorPosition.y, doorPosition.z).done_(), new Material({ color: '#F0F'}));
    this.openDoorCollisionM = new Mesh(new MoldableCubeGeometry(1, 7, 4).translate_(doorPosition.x -2, doorPosition.y, doorPosition.z -2).done_(), new Material({ color: '#0FF'}));

    this.closedDoorCollision = getGroupedFaces(meshToFaces([this.closedDoorCollisionM])).wallFaces;
    this.openDoorCollision = getGroupedFaces(meshToFaces([this.openDoorCollisionM])).wallFaces;
  }

  update(){
    if (this.isPulled && !this.isFinished) {
      this.door.rotation_.y += 0.6;
      this.children_[1].rotation_.x += 0.6;
      if (this.door.rotation_.y >= 90) {
        this.isFinished = true;
      }
    }
  }
}

