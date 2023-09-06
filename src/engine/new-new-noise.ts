import {
  feTurbulence,
  filter,
  NoiseType,
  rect,
  svg,
} from '@/engine/svg-maker/base';
import { toHeightmap } from '@/engine/svg-maker/converters';


//TODO: Do a radial gradient overlay so the center is slightly sunken in and the outer edges are high
export async function newNoiseLandscape(size: number,seed_: number, baseFrequency: number, numOctaves_: number, type_: NoiseType, scale_: number) {
  const s = svg({ width_: 256, height_: 256 },
    filter({ id_: 'noise' },
      feTurbulence({ seed_, baseFrequency, numOctaves_, type_ }),
    ),
    rect({ x: 0, y: 0, width_: '100%', height_: '100%', filter: 'noise' }),
    rect({ x: 109, y: 109, width_: 38, height_: 42, fill: '#bbb' }),
    rect({ x: 125, y: 30, width_: 6, height_: 80, fill: '#bbb' })
  );
  return toHeightmap(s, scale_);
}

export function randomNumber(seed_: number): number {
  return Math.sin(seed_ * 99999) % 1;
}
