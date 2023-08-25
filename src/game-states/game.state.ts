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
import { DoorData, LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Object3d } from '@/engine/renderer/object-3d';
import { Material } from '@/engine/renderer/material';

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

    const door = () => new Mesh(new MoldableCubeGeometry(4, 7, 1), new Material({ color: [0, 0, 1, 1] }));

    const writing = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(46.4, 26, 30).done_(), materials.castleWriting)
    const handprint = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(36.4, 24, 30).done_(), materials.handprint)


    this.leverDoors.push(
      new LeverDoorObject3d(new EnhancedDOMPoint(31, 36, -48), [
        new DoorData(door(), new EnhancedDOMPoint(42, 36.5, -37))
      ], -90),

      new LeverDoorObject3d(new EnhancedDOMPoint(46, 24, 30), [
        new DoorData(door(), new EnhancedDOMPoint(0, 24, 3)),
        new DoorData(door(), new EnhancedDOMPoint(4, 24, 3), -1, 1),
        new DoorData(door(), new EnhancedDOMPoint(42, 24, 36), -1, -1)
      ], -90)
    );
    const doorsFromLeverDoors = this.leverDoors.flatMap(leverDoor => leverDoor.doorDatas);

    this.groupedFaces = getGroupedFaces(meshToFaces([floorCollision, castle]));
    this.scene.add_(writing, handprint, floor, castle, ...this.leverDoors, ...doorsFromLeverDoors);

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
