import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import {
  findWallCollisionsFromList, getGridPosition, getGridPositionWithNeighbors,
} from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { clamp } from '@/engine/helpers';
import { outsideFootsteps } from '@/sound-effects';

class Sphere {
  center: EnhancedDOMPoint;
  radius: number;

  constructor(center: EnhancedDOMPoint, radius: number) {
    this.center = center;
    this.radius = radius;
  }
}

export class FirstPersonPlayer {
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  isFrozen = false;

  // mesh: Mesh;
  camera: Camera;
  cameraRotation = new EnhancedDOMPoint(0, 0, 0);
  listener: AudioListener;
  footstepsPlayer;
  collisionSphere: Sphere;
  isOnDirt = true;

  constructor(camera: Camera) {
    this.feetCenter.set(44, 46, -36);
    this.collisionSphere = new Sphere(this.feetCenter, 2);
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

  update(gridFaces: Set<Face>[]) {
    if (!this.isFrozen) {
      this.updateVelocityFromControls();
    }

    if (!this.isJumping && this.velocity.magnitude > 0) {
      if (this.isFootstepsStopped) {
        this.footstepsPlayer.stop();
        this.footstepsPlayer.loop = true;
        // this.footstepsPlayer.start();
        this.isFootstepsStopped = false;
      }
    } else {
      this.isFootstepsStopped = true;
      this.footstepsPlayer.loop = false;
    }
    this.velocity.y -= 0.008; // gravity

    const playerGridPositions = getGridPositionWithNeighbors(this.feetCenter, gridFaces.length);

    playerGridPositions.forEach(p => findWallCollisionsFromList(gridFaces[p], this));

    //findWallCollisionsFromList(faces, this);
    this.feetCenter.add_(this.velocity);


    this.camera.position_.set(this.feetCenter);
    this.camera.position_.y += 3.5;

    this.camera.setRotation_(...this.cameraRotation.toArray());

    this.camera.updateWorldMatrix();

    this.updateAudio();
  }

  isJumping = false;

  protected updateVelocityFromControls() {
    const speed = 0.24;

    const depthMovementZ = Math.cos(this.cameraRotation.y) * controls.inputDirection.y * speed;
    const depthMovementX = Math.sin(this.cameraRotation.y) * controls.inputDirection.y * speed;

    const sidestepZ = Math.cos(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;
    const sidestepX = Math.sin(this.cameraRotation.y + Math.PI / 2) * controls.inputDirection.x * speed;

    this.velocity.z = depthMovementZ + sidestepZ;
    this.velocity.x = depthMovementX + sidestepX;

    if (controls.isJump) {
      if (!this.isJumping) {
        this.velocity.y = 0.4;
        this.isJumping = true;
      }
    }
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
