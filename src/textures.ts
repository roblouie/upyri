import {
  AllSvgAttributes,
  ellipse,
  feColorMatrix,
  feComponentTransfer,
  feComposite,
  feDiffuseLighting,
  feDisplacementMap,
  feDistantLight,
  feFunc, feMorphology,
  feTurbulence,
  filter,
  group,
  linearGradient,
  mask,
  NoiseType,
  radialGradient,
  rect,
  svg,
  SvgAttributes,
  svgStop
} from '@/engine/svg-maker/base';
import { toImage } from '@/engine/svg-maker/converters';
import { doTimes } from '@/engine/helpers';
import { Material } from '@/engine/renderer/material';
import { textureLoader } from '@/engine/renderer/texture-loader';

const textureSize = 512;
const skyboxSize = 2048;

const fullSize = (otherProps: Partial<AllSvgAttributes>): Partial<AllSvgAttributes> => ({ x: 0, y: 0, width_: '100%', height_: '100%', ...otherProps });

export const materials: {[key: string]: Material} = {};
export const skyboxes: {[key: string]: TexImageSource[]} = {};

export async function initTextures() {
  materials.grass = new Material({texture: textureLoader.load_(await drawGrass())});
  materials.grass.texture!.textureRepeat.x = 160;
  materials.grass.texture!.textureRepeat.y = 160;

  const testSlicer = drawSkyboxHor();
  const horSlices = [await testSlicer(), await testSlicer(), await testSlicer(), await testSlicer()];
  skyboxes.test = [
    horSlices[3],
    horSlices[1],
    await toImage(drawSkyboxTop()),
    horSlices[0], // Floor
    horSlices[2],
    horSlices[0],
  ];

  textureLoader.bindTextures();
}

function drawClouds() {
  return filter(fullSize({ id_: 'filter' }),
      feTurbulence({ seed_: 2, type_: NoiseType.Fractal, numOctaves_: 6, baseFrequency: 0.003, stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [1, 1]),
        feFunc('G',  'table', [1, 1]),
        feFunc('B',  'table', [1, 1]),
        feFunc('A',  'table', [0, 0, 1.5])
      )
    ) +
    mask({ id_: 'mask' },
      radialGradient({ id_: 'gradient' },
        svgStop({ offset: '80%', stopColor: 'white' }),
        svgStop({ offset: '100%', stopColor: 'black' })
      ),
      ellipse({ cx: '50%', cy: '50%', rx: '50%', ry: '50%', fill: 'url(#gradient)'})
    )
    + radialGradient({ id_: 'sun' },
      svgStop({ offset: '20%', stopColor: '#fff' }),
      svgStop({ offset: '30%', stopColor: '#eaff39' }),
      svgStop({ offset: '80%', stopColor: '#4190d2' })
    )
    + ellipse({cx: 1000, cy: 1200, rx: 200, ry: 200, fill: 'url(#sun)' })
    + rect(fullSize({ filter: 'filter', mask: 'url(#mask)' }));
}

function drawBetterClouds(width_: number) {
  const seeds = [2, 4];
  const numOctaves = [6, 6];
  const baseFrequencies = [0.005, 0.003];
  const heights = [160, 820];
  const yPositions = [800, 0];
  const alphaTableValues = [
    [0, 0, 0.6],
    [0, 0, 1.5]
  ];

  return doTimes(2, index => {
    return filter(fullSize({ id_: `filter${index}` }),
      feTurbulence({ seed_: seeds[index], type_: NoiseType.Fractal, numOctaves_: numOctaves[index], baseFrequency: baseFrequencies[index], stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [1, 1]),
        feFunc('G',  'table', [1, 1]),
        feFunc('B',  'table', [1, 1]),
        feFunc('A',  'table', alphaTableValues[index])
      )
    ) +
      linearGradient({ id_: `gradient${index}`, gradientTransform: 'rotate(90)'},
        svgStop({ offset: 0, stopColor: 'black'}),
        svgStop({ offset: 0.3, stopColor: 'white'}),
        svgStop({ offset: 0.7, stopColor: 'white'}),
        svgStop({ offset: 1, stopColor: 'black'}),
      ) +
      mask({ id_: `mask${index}`},
        rect({ x: 0, y: yPositions[index], width_, height_: heights[index], fill: `url(#gradient${index})`})
      ) +
      rect({ filter: `filter${index}`, height_: heights[index], width_, x: 0, y: yPositions[index], mask: `url(#mask${index})`});
  }).join('');
}


function landPattern(y: number, color: string, seed_: number, numOctaves: number) {
  return filter({ id_: `filter${y}`, x: 0, width_: '100%', height_: '150%' },
      feTurbulence({ type_: NoiseType.Fractal, baseFrequency: [0.008, 0], numOctaves_: numOctaves, seed_, stitchTiles_: 'stitch' }),
      feDisplacementMap({ in: 'SourceGraphic', scale_: 100 }),
    ) +
    filter({ id_: `groundPattern${y}`, x: 0, width_: '100%' },
      feTurbulence({ id_: 'test', baseFrequency: [0.02, 0.01], numOctaves_: numOctaves, type_: NoiseType.Fractal, result: `noise${y}`, seed_, stitchTiles_: 'stitch' }),
      feDiffuseLighting({ in: `noise${y}`, lightingColor: color, surfaceScale: 12 },
        feDistantLight(45, 60)
      ),
      feComposite({ in2: 'SourceGraphic', operator: 'in' }),
    ) +
    group({ filter: `groundPattern${y}` },
      rect({ x: 0, y, width_: skyboxSize * 4, height_: '50%', filter: `filter${y}`})
    );
}

function drawSkyboxHor() {
  return horizontalSkyboxSlice({ width_: skyboxSize * 4, height_: skyboxSize, style: 'background:linear-gradient(#2189d9,#0059bd)' },
    drawBetterClouds(skyboxSize * 4),
    landPattern(1000, '#051', 15, 3),
    landPattern(1040, '#071', 3, 2),
  );
}

function drawSkyboxTop() {
  return svg({ width_: skyboxSize, height_: skyboxSize, style: 'background: #2189d9' }, drawClouds());
}

function horizontalSkyboxSlice(svgSetting: SvgAttributes, ...elements: string[]) {
  let xPos = 0;
  const context = new OffscreenCanvas(skyboxSize, skyboxSize).getContext('2d')!;

  return async (): Promise<ImageData> => {
    // @ts-ignore
    context.drawImage(await toImage(svg(svgSetting, ...elements)), xPos, 0);
    xPos -= skyboxSize;
    // @ts-ignore
    return context.getImageData(0, 0, skyboxSize, skyboxSize);
  };
}

export function drawGrass() {
  return toImage(svg({ width_: textureSize, height_: textureSize },
    filter({ id_: 'noise', x: 0, y: 0, width_: '100%', height_: '100%' },
      feTurbulence({ seed_: 3, type_: NoiseType.Fractal, baseFrequency: 0.04, numOctaves_: 4, stitchTiles_: 'stitch' }),
      feMorphology({ operator: 'dilate', radius: 3 }),
      feColorMatrix({ values: [0, 0, 0, 0.3, -0.1,
                                       0.3, 0.3, 0.3, 0.3, -0.1,
                                       0, 0, 0, 0.2, -0.1,
                                       0, 0, 0, 0, 0.5]
      })
    ),
    rect(fullSize({ fill: '#051' })),
    rect(fullSize({ filter: 'noise' })),
  ));
}
