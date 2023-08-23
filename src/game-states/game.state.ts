import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { FirstPersonPlayer } from '@/core/first-person-player';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { Face } from '@/engine/physics/face';
import { render } from '@/engine/renderer/renderer';
import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';
import { Skybox } from '@/engine/skybox';
import { materials, skyboxes } from '@/textures';
import { gameStates } from '@/game-states/game-states';
import { newNoiseLandscape } from '@/engine/new-new-noise';
import { NoiseType } from '@/engine/svg-maker/base';
import { clearTemplate } from '@/draw-helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { createCastle } from '@/modeling/castle';
import { createStairs } from '@/modeling/building-blocks';
import { LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export class GameState implements State {
  player: FirstPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[] };
  leverDoors: LeverDoorObject3d[] =[];

  constructor() {
    const camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
    this.player = new FirstPersonPlayer(camera);
    this.scene = new Scene();
    this.groupedFaces = { floorFaces: [], wallFaces: [] };
  }

  async onEnter() {
    const heightmap = await newNoiseLandscape(256, 5, 0.04, 1, NoiseType.Fractal, 90);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap).spreadTextureCoords(), materials.grass);
    const floorCollision = new Mesh( new PlaneGeometry(1024, 1024, 4, 4).translate_(0, 21).done_(), materials.grass);

    const castle = new Mesh(createCastle().translate_(0, 21).done_(), materials.brickWall);

    this.leverDoors.push(
      new LeverDoorObject3d(new EnhancedDOMPoint(31, 36, -48), new EnhancedDOMPoint(42, 36.5, -37), -90),
      new LeverDoorObject3d(new EnhancedDOMPoint(48, 24, 43), new EnhancedDOMPoint(0, 24, 0), -90)
    );
    const doorsFromLeverDoors = this.leverDoors.map(leverDoor => leverDoor.door);

    this.groupedFaces = getGroupedFaces(meshToFaces([floorCollision, castle]));
    this.scene.add_(floor, castle, ...this.leverDoors, ...doorsFromLeverDoors, this.leverDoors[0].closedDoorCollisionM, this.leverDoors[0].openDoorCollisionM);

    this.scene.skybox = new Skybox(...skyboxes.test);
    this.scene.skybox.bindGeometry();
    clearTemplate();
    tmpl.addEventListener('click', () => {
      tmpl.requestPointerLock();
    });
  }

  leverPlayerDistance = new EnhancedDOMPoint();
  onUpdate(): void {
    this.player.update(this.groupedFaces);

    this.leverDoors.forEach(leverDoor => {
      if (!leverDoor.isPulled) {
        const distance = this.leverPlayerDistance.subtractVectors(this.player.camera.position_, leverDoor.switchPosition).magnitude;
        debug.innerHTML = distance;
        if (distance < 7 && controls.isConfirm) {
          leverDoor.isPulled = true;
        }
        this.player.wallCollision(leverDoor.closedDoorCollision);
      } else {
        this.player.wallCollision(leverDoor.openDoorCollision);
      }

      leverDoor.update();
    });
    this.scene.updateWorldMatrix();

    render(this.player.camera, this.scene);
    // debug.innerHTML = `${this.player.feetCenter.x}, ${this.player.feetCenter.z}`;

    if (controls.isEscape) {
      gameStateMachine.setState(gameStates.menuState);
    }
  }
}
