import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { FirstPersonPlayer } from '@/core/first-person-player';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { Face } from '@/engine/physics/face';
import { render } from '@/engine/renderer/renderer';
import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';
import { Skybox } from '@/engine/skybox';
import { drawBloodText, materials, skyboxes, testHeightmap } from '@/textures';
import { newNoiseLandscape } from '@/engine/new-new-noise';
import { NoiseType } from '@/engine/svg-maker/base';
import { overlaySvg } from '@/draw-helpers';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { castleContainer } from '@/modeling/castle';
import { LeverDoorObject3d } from '@/modeling/lever-door';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import {
  draggingSound2, makeSong,
  ominousDiscovery1,
  ominousDiscovery2,
  pickup1,
  scaryNote2,
  upyriAttack,
  upyriAttack2, upyriHit
} from '@/sound-effects';
import {
  key,
  makeCoffin,
  makeCoffinBottomTop,
  stake,
  upyri,
  getLeverDoors, makeBanners
} from '@/modeling/items';

export class GameState implements State {
  player?: FirstPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[] };
  gridFaces: {floorFaces: Face[], wallFaces: Face[] }[] = [];

  leverDoors: LeverDoorObject3d[] =[];

  stake = stake();
  hasStake = false;

  key = key();
  hasKey = false;

  upyri = upyri();
  isUpyriKilled = false;
  isUpyriDying = false;
  isUpyriAttacking = false;
  upyriAttackingTimer = 0;
  coffinTop = new Mesh(makeCoffinBottomTop().rotate_(0, Math.PI).translate_(0, 56.35, 8).done_(), materials.wood);
  coffinTopBloodstain = new Mesh(new MoldableCubeGeometry(3, 1, 3).translate_(0, 55.95, -0.5).done_(), materials.bloodCircle);

  constructor() {
    this.scene = new Scene();
    this.groupedFaces = { floorFaces: [], wallFaces: [] };

    this.leverDoors = getLeverDoors();
  }

  async onEnter() {
    const camera = new Camera(Math.PI / 3, 16 / 9, 1, 500);
    this.player = new FirstPersonPlayer(camera);


    const heightmap = await newNoiseLandscape(256, 6, 0.05, 3, NoiseType.Fractal, 113);
    const floor = new Mesh(new PlaneGeometry(1024, 1024, 255, 255, heightmap).spreadTextureCoords(), materials.grass);
    const floorCollision = new Mesh( new PlaneGeometry(1024, 1024, 4, 4).translate_(0, 20.5).done_(), materials.grass);

    const castle = new Mesh(castleContainer.value!.done_(), materials.brickWall);

    const writing = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(57.4, 26, 43).done_(), materials.castleWriting)
    const handprint = new Mesh(new MoldableCubeGeometry(1, 6, 6).rotate_(0.2).translate_(47.4, 24, 42).done_(), materials.handprint)

    const coffin = new Mesh(makeCoffin().rotate_(0, Math.PI).translate_(0, 55, 8).done_(), materials.wood);

    const bridge = new Mesh(new MoldableCubeGeometry(18, 1, 65).translate_(0, 20.5, -125).done_(), materials.planks);

    this.coffinTopBloodstain.scale_.set(0, 1, 0);

    // .rotate_(0, -1)
    // .translate_(-51, 21.5, -65)
    this.stake.position_.set(-51, 21.5, -65);
    this.stake.setRotation_(0, -1, 0);

    const doorsFromLeverDoors = this.leverDoors.flatMap(leverDoor => leverDoor.doorDatas);

    const groupedFaces = getGroupedFaces(meshToFaces([floorCollision, castle, coffin, this.coffinTop]));


    // Banners
    const bannerHeightmap = await testHeightmap();

    function onlyUnique(value: any, index: number, array: any[]) {
      return array.indexOf(value) === index;
    }

    groupedFaces.floorFaces.forEach(face => {
      const gridPositions = face.points.map(point => point.x < 0 ? 0 : 1);

      gridPositions.filter(onlyUnique).forEach(position_ => {
        if (!this.gridFaces[position_]) {
          this.gridFaces[position_] = { floorFaces: [], wallFaces: [] };
        }
        this.gridFaces[position_].floorFaces.push(face);
      });
    });

    groupedFaces.wallFaces.forEach(face => {
      const gridPositions = face.points.map(point => point.x < 0 ? 0 : 1);

      gridPositions.filter(onlyUnique).forEach(position_ => {
        if (!this.gridFaces[position_]) {
          this.gridFaces[position_] = { floorFaces: [], wallFaces: [] };
        }
        this.gridFaces[position_].wallFaces.push(face);
      });
    });

    this.scene.add_(writing, handprint, floor, castle, ...this.leverDoors, ...doorsFromLeverDoors, this.stake, this.key, this.upyri, coffin, this.coffinTop, this.coffinTopBloodstain, bridge, makeBanners(bannerHeightmap));

    this.scene.skybox = new Skybox(...skyboxes.test);
    this.scene.skybox.bindGeometry();
    tmpl.innerHTML = '';
    tmpl.addEventListener('click', () => {
      tmpl.requestPointerLock();
    });

    this.player.cameraRotation.set(0, 90, 0);
  }

  leverPlayerDistance = new EnhancedDOMPoint();


  onUpdate(): void {
    this.player!.update(this.gridFaces);
    render(this.player!.camera, this.scene);


    this.handleEvents()

    this.leverDoors.forEach(leverDoor => {
      if (!leverDoor.isPulled) {
        const distance = this.leverPlayerDistance.subtractVectors(this.player.camera.position_, leverDoor.switchPosition).magnitude;
        if (distance < 7 && controls.isConfirm) {
          leverDoor.pullLever();
        }
        this.player!.wallCollision(leverDoor.closedDoorCollision);
      } else {
        this.player!.wallCollision(leverDoor.openDoorCollision);
      }

      leverDoor.update();
    });

    this.upyri.lookAt(this.player!.camera.position_);
    this.scene.updateWorldMatrix();

    if (this.winState) {
      this.winCounter++;
      if (this.winCounter > 1800) {
        tmpl.style.backgroundColor = `rgba(0, 0, 0, ${this.backgroundFade})`;
        this.backgroundFade += 0.004;
      }
    }

    if (this.isUpyriDying) {
      this.coffinTopBloodstain.scale_.x += 0.03;
      this.coffinTopBloodstain.scale_.z += 0.03;

      if (this.coffinTopBloodstain.scale_.x >= 1) {
        this.isUpyriDying = false;
      }
    }

    if (this.isUpyriAttacking) {
      c3d.style.filter = 'blur(9px) brightness(0.8)';
      this.upyri.position_.moveTowards(this.player!.camera.position_, 0.6);
      this.upyriAttackingTimer++;
        if (this.upyriAttackingTimer > 30) {
          tmpl.style.backgroundColor = `rgb(0, 0, 0)`;
          this.isUpyriAttacking = false;

          // Reset
          setTimeout(() => {
            c3d.style.filter = '';
            tmpl.style.backgroundColor = '';
            this.upyri.position_.set(0, 54, 0);
            this.isUpyriAttacking = false;
            this.upyriTriggerCounter = 0;
            this.upyriAttackingTimer = 0;
            this.coffinTop.position_.set(0, 0, 0);
            this.coffinTop.rotation_.y = 0;
            this.isCoffinTopPlayed = false;
            this.player!.feetCenter.set(0, 49, 22);
            this.gameEvents[5].isFired = false;
            this.leverDoors[3].isPulled = false;
            this.leverDoors[3].isFinished = false;
            this.leverDoors[3].children_[1].rotation_.x = -45;
            this.leverDoors[3].audioPlayer = draggingSound2(this.leverDoors[3].switchPosition);
            this.leverDoors[3].doorDatas[0].rotation_.y = 0;
            this.leverDoors[3].doorDatas[1].rotation_.y = 0;
            // @ts-ignore
            this.leverDoors[3].doorDatas[0].dragPlayer = { start: () => {} };
            // @ts-ignore
            this.leverDoors[3].doorDatas[0].creakPlayer = { start: () => {} };
            // @ts-ignore
            this.leverDoors[3].doorDatas[1].dragPlayer = { start: () => {} };
            // @ts-ignore
            this.leverDoors[3].doorDatas[1].creakPlayer = { start: () => {} };

            tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
              drawBloodText({ x: '50%', y: '90%', style: 'font-size: 150px; text-shadow: 1px 1px 20px' }, 'YOU WOKE UPYRI', 40),
            );

            setTimeout(() => {
              tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
                drawBloodText({ x: '50%', y: '90%', style: 'font-size: 150px; text-shadow: 1px 1px 20px' }, 'KILL HIM IN HIS COFFIN', 40),
              );

              setTimeout(() => tmpl.innerHTML = '', 3000);

            }, 3000);

          }, 4000);
        }
    }

    // debug.innerHTML = `${this.player.camera.position_.x}, ${this.player.camera.position_.y} ${this.player.camera.position_.z} // ${this.player.camera.rotation_.x} ${this.player.camera.rotation_.y} ${this.player.camera.rotation_.z}`;
  }

  private upyriTriggerCounter = 0;

  private backgroundFade = 0;
  private winState = false;
  private winCounter = 0;

  gameEvents = [
    // see blood stain on wall
    new GameEvent(new EnhancedDOMPoint(41, 21, 42), () => { ominousDiscovery2().start(); return true }, new EnhancedDOMPoint(11, -90)),


    // Enter coffin room
    new GameEvent(new EnhancedDOMPoint(0, 58, 8), () => {
      scaryNote2()().start();
      return true;
    }, undefined),

    // Got stake
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

    // Got Key
    new GameEvent(new EnhancedDOMPoint(-32,36,60.5),() => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'GOT KEY', 40),
      );
      pickup1().start();
      this.hasKey = true;
      this.key.position_.y = -50;
      this.leverDoors[2].switchPosition.y = 24;
      setTimeout(() => tmpl.innerHTML = '', 3000);
      return true;
    },undefined, 4),

    // Kill Upyri
    new GameEvent(new EnhancedDOMPoint(0, 58.5, -1), () => {
      const point = new DOMPoint(0, 0, -1);
      const cameraRot = new EnhancedDOMPoint().set(this.player.camera.rotationMatrix.transformPoint(point));
      const upyriRot = new EnhancedDOMPoint().set(this.upyri.rotationMatrix.transformPoint(point));

      if (cameraRot.dot(upyriRot) < -0.70) {
        if (controls.isConfirm) {
          if (this.hasStake) {
            upyriHit(this.upyri.position_).start();
            tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
              drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'UPYRI KILLED', 40),
            );
            this.stake.position_.set(0, 57, -0.5);
            this.stake.setRotation_(Math.PI / 2 , 0, 0);
            this.isUpyriKilled = true;
            this.isUpyriDying = true;
            setTimeout(() => tmpl.innerHTML = '', 3000);
            return true;
          } else {
            tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
              drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'NEED STAKE', 40),
            );
            setTimeout(() => tmpl.innerHTML = '', 3000);
          }
        }
      }
    }, undefined, 7),

    // Die From Upyri
    new GameEvent(new EnhancedDOMPoint(0, 58.5, 0), () => {
      if (!this.isUpyriKilled && this.leverDoors[3].isPulled) {
        this.upyriTriggerCounter++;
        this.upyri.position_.y = 61;
        this.coffinTop.position_.y = -1;
        this.coffinTop.position_.x = -5.5;
        this.coffinTop.rotation_.y = 25;

        if (!this.isCoffinTopPlayed) {
          upyriHit(new EnhancedDOMPoint(-7, 58, -3)).start();
          this.isCoffinTopPlayed = true;
        }

        const point = new DOMPoint(0, 0, -1);
        const cameraRot = new EnhancedDOMPoint().set(this.player!.camera.rotationMatrix.transformPoint(point));
        const upyriRot = new EnhancedDOMPoint().set(this.upyri.rotationMatrix.transformPoint(point));

        if (cameraRot.dot(upyriRot) < -0.70 || this.upyriTriggerCounter > 240 || this.player!.camera.position_.z > 10) {
          setTimeout(() =>  {
            upyriAttack().start();
            upyriAttack2().start();
            this.isUpyriAttacking = true;
          }, 500);
          return true;
        }
      }
    }, undefined, 12),


    // Escape
    new GameEvent(new EnhancedDOMPoint(0, 24.5, -72), () => {
      tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
        drawBloodText({ x: '50%', y: '90%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'ESCAPED', 40),
      );
      this.winState = true;
      this.player!.isFrozen = true;
      this.player!.velocity.set(0, 0, -0.1);
      setTimeout(() => {
        tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
          drawBloodText({ x: '50%', y: '90%', style: 'font-size: 160px; text-shadow: 1px 1px 20px' }, 'THANKS FOR PLAYING', 40),
        );
      }, 3000);
        return true;
    }, undefined, 6),

    // Look at broken wall piece
    new GameEvent(new EnhancedDOMPoint(32, 24, -40), () => { ominousDiscovery1().start(); return true }, new EnhancedDOMPoint(28, -15), 8),

    // Initial cue to give player instruction that their goal is to escape the castle
    new GameEvent(new EnhancedDOMPoint(44, 21, -26), () => {
      setTimeout(() => {
        tmpl.innerHTML =  overlaySvg({ style: 'text-anchor: middle' },
          drawBloodText({ x: '50%', y: '90%', style: 'font-size: 160px; text-shadow: 1px 1px 20px' }, 'ESCAPE THE CASTLE', 40),
        );
        setTimeout(() => tmpl.innerHTML = '', 5000);
      }, 2000);
      return true;
    }, undefined),

    // Rooftop music cue
    new GameEvent(new EnhancedDOMPoint(15, 48, 48), () => { makeSong().start(); return true}),

  ];

  isCoffinTopPlayed = false;



  handleEvents() {
    this.gameEvents.forEach(gameEvent => gameEvent.check(this.player!.camera.position_, this.player!.camera.rotation_));
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
