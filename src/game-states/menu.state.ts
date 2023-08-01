import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameStates } from '@/game-states/game-states';
import { createColumn, drawLoadingScreen, overlaySvg } from '@/draw-helpers';
import { rect, text } from '@/engine/svg-maker/base';

export class MenuState implements State {
  private isStartSelected = true;

  onEnter() {
    const nextRow = createColumn('50%', 180, 60);
    tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
      text({ ...nextRow(0), style: 'font-size: 140px' }, 'JS13K 2023'),
      text({ ...nextRow(100), id_: 'start' }, 'Start'),
      text({ ...nextRow(80), id_: 'fullscreen' }, 'Fullscreen'),
    );
  }

  onUpdate() {
    this.updateControls();
    try {
      if (this.isStartSelected) {
        start.style.fill = '#fff';
        fullscreen.style.fill = '#000';
      } else {
        start.style.fill = '#000';
        fullscreen.style.fill = '#fff';
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
