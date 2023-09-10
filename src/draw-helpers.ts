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

export function drawLoadingScreen() {
  tmpl.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
    rect({x: 0, y: 0, width_: '100%', height_: '100%' }),
      drawBloodText({ x: '50%', y: '52%', style: 'font-size: 250px; text-shadow: 1px 1px 20px' }, 'LOADING', 40),
  );
}
