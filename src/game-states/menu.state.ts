import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameStates } from '@/game-states/game-states';
import { drawFullScreenText, overlaySvg } from '@/draw-helpers';
import { NoiseType, rect, text } from '@/engine/svg-maker/base';
import { drawBloodText, materials, skyboxes } from '@/textures';
import { newNoiseLandscape } from '@/engine/new-new-noise';
import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { castleContainer, createCastle } from '@/modeling/castle';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Skybox } from '@/engine/skybox';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { render } from '@/engine/renderer/renderer';
import { makeCoffin, makeCoffinBottomTop } from '@/modeling/items';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { createLookAt2 } from '@/engine/renderer/object-3d';
import { makeSong, musicNote, pickup1, scaryNote2 } from '@/sound-effects';
import { audioCtx } from '@/engine/audio/audio-player';

export class MenuState implements State {
  camera: Camera;

  scene: Scene;





  constructor() {
    this.camera = new Camera(Math.PI / 3, 16 / 9, 1, 600);
    this.camera.position_.y = 32;
    this.camera.position_.z = 120;
    this.scene = new Scene();
  }

  song = makeSong();
  drumHit = scaryNote2(0.6)();
  isSongPlaying = false;

  async onEnter() {
    const heightmap = await newNoiseLandscape(256, 6, 0.05, 3, NoiseType.Fractal, 113);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap).spreadTextureCoords(), materials.grass);
    const castle = new Mesh(castleContainer.value!, materials.brickWall);
    const bridge = new Mesh(new MoldableCubeGeometry(18, 1, 65).translate_(0, 20.5, -125).done_(), materials.planks);

    this.scene.add_(floor, castle, bridge);

    this.scene.skybox = new Skybox(...skyboxes.test);
    this.scene.skybox.bindGeometry();

    tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
      drawBloodText({ x: '50%', y: 300, id_: 'title' }, 'UPYRI'),
      text({ x: '50%', y: 900, id_: 'start' }, 'Start'),
      text({ x: '50%', y: 1010, id_: 'fullscreen' }, 'Fullscreen'),
    );
    // TODO: Probably add this to the svg library, if I have enough space to keep it anyway
    tmpl.querySelectorAll('feTurbulence').forEach((el: HTMLElement) => {
      el.innerHTML = `<animate
        attributeName="baseFrequency"
        values="0.13 0.08;0.13 0.007"
        dur="80s"
        repeatCount="indefinite" />`;
    });

    start.onclick = () => {
      this.drumHit.stop();
      this.song.stop();
      pickup1().start();
      drawFullScreenText('LOADING');
      setTimeout(() => gameStateMachine.setState(gameStates.gameState), 10);
    };

    fullscreen.onclick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    if (!this.isSongPlaying) {
      this.song.loop = true;
      this.song.start();

      this.drumHit.loop = true;
      this.drumHit.start(audioCtx.currentTime + 2);
      this.isSongPlaying = true;
    }
  }

  cameraRotationAngles = new EnhancedDOMPoint();

  onUpdate(): void {
    render(this.camera, this.scene);

    this.cameraRotationAngles.x -= 0.0015;
    this.cameraRotationAngles.y -= 0.003;
    this.cameraRotationAngles.z -= 0.0015;

    this.camera.position_.x = (Math.cos(this.cameraRotationAngles.x) * 125);
    this.camera.position_.y = Math.cos(this.cameraRotationAngles.y) * 35 + 50;
    this.camera.position_.z = (Math.sin(this.cameraRotationAngles.z) * 125);

    this.camera.isUsingLookAt = true;
    this.camera.worldMatrix = createLookAt2(this.camera.position_, new EnhancedDOMPoint(0.1, 31, 0.1));
    this.camera.worldMatrix.invertSelf();
  }

  onLeave() {
    this.scene = undefined;
    this.camera = undefined;
  }
}
