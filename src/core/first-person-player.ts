import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { clamp } from '@/engine/helpers';
import { indoorFootsteps, outsideFootsteps } from '@/sound-effects';


export class FirstPersonPlayer {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);

  // mesh: Mesh;
  camera: Camera;
  private cameraRotation = new EnhancedDOMPoint(0, 0, 0);
  listener: AudioListener;
  footstepsPlayer;
  isOnDirt = true;

  constructor(camera: Camera) {
    this.feetCenter.y = 45;
    this.camera = camera;
    this.listener = audioCtx.listener;

    this.footstepsPlayer = outsideFootsteps();
    this.footstepsPlayer.loop = true;
    this.footstepsPlayer.start();
    this.footstepsPlayer.playbackRate.value = 0;

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

    if (!this.isJumping && this.velocity.magnitude > 0) {
      this.footstepsPlayer.playbackRate.value = 1;
      // if (!this.footstepsPlayer.loop) {
      //   this.footstepsPlayer.start();
      // }
      // this.footstepsPlayer.loop = true;
    } else {
      this.footstepsPlayer.playbackRate.value = 0;
      // this.footstepsPlayer.loop = false;
    }

    debug.innerHTML = `${ this.footstepsPlayer.playbackRate.value} / ${this.velocity.magnitude}`;



    this.velocity.y -= 0.003; // gravity
    this.feetCenter.add_(this.velocity);


    this.collideWithLevel(groupedFaces);

    this.camera.position_.set(this.feetCenter);
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
      this.isJumping = true;
      return;
    }

    const collisionDepth = floorData.height - this.feetCenter.y;

    if (collisionDepth > 0) {
      this.feetCenter.y += collisionDepth;
      this.velocity.y = 0;

      if (this.isOnDirt && floorData.height > 21) {
        this.footstepsPlayer.stop();
        this.footstepsPlayer = indoorFootsteps();
        this.footstepsPlayer.loop = true;
        this.footstepsPlayer.start();
        this.isOnDirt = false;
      }

      if (!this.isOnDirt && floorData.height === 21) {
        this.footstepsPlayer.stop();
        this.footstepsPlayer = outsideFootsteps();
        this.footstepsPlayer.loop = true;
        this.footstepsPlayer.start();
        this.isOnDirt = true;
      }

      this.isJumping = false;
    } else {
      this.isJumping = true;
    }
  }

  protected updateVelocityFromControls() {
    const speed = 0.2;

    const depthMovementZ = Math.cos(this.cameraRotation.y) * controls.inputDirection.y * speed;
    const depthMovementX = Math.sin(this.cameraRotation.y) * controls.inputDirection.y * speed;

    const sidestepZ = Math.cos(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;
    const sidestepX = Math.sin(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;

    this.velocity.z = depthMovementZ + sidestepZ;
    this.velocity.x = depthMovementX + sidestepX;

    if (controls.isJump) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }

  private updateAudio() {
    this.listener.positionX.value = this.camera.position_.x;
    this.listener.positionY.value = this.camera.position_.y;
    this.listener.positionZ.value = this.camera.position_.z;

    const lookingDirection = new EnhancedDOMPoint(0, 0, -1);
    const result = this.camera.rotationMatrix.transformPoint(lookingDirection);

    this.listener.forwardX.value = result.x;
    this.listener.forwardY.value = result.y;
    this.listener.forwardZ.value = result.z;
  }
}
