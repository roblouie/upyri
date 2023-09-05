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
import { key, makeCoffin, makeCoffinBottomTop, stake, upyri } from '@/modeling/items';

export class GameState implements State {
  player: FirstPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[] };
  leverDoors: LeverDoorObject3d[] =[];

  stake = stake();
  hasStake = false;

  key = key();
  hasKey = false;

  upyri = upyri();

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
    const gateDoor = () => new Mesh(new MoldableCubeGeometry(6, 15, 1), materials.planks);

    const writing = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(57.4, 26, 42).done_(), materials.castleWriting)
    const handprint = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(47.4, 24, 42).done_(), materials.handprint)

    const coffin = new Mesh(makeCoffin().rotate_(0, Math.PI).translate_(0, 55, 8).done_(), materials.wood);
    const coffinTop = new Mesh(makeCoffinBottomTop().rotate_(0, Math.PI).translate_(0, 56.35, 8).done_(), materials.wood)

    // Corner entrance
    this.leverDoors.push(
      new LeverDoorObject3d(new EnhancedDOMPoint(42, 36, -60), [
        new DoorData(door(), new EnhancedDOMPoint(53, 36.5, -49))
      ], -90),


      // Keep entrance
      new LeverDoorObject3d(new EnhancedDOMPoint(57, 24, 42), [
        new DoorData(door(), new EnhancedDOMPoint(-2, 24.5, -15)),
        new DoorData(door(), new EnhancedDOMPoint(2, 24.5, -15), -1, 1),
        new DoorData(door(), new EnhancedDOMPoint(53, 24, 47), -1, -1)
      ], -90),

      // Locked door to upper keep
      new LeverDoorObject3d(new EnhancedDOMPoint(23, 0, 37.5), [
        new DoorData(door(), new EnhancedDOMPoint(23, 24, 37.5), -1)
      ]),


      // Front gate
      new LeverDoorObject3d(new EnhancedDOMPoint(2, 58, -12), [
        new DoorData(gateDoor(), new EnhancedDOMPoint(-3, 24, -60), 1, 1, false, true),
        new DoorData(gateDoor(), new EnhancedDOMPoint(3, 24, -60), -1, 1, false, true)
      ]),

      // Door to key
      new LeverDoorObject3d(new EnhancedDOMPoint(-24, 35, 54), [
        new DoorData(door(), new EnhancedDOMPoint(-15, 36, 62), 1, 1, true)
      ], 180)
    );
    const doorsFromLeverDoors = this.leverDoors.flatMap(leverDoor => leverDoor.doorDatas);

    this.groupedFaces = getGroupedFaces(meshToFaces([floorCollision, castle, coffin, coffinTop]));
    this.scene.add_(writing, handprint, floor, castle, ...this.leverDoors, ...doorsFromLeverDoors, this.stake, this.key, this.upyri, coffin, coffinTop);

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

    this.upyri.children_[0].lookAt(this.player.camera.position_);
    this.scene.updateWorldMatrix();

    render(this.player.camera, this.scene);
    debug.innerHTML = `${this.player.camera.position_.x}, ${this.player.camera.position_.y} ${this.player.camera.position_.z}`;

    if (controls.isEscape) {
      gameStateMachine.setState(gameStates.menuState);
    }
  }

  gameEvents = [
    // see blood stain on wall
    new GameEvent(new EnhancedDOMPoint(41, 21, 42), () => { ominousDiscovery1().start(); return true }, new EnhancedDOMPoint(11, -90)),

    // Get stake
    new GameEvent(new EnhancedDOMPoint(-51, 24, -65),() => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'GOT STAKE', 40),
      );
      pickup1().start();
      this.hasStake = true;
      this.stake.position_.y = -50;
      setTimeout(() => tmpl.innerHTML = '', 3000);
      return true;
    },undefined, 3),

    // Get key
    new GameEvent(new EnhancedDOMPoint(-35,36,60.5),() => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'GOT KEY', 40),
      );
      pickup1().start();
      this.hasKey = true;
      this.key.position_.y = -50;
      this.leverDoors[2].switchPosition.y = 24;
      setTimeout(() => tmpl.innerHTML = '', 3000);
      return true;
    },undefined, 3),
  ];


  handleEvents() {
    this.gameEvents.forEach(gameEvent => gameEvent.check(this.player.camera.position_, this.player.camera.rotation_));
  }
}

class GameEvent {
  isFired = false;
  constructor(private targetPos: EnhancedDOMPoint, private actionCallback: () => boolean, private targetRot?: EnhancedDOMPoint, private posMargin = 6) {}

  check(currentPosition: EnhancedDOMPoint, currentRotation: EnhancedDOMPoint) {
    // debug.innerHTML = new EnhancedDOMPoint().subtractVectors(currentPosition, this.targetPos).magnitude + ' // ' + new EnhancedDOMPoint().subtractVectors(currentRotation, this.targetRot).magnitude % 360;
    if (!this.isFired && new EnhancedDOMPoint().subtractVectors(currentPosition, this.targetPos).magnitude < this.posMargin) {
      const lookMag = this.targetRot ? new EnhancedDOMPoint().subtractVectors(currentRotation, this.targetRot).magnitude % 360 : 0;
      if (lookMag < 20 || lookMag > 340) {
        this.isFired = this.actionCallback();
      }
    }
  }
}
