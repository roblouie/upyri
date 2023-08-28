import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Material } from '@/engine/renderer/material';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { clamp } from '@/engine/helpers';


export class FirstPersonPlayer {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;

  mesh: Mesh;
  camera: Camera;
  private cameraRotation = new EnhancedDOMPoint(0, 0, 0);

  listener: AudioListener;

  constructor(camera: Camera) {
    this.mesh = new Mesh(new MoldableCubeGeometry(0.3, 1, 0.3), new Material());
    this.feetCenter.y = 45;
    this.camera = camera;
    this.listener = audioCtx.listener;

    const rotationSpeed = 0.005;
    controls.onMouseMove(mouseMovement => {
      this.cameraRotation.x += mouseMovement.y * -rotationSpeed;
      this.cameraRotation.y += mouseMovement.x * -rotationSpeed;
      this.cameraRotation.x = clamp(this.cameraRotation.x, -Math.PI / 2, Math.PI / 2);
    });
  }

  update(groupedFaces: { floorFaces: Face[]; wallFaces: Face[] }) {
    // debug.innerHTML = this.feetCenter.y;
    this.updateVelocityFromControls();
    this.velocity.y -= 0.003; // gravity
    this.feetCenter.add_(this.velocity);
    this.collideWithLevel(groupedFaces);

    this.mesh.position_.set(this.feetCenter);
    this.mesh.position_.y += 0.5; // move up by half height so mesh ends at feet position

    this.camera.position_ = this.mesh.position_;
    this.camera.position_.y += 3.5;


    // @ts-ignore
    this.camera.setRotation_(...this.cameraRotation.toArray());

    this.camera.updateWorldMatrix();

    this.updateAudio();
  }

  wallCollision(wallFaces: Face[]) {
    const wallCollisions = findWallCollisionsFromList(wallFaces, this.feetCenter, 1.5, 1.5);
    this.feetCenter.x += wallCollisions.xPush;
    this.feetCenter.z += wallCollisions.zPush;
    if (wallCollisions.numberOfWallsHit > 0) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
  }

  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
   this.wallCollision(groupedFaces.wallFaces);

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.feetCenter);
    if (!floorData) {
      return;
    }

    const collisionDepth = floorData.height - this.feetCenter.y;

    if (collisionDepth > 0) {
      this.feetCenter.y += collisionDepth;
      this.velocity.y = 0;
      this.isJumping = false;
    }
  }

  protected updateVelocityFromControls() {
    const speed = 0.2;

    const mag = controls.inputDirection.magnitude;
    // const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);
    // const playerCameraDiff = this.mesh.position.clone().subtract(this.camera.position);
    // const playerCameraAngle = Math.atan2(playerCameraDiff.x, playerCameraDiff.z);
    //
    // if (controls.direction.x !== 0 || controls.direction.z !== 0) {
    //   this.angle = inputAngle + playerCameraAngle;
    // }


    const depthMovementZ = Math.cos(this.cameraRotation.y) * controls.inputDirection.y * speed;
    const depthMovementX = Math.sin(this.cameraRotation.y) * controls.inputDirection.y * speed;

    const sidestepZ = Math.cos(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;
    const sidestepX = Math.sin(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;

    this.velocity.z = depthMovementZ + sidestepZ;
    this.velocity.x = depthMovementX + sidestepX;

    this.mesh.setRotation_(0, this.cameraRotation.y, 0);

    if (controls.isJump) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }

  private updateAudio() {
    this.listener.positionX.value = this.mesh.position_.x;
    this.listener.positionY.value = this.mesh.position_.y;
    this.listener.positionZ.value = this.mesh.position_.z;

    // const cameraDireciton = new EnhancedDOMPoint();
    // cameraDireciton.setFromRotationMatrix(this.camera.rotationMatrix);

    const {x, z} = this.mesh.position_.clone_()
      .subtract(this.camera.position_) // distance from camera to player
      .normalize_(); // direction of camera to player

    this.listener.forwardX.value = x;
    // this.listener.forwardY.value = cameraDireciton.y;
    this.listener.forwardZ.value = z;
  }
}
