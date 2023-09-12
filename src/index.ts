import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { drawBloodText, initTextures } from '@/textures';
import { GameState } from '@/game-states/game.state';
import { gameStates } from '@/game-states/game-states';
import { MenuState } from '@/game-states/menu.state';
import { castleContainer, createCastle } from '@/modeling/castle';
import { rect, svg } from '@/engine/svg-maker/base';

let previousTime = 0;
const interval = 1000 / 60;

(() => {
  tmpl.innerHTML = svg({ viewBox: `0 0 1920 1080` },
    rect({x: 0, y: 0, width_: '100%', height_: '100%' }),
    drawBloodText({ x: '50%', y: '52%', style: `font-size: 200px; text-shadow: 1px 1px 20px` }, 'CLICK TO START', 40),
  );

  document.onclick = async () => {
    tmpl.innerHTML = svg({ viewBox: `0 0 1920 1080` },
      rect({x: 0, y: 0, width_: '100%', height_: '100%' }),
      drawBloodText({ x: '50%', y: '52%', style: `font-size: 200px; text-shadow: 1px 1px 20px` }, 'LOADING', 40),
    );

    await initTextures();
    castleContainer.value = createCastle().translate_(0, 21);

    gameStates.gameState = new GameState();
    gameStates.menuState = new MenuState();

    createGameStateMachine(gameStates.menuState);

    draw(0);

    document.onclick = null;
  };

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


