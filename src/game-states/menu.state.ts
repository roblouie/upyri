import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameStates } from '@/game-states/game-states';
import { createColumn, drawLoadingScreen, overlaySvg } from '@/draw-helpers';
import { NoiseType, rect, text } from '@/engine/svg-maker/base';
import { drawBloodText, materials, skyboxes } from '@/textures';
import { newNoiseLandscape } from '@/engine/new-new-noise';
import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { createCastle } from '@/modeling/castle';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Skybox } from '@/engine/skybox';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { render } from '@/engine/renderer/renderer';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export class MenuState implements State {
  scene: Scene | undefined;
  camera: Camera | undefined;


  constructor() {
    this.scene = new Scene();
    this.camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
  }

  async onEnter() {
    const nextRow = createColumn('50%', 280, 60);
    tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
      drawBloodText({ ...nextRow(100), id_: 'title' }, 'UPYRI'),
      text({ ...nextRow(300), id_: 'start' }, 'Start'),
      text({ ...nextRow(80), id_: 'fullscreen' }, 'Fullscreen'),
    );
    // TODO: Probably add this to the svg library, if I have enough space to keep it anyway
    tmpl.querySelectorAll('feTurbulence').forEach((el: HTMLElement) => {
      el.innerHTML = `<animate
        attributeName="baseFrequency"
        values="0.13 0.08;0.13 0.025"
        dur="40s"
        repeatCount="indefinite" />`;
    });

    start.onclick = () => {
      drawLoadingScreen();
      setTimeout(() => gameStateMachine.setState(gameStates.gameState), 10);
    };

    fullscreen.onclick = () => {
      this.toggleFullscreen();
    };

    // this.camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
    this.camera.position_.set(50, 60, -150);
    // this.scene = new Scene();

    const heightmap = await newNoiseLandscape(256, 6, 0.05, 3, NoiseType.Fractal, 113);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap).spreadTextureCoords(), materials.grass);
    const castle = new Mesh(createCastle().translate_(0, 21).done_(), materials.brickWall);
    const bridge = new Mesh(new MoldableCubeGeometry(18, 1, 65).translate_(0, 20.5, -125).done_(), materials.planks);
    this.scene.add_(floor, castle, bridge);

    this.scene.skybox = new Skybox(...skyboxes.test);
    this.scene.skybox.bindGeometry();

    this.camera.lookAt(new EnhancedDOMPoint(0, 0, 0));
    this.camera.updateWorldMatrix();
    this.scene.updateWorldMatrix();
    render(this.camera!, this.scene!);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onUpdate(): void {
    //this.camera!.updateWorldMatrix();
    //this.scene!.updateWorldMatrix();
  }

  onLeave() {
    this.scene = undefined;
    this.camera = undefined;
  }
}
