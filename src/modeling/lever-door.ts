import { Object3d } from '@/engine/renderer/object-3d';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Face } from '@/engine/physics/face';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';

export class DoorData extends Object3d {
  swapHingeSideX: -1 | 1;
  swapHingeSideZ: -1 | 1;
  closedDoorCollisionM: Mesh;
  openDoorCollisionM: Mesh;
  closedDoorCollision: Face[];
  openDoorCollision: Face[];

  constructor(doorMesh: Mesh, position_: EnhancedDOMPoint, swapHingeSideX: 1 | -1 = 1, swapHingeSideZ: 1 | -1 = 1) {
    super(doorMesh);
    this.swapHingeSideX = swapHingeSideX;
    this.swapHingeSideZ = swapHingeSideZ;

    this.position_.set(position_.x - 2 * swapHingeSideX, position_.y, position_.z);
    this.children_[0].position_.x = 2 * swapHingeSideX;

    this.closedDoorCollisionM = new Mesh(
      new MoldableCubeGeometry(4, 7, 1)
        .translate_(position_.x, position_.y, position_.z)
        .done_()
      , new Material({ color: [1, 0, 1, 1]}));

    this.openDoorCollisionM = new Mesh(
      new MoldableCubeGeometry(4, 7, 1)
        .rotate_(0, Math.PI / 2)
        .translate_(position_.x - 2 * swapHingeSideX, position_.y, position_.z - 2 * swapHingeSideZ)
        .done_()
      , new Material({ color: [0, 1, 1, 1]}));
  }
}

export class LeverDoorObject3d extends Object3d {
  doorDatas: DoorData[] = [];
  isPulled = false;
  isFinished = false;
  switchPosition: EnhancedDOMPoint;
  closedDoorCollisionMs: Mesh[];
  openDoorCollisionMs: Mesh[];
  closedDoorCollision: Face[];
  openDoorCollision: Face[];

  constructor(switchPosition: EnhancedDOMPoint, doorDatas: DoorData[], switchRotationDegrees = 0) {
    const base = new Mesh(new MoldableCubeGeometry(1, 2, 1), new Material({ color: [0, 1, 0, 1] }));
    const lever = new Mesh(new MoldableCubeGeometry(1, 1, 4, 3, 3).cylindrify(0.25, 'z').done_(), new Material({ color: [1, 0, 0, 1] }));
    super(base, lever);

    this.doorDatas = doorDatas;
    this.switchPosition = switchPosition;
    this.position_.set(switchPosition);
    this.rotation_.y = switchRotationDegrees;

    lever.rotation_.x = -45;

    this.closedDoorCollisionMs = doorDatas.flatMap(door => door.closedDoorCollisionM);
    this.openDoorCollisionMs = doorDatas.flatMap(door => door.openDoorCollisionM);

    this.closedDoorCollision = getGroupedFaces(meshToFaces(this.closedDoorCollisionMs)).wallFaces;
    this.openDoorCollision = getGroupedFaces(meshToFaces(this.openDoorCollisionMs)).wallFaces;
  }

  update(){
    if (this.isPulled && !this.isFinished) {
      this.doorDatas.forEach(door => {
        door.rotation_.y += 0.6 * door.swapHingeSideX * door.swapHingeSideZ;
        this.children_[1].rotation_.x += 0.6;
        if (Math.abs(door.rotation_.y) >= 90) {
          this.isFinished = true;
        }
      });
    }
  }
}

