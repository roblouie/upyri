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
import { drawBloodText, materials, skyboxes } from '@/textures';
import { gameStates } from '@/game-states/game-states';
import { newNoiseLandscape } from '@/engine/new-new-noise';
import { NoiseType, text } from '@/engine/svg-maker/base';
import { clearTemplate, overlaySvg } from '@/draw-helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { createCastle } from '@/modeling/castle';
import { createStairs } from '@/modeling/building-blocks';
import { DoorData, LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Object3d } from '@/engine/renderer/object-3d';
import { Material } from '@/engine/renderer/material';
import { ominousDiscovery1, ominousDiscovery2, pickup1 } from '@/sound-effects';
import { key, stake } from '@/modeling/items';

export class GameState implements State {
  player: FirstPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[] };
  leverDoors: LeverDoorObject3d[] =[];

  stake = stake();
  hasStake = false;

  key = key();
  hasKey = false;

  constructor() {
    const camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
    this.player = new FirstPersonPlayer(camera);
    this.scene = new Scene();
    this.groupedFaces = { floorFaces: [], wallFaces: [] };
  }

  async onEnter() {
    const heightmap = await newNoiseLandscape(256, 5, 0.04, 1, NoiseType.Fractal, 90);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap).spreadTextureCoords(), materials.grass);
    const floorCollision = new Mesh( new PlaneGeometry(1024, 1024, 4, 4).translate_(0, 20.5).done_(), materials.grass);

    const castle = new Mesh(createCastle().translate_(0, 21).done_(), materials.brickWall);

    const door = () => new Mesh(new MoldableCubeGeometry(4, 7, 1), materials.planks);

    const writing = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(46.4, 26, 30).done_(), materials.castleWriting)
    const handprint = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(36.4, 24, 30).done_(), materials.handprint)

    const face = new Mesh(new MoldableCubeGeometry(1, 1, 1).translate_(0, 26, 0).done_(), materials.face);

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
    this.scene.add_(writing, handprint, floor, castle, ...this.leverDoors, ...doorsFromLeverDoors, this.stake, this.key, face);

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

    this.handleEvents()

    this.leverDoors.forEach(leverDoor => {
      if (!leverDoor.isPulled) {
        const distance = this.leverPlayerDistance.subtractVectors(this.player.camera.position_, leverDoor.switchPosition).magnitude;
        if (distance < 7 && controls.isConfirm) {
          leverDoor.pullLever();
        }
        this.player.wallCollision(leverDoor.closedDoorCollision);
      } else {
        this.player.wallCollision(leverDoor.openDoorCollision);
      }

      leverDoor.update();
    });
    this.scene.updateWorldMatrix();

    render(this.player.camera, this.scene);
    // debug.innerHTML = `${this.player.camera.position_.x}, ${this.player.camera.position_.y} ${this.player.camera.position_.z}`;

    if (controls.isEscape) {
      gameStateMachine.setState(gameStates.menuState);
    }
  }

  gameEvents = [
    // see blood stain on wall
    new GameEvent(new EnhancedDOMPoint(30, 21, 30), () => ominousDiscovery1().start(), new EnhancedDOMPoint(11, -90)),

    // Get stake
    new GameEvent(new EnhancedDOMPoint(-40, 24, -53),() => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'GOT STAKE', 40),
      );
      pickup1().start();
      this.hasStake = true;
      this.stake.position_.y = -50;
      setTimeout(() => tmpl.innerHTML = '', 3000);
    },undefined, 3),

    // Get key
    new GameEvent(new EnhancedDOMPoint(-24,36,48.5),() => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'GOT KEY', 40),
      );
      pickup1().start();
      this.hasKey = true;
      this.key.position_.y = -50;
      setTimeout(() => tmpl.innerHTML = '', 3000);
    },undefined, 3),
  ];


  handleEvents() {
    this.gameEvents.forEach(gameEvent => gameEvent.check(this.player.camera.position_, this.player.camera.rotation_));
  }
}

class GameEvent {
  isFired = false;
  constructor(private targetPos: EnhancedDOMPoint, private actionCallback: () => void, private targetRot?: EnhancedDOMPoint, private posMargin = 6) {}

  check(currentPosition: EnhancedDOMPoint, currentRotation: EnhancedDOMPoint) {
    // debug.innerHTML = new EnhancedDOMPoint().subtractVectors(currentPosition, this.targetPos).magnitude + ' // ' + new EnhancedDOMPoint().subtractVectors(currentRotation, this.targetRot).magnitude % 360;
    if (!this.isFired && new EnhancedDOMPoint().subtractVectors(currentPosition, this.targetPos).magnitude < this.posMargin) {
      const lookMag = this.targetRot ? new EnhancedDOMPoint().subtractVectors(currentRotation, this.targetRot).magnitude % 360 : 0;
      if (lookMag < 20 || lookMag > 340) {
        this.actionCallback();
        this.isFired = true;
      }
    }
  }
}
