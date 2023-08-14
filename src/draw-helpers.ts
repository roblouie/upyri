import {
  LengthOrPercentage,
  rect,
  svg,
  SvgAttributes,
  SvgString,
  SvgTextAttributes,
  text
} from '@/engine/svg-maker/base';
import { drawBloodText } from '@/textures';

export function overlaySvg(additionalAttributes?: Partial<SvgAttributes>, ...elements: string[]): SvgString {
  return svg({...additionalAttributes, viewBox: `0 0 1920 1080` }, ...elements);
}

export function createColumn(x: LengthOrPercentage, startingY: number, baseSpacing: number): (additionalSpacing?: number) => Partial<SvgTextAttributes> {
  return function nextPosition(additionalSpacing?: number) {
    const result = { x, y: startingY + (additionalSpacing ?? 0) };
    startingY = baseSpacing + result.y;
    return result;
  };
}

export function drawLoadingScreen() {
  tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
    rect({x: 0, y: 0, width_: '100%', height_: '100%' }),
    drawBloodText({ x: '50%', y: '50%', style: 'font-size: 140px' }, 'Loading')
  );
}

export function clearTemplate() {
  tmpl.innerHTML = '';
}
