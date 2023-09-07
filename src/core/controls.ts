import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

class Controls {
  isUp? = false;
  isDown? = false;
  isLeft?: boolean = false;
  isRight?: boolean = false;
  isConfirm? = false;
  isJump? = false;
  inputDirection: EnhancedDOMPoint;
  private mouseMovement = new EnhancedDOMPoint();
  private onMouseMoveCallback?: (mouseMovement: EnhancedDOMPoint) => void;

  keyMap: Map<string, boolean> = new Map();

  constructor() {
    document.addEventListener('keydown', event => this.toggleKey(event, true));
    document.addEventListener('keyup', event => this.toggleKey(event, false));
    document.addEventListener('mousemove', event => {
      this.mouseMovement.x = event.movementX;
      this.mouseMovement.y = event.movementY;
      this.onMouseMoveCallback?.(this.mouseMovement);
    });
    this.inputDirection = new EnhancedDOMPoint();
  }

  onMouseMove(callback: (mouseMovement: EnhancedDOMPoint) => void) {
    this.onMouseMoveCallback = callback;
  }

  queryController() {
    const leftVal = (this.keyMap.get('KeyA') || this.keyMap.get('ArrowLeft')) ? -1 : 0;
    const rightVal = (this.keyMap.get('KeyD') || this.keyMap.get('ArrowRight')) ? 1 : 0;
    const upVal = (this.keyMap.get('KeyW') || this.keyMap.get('ArrowUp')) ? -1 : 0;
    const downVal = (this.keyMap.get('KeyS') || this.keyMap.get('ArrowDown')) ? 1 : 0;
    this.inputDirection.x = (leftVal + rightVal);
    this.inputDirection.y = (upVal + downVal);

    this.isUp = this.keyMap.get('KeyW');
    this.isDown = this.keyMap.get('KeyS');
    this.isLeft = this.keyMap.get('KeyA');
    this.isRight = this.keyMap.get('KeyD');
    this.isConfirm = this.keyMap.get('KeyE');
    this.isJump = this.keyMap.get('Space');
  }

  private toggleKey(event: KeyboardEvent, isPressed: boolean) {
    this.keyMap.set(event.code, isPressed);
  }
}

export const controls = new Controls();
