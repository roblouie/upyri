import {
  ellipse,
  feTurbulence,
  filter,
  NoiseType, radialGradient,
  rect,
  svg, svgStop,
} from '@/engine/svg-maker/base';
import { toHeightmap } from '@/engine/svg-maker/converters';


export async function newNoiseLandscape(size: number,seed_: number, baseFrequency: number, numOctaves_: number, type_: NoiseType, scale_: number) {
  const s = svg({ width_: 256, height_: 256 },
    filter({ id_: 'n' },
      feTurbulence({ seed_, baseFrequency, numOctaves_, type_ }),
    ),
    radialGradient({ id_: 'l' },
      svgStop({ offset_: '10%', stopColor: '#0004' }),
      svgStop({ offset_: '22%', stopColor: '#0000' }),
    ),
    rect({ x: 0, y: 0, width_: '100%', height_: '100%', filter: 'n' }),
    ellipse({ cx: 128, cy: 128, fill: 'url(#l)', rx: 200, ry: 200 }),
    //    <ellipse cx="128" cy="130" fill="#bbb" rx="23" ry="23"/>
    ellipse({ cx: 128, cy: 128, fill: '#afafaf', rx: 26, ry: 26 }),

    // rect({ x: 109, y: 109, width_: 38, height_: 42, fill: '#afafaf' }),
    rect({ x: 125, y: 10, width_: 6, height_: 80, fill: '#afafaf' })
  );
  return toHeightmap(s, scale_);
}
