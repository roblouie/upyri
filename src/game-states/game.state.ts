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
import { Material } from '@/engine/renderer/material';
import { createBox, createHallway, SegmentedWall, segmentedWall } from '@/modeling/building-blocks';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export class GameState implements State {
  player: FirstPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};

  constructor() {
    const camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
    this.player = new FirstPersonPlayer(camera);
    this.scene = new Scene();
    this.groupedFaces = { floorFaces: [], wallFaces: [], ceilingFaces: [] };
  }

  async onEnter() {
    const heightmap = await newNoiseLandscape(256, 5, 0.04, 1, NoiseType.Fractal, 90);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap), materials.grass);

    const testWall = new SegmentedWall([3, 4, 2], 10, [10, 3, 10], [0, 4, 0], 0, 21);
    const testWall2 = new SegmentedWall([3, 4, 2], 10, [10, 2, 10], [0, 0, 0], 0, 21);
    const testWall3 = new SegmentedWall([6, 4, 6], 10, [10, 3, 10], [0, 4, 0], 0, 21);
    const testWall4 = new SegmentedWall([6, 4, 6], 10, [10, 3, 10], [0, 4, 0], 0, 21);

    // const testHallway = createHallway(testWall, testWall2, 2);
    const testBox = createBox(testWall, testWall2, testWall3, testWall4);

    const boxTest = new Mesh(testBox, materials.brickWall);
    // const hall1 =  new Mesh(testHallway[0], materials.brickWall);
    // const hall2 =  new Mesh(testHallway[1], materials.brickWall);

    // const secondWall = new Mesh(segmentedWall([6], 2, [0,0,0,0,0,0,0], [3, 1, 3, 1, 3, 1, 3, 1], -3, 31), materials.brickWall);

    const testBlock = new MoldableCubeGeometry(1, 10, 1).translate_(2, 21).done_();
    const testBlock2 = new MoldableCubeGeometry(1, 10, 1).translate_(-2, 21).done_();

    const testBlock3 = new MoldableCubeGeometry(1, 10, 1).translate_(0, 21, 2).done_().merge(
      new MoldableCubeGeometry(1, 10, 1).translate_(0, 21, -2).done_()
    ).done_();

    const testBlockMesh = new Mesh(testBlock, materials.brickWall);
    const testBlockMesh2 = new Mesh(testBlock2, materials.brickWall);
    const testBlockMesh3 = new Mesh(testBlock3, materials.brickWall);

    getGroupedFaces(meshToFaces([floor]), this.groupedFaces);
    this.scene.add_(floor, boxTest);

    this.scene.skybox = new Skybox(...skyboxes.test);
    this.scene.skybox.bindGeometry();
    clearTemplate();
    tmpl.addEventListener('click', () => {
      tmpl.requestPointerLock();
    });
  }

  onUpdate(): void {
    this.player.update(this.groupedFaces);
    this.scene.updateWorldMatrix();
    render(this.player.camera, this.scene);
    debug.innerHTML = `${this.player.feetCenter.x}, ${this.player.feetCenter.z}`;

    if (controls.isEscape) {
      gameStateMachine.setState(gameStates.menuState);
    }
  }
}
