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


export class FirstPersonPlayer {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  isFrozen = false;

  // mesh: Mesh;
  camera: Camera;
  cameraRotation = new EnhancedDOMPoint(0, 0, 0);
  listener: AudioListener;
  footstepsPlayer;
  isOnDirt = true;

  constructor(camera: Camera) {
    this.feetCenter.set(44, 21, -26);
    this.camera = camera;
    this.listener = audioCtx.listener;

    this.footstepsPlayer = outsideFootsteps();
    this.footstepsPlayer.loop = true;
    this.footstepsPlayer.playbackRate.value = 0;
    this.footstepsPlayer.start();

    const rotationSpeed = 0.002;
    controls.onMouseMove(mouseMovement => {
      this.cameraRotation.x += mouseMovement.y * -rotationSpeed;
      this.cameraRotation.y += mouseMovement.x * -rotationSpeed;
      this.cameraRotation.x = clamp(this.cameraRotation.x, -Math.PI / 2, Math.PI / 2);
      this.cameraRotation.y = this.cameraRotation.y % (Math.PI * 2);
    });
  }

  private isFootstepsStopped = true;

  update(gridFaces: {floorFaces: Face[], wallFaces: Face[]}[]) {
    //debug.innerHTML = this.feetCenter.y;
    if (!this.isFrozen) {
      this.updateVelocityFromControls();
    }

    if (!this.isJumping && this.velocity.magnitude > 0) {
      if (this.isFootstepsStopped) {
        this.footstepsPlayer.stop();
        this.footstepsPlayer = this.determineFootstepPlayer(this.feetCenter.y);
        this.footstepsPlayer.loop = true;
        this.footstepsPlayer.start();
        this.isFootstepsStopped = false;
      }
    } else {
      this.isFootstepsStopped = true;
      this.footstepsPlayer.loop = false;
    }

    this.velocity.y -= 0.003; // gravity
    this.feetCenter.add_(this.velocity);

    const playerGridPosition = this.feetCenter.x < 0 ? 0 : 1;


    // @ts-ignore
    this.collideWithLevel(gridFaces[playerGridPosition]); // do collision detection, if collision is found, feetCenter gets pushed out of the collision

    this.camera.position_.set(this.feetCenter);
    this.camera.position_.y += 3.5;


    // @ts-ignore
    this.camera.setRotation_(...this.cameraRotation.toArray());

    this.camera.updateWorldMatrix();

    this.updateAudio();
  }

  wallCollision(wallFaces: Face[]) {
    const wallCollisions = findWallCollisionsFromList(wallFaces, this.feetCenter, 1.1, 1.5);
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
        this.footstepsPlayer = this.determineFootstepPlayer(floorData.height);
        this.footstepsPlayer.loop = true;
        this.footstepsPlayer.start();
        this.isOnDirt = false;
      }

      if (!this.isOnDirt && floorData.height === 21) {
        this.footstepsPlayer.stop();
        this.footstepsPlayer = this.determineFootstepPlayer(floorData.height);
        this.footstepsPlayer.loop = true;
        this.footstepsPlayer.start();
        this.isOnDirt = true;
      }

      this.isJumping = false;
    } else {
      this.isJumping = true;
    }
  }

  determineFootstepPlayer(height_: number) {
    if (height_ === 21) {
      return outsideFootsteps();
    } else {
      return indoorFootsteps();
    }
  }

  protected updateVelocityFromControls() {
    const speed = 0.18;

    const depthMovementZ = Math.cos(this.cameraRotation.y) * controls.inputDirection.y;
    const depthMovementX = Math.sin(this.cameraRotation.y) * controls.inputDirection.y;

    const sidestepZ = Math.cos(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x;
    const sidestepX = Math.sin(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x;

    this.velocity.z = depthMovementZ + sidestepZ;
    this.velocity.x = depthMovementX + sidestepX;
    let oldY = this.velocity.y;
    this.velocity.normalize_().scale_(speed);
    this.velocity.y = oldY;
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
