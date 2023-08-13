import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameStates } from '@/game-states/game-states';
import { createColumn, drawLoadingScreen, overlaySvg } from '@/draw-helpers';
import { rect, text } from '@/engine/svg-maker/base';
import { drawBloodText } from '@/textures';

export class MenuState implements State {
  private isStartSelected = true;

  onEnter() {
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
  }

  onUpdate() {
    this.updateControls();
    try {
      if (this.isStartSelected) {
        start.style.fill = 'red';
        fullscreen.style.fill = '#333';
      } else {
        start.style.fill = '#333';
        fullscreen.style.fill = 'red';
      }
    } catch(e) {}
  }

  updateControls() {
    if ((controls.isUp && !controls.previousState.isUp)
      || (controls.isDown && !controls.previousState.isDown)) {
      this.isStartSelected = !this.isStartSelected;
    }

    if (controls.isConfirm && !controls.previousState.isConfirm) {
      if (this.isStartSelected) {
        drawLoadingScreen();
        setTimeout(() => gameStateMachine.setState(gameStates.gameState));
      } else {
        this.toggleFullscreen();
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
