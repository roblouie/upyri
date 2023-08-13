import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { initTextures } from '@/textures';
import { GameState } from '@/game-states/game.state';
import { gameStates } from '@/game-states/game-states';
import { MenuState } from '@/game-states/menu.state';
import { drawLoadingScreen } from '@/draw-helpers';

let previousTime = 0;
const interval = 1000 / 60;

(async () => {
  drawLoadingScreen();
  await initTextures();

  gameStates.gameState = new GameState();
  gameStates.menuState = new MenuState();

  createGameStateMachine(gameStates.menuState);

  draw(0);

  function draw(currentTime: number) {
    const delta = currentTime - previousTime;

    if (delta >= interval) {
      previousTime = currentTime - (delta % interval);

      controls.queryController();
      gameStateMachine.getState().onUpdate(delta);
    }
    requestAnimationFrame(draw);
  }
})();


