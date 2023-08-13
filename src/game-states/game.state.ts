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
    const heightmap = await newNoiseLandscape(256, 5, 1/28, 2, NoiseType.Fractal, 40);
    const floor = new Mesh(new PlaneGeometry(511, 511, 255, 255, heightmap), materials.grass);

    getGroupedFaces(meshToFaces([floor]), this.groupedFaces);
    this.scene.add_(floor);

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

    if (controls.isEscape) {
      gameStateMachine.setState(gameStates.menuState);
    }
  }
}
