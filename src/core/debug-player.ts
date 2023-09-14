import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import {
  findFloorHeightAtPosition,
  findWallCollisionsFromList,
} from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { clamp } from '@/engine/helpers';
import { indoorFootsteps, outsideFootsteps } from '@/sound-effects';


export class DebugPlayer {
  velocity = new EnhancedDOMPoint(0, 0, 0);
  isCollisionEnabled = true;
  camera: Camera;
  cameraRotation = new EnhancedDOMPoint(0, 0, 0);
  listener: AudioListener;

  constructor(camera: Camera, isCollisionEnabled = true) {
    this.camera = camera;
    this.camera.position_.y = 80;
    this.listener = audioCtx.listener;
    this.isCollisionEnabled = isCollisionEnabled;

    const rotationSpeed = 0.0005;
    controls.onMouseMove(mouseMovement => {
      this.cameraRotation.x += mouseMovement.y * -rotationSpeed;
      this.cameraRotation.y += mouseMovement.x * -rotationSpeed;
      this.cameraRotation.x = clamp(this.cameraRotation.x, -Math.PI / 2, Math.PI / 2);
      this.cameraRotation.y = this.cameraRotation.y % (Math.PI * 2);
    });
  }

  update(gridFaces: {floorFaces: Face[], wallFaces: Face[]}[]) {
    this.updateVelocityFromControls();


    const playerGridPosition = this.camera.position_.x < 0 ? 0 : 1;


    // @ts-ignore
    if (this.isCollisionEnabled) {
      this.collideWithLevel(gridFaces[playerGridPosition]); // do collision detection, if collision is found, feetCenter gets pushed out of the collision
    }

    this.camera.position_.add_(this.velocity);

    // @ts-ignore
    this.camera.setRotation_(...this.cameraRotation.toArray());

    this.camera.updateWorldMatrix();

    this.updateAudio();
  }

  wallCollision(wallFaces: Face[]) {
    const wallCollisions = findWallCollisionsFromList(wallFaces, this.camera.position_, 1.1, 1.5);
    this.camera.position_.x += wallCollisions.xPush;
    this.camera.position_.z += wallCollisions.zPush;
    if (wallCollisions.numberOfWallsHit > 0) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
  }

  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
   this.wallCollision(groupedFaces.wallFaces);

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.camera.position_);

    if (!floorData) {
      return;
    }


    const collisionDepth = floorData.height - this.camera.position_.y;

    if (collisionDepth > 0) {
      this.camera.position_.y += collisionDepth;
      this.velocity.y = 0;
    }
  }

  slowSpeed = 0.05;
  fastspeed = 0.4;

  protected updateVelocityFromControls() {
    const speed = controls.keyMap.get('ShiftLeft') ? this.fastspeed : this.slowSpeed;
    const isVert = controls.keyMap.get('KeyQ');

    // const depthMovementZ = Math.cos(this.cameraRotation.y) * controls.inputDirection.y;
    // const depthMovementX = Math.sin(this.cameraRotation.y) * controls.inputDirection.y;
    // const depthMovementY = Math.cos(this.cameraRotation.x) * controls.inputDirection.y;
    //
    // const sidestepZ = Math.cos(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x;
    // const sidestepX = Math.sin(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x;

    const cameraDirection = new EnhancedDOMPoint(controls.inputDirection.x, 0, isVert ? 0 : controls.inputDirection.y);

    const updatedPoint = this.camera.rotationMatrix.transformPoint(cameraDirection);

    if (isVert) {
      updatedPoint.y -=controls.inputDirection.y * speed;
    }

    this.velocity.z = updatedPoint.z;
    this.velocity.x = updatedPoint.x;
    this.velocity.y = updatedPoint.y;
    this.velocity.normalize_().scale_(speed);
  }

  private updateAudio() {
    if (this.listener.positionX) {
      this.listener.positionX.value = this.camera.position_.x;
      this.listener.positionY.value = this.camera.position_.y;
      this.listener.positionZ.value = this.camera.position_.z;

      const lookingDirection = new EnhancedDOMPoint(0, 0, -1);
      const result_ = this.camera.rotationMatrix.transformPoint(lookingDirection);

      this.listener.forwardX.value = result_.x;
      this.listener.forwardY.value = result_.y;
      this.listener.forwardZ.value = result_.z;
    }
  }
}
