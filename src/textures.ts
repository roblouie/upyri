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
  svgStop, SvgTextAttributes, text
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

  materials.brickWall = new Material({ texture: textureLoader.load_(await tileTest())});

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

const night = 'black';

function stars() {
  return filter(fullSize({id_: 'stars'}),
    feTurbulence({ baseFrequency: 0.2, stitchTiles_: 'stitch' }),
    feColorMatrix({ values: [
        0, 0, 0, 9, -5.5,
        0, 0, 0, 9, -5.5,
        0, 0, 0, 9, -5.5,
        0, 0, 0, 0, 1
      ]
    })
  );
}

function drawClouds() {
  return stars() + filter(fullSize({ id_: 'filter' }),
      feTurbulence({ seed_: 2, type_: NoiseType.Fractal, numOctaves_: 6, baseFrequency: 0.003, stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [0.8, 0.8]),
        feFunc('G',  'table', [0.8, 0.8]),
        feFunc('B',  'table', [1, 1]),
        feFunc('A',  'table', [0, 0, 1])
      )
    ) +
    mask({ id_: 'mask' },
      radialGradient({ id_: 'gradient' },
        svgStop({ offset: '20%', stopColor: 'white' }),
        svgStop({ offset: '30%', stopColor: '#666' }),
        svgStop({ offset: '100%', stopColor: 'black' })
      ),
      ellipse({ cx: 1000, cy: 1000, rx: '50%', ry: '50%', fill: 'url(#gradient)'})
    )
    + radialGradient({ id_: 'sun' },
      svgStop({ offset: '10%', stopColor: '#fff' }),
      svgStop({ offset: '30%', stopColor: '#0000' })
    )
    + rect(fullSize({ filter: 'stars' }))
    + ellipse({cx: 1000, cy: 1000, rx: 200, ry: 200, fill: 'url(#sun)' })
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

  const clouds = doTimes(2, index => {
    return filter(fullSize({ id_: `filter${index}` }),
      feTurbulence({ seed_: seeds[index], type_: NoiseType.Fractal, numOctaves_: numOctaves[index], baseFrequency: baseFrequencies[index], stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [0.2, 0.2]),
        feFunc('G',  'table', [0.2, 0.2]),
        feFunc('B',  'table', [0.25, 0.25]),
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

  const done = stars() + rect(fullSize({ filter: 'stars' })) + clouds;
  console.log(done);
  return done;
}


function landPattern(y: number, color: string, seed_: number, numOctaves: number) {
  return filter({ id_: `filter${y}`, x: 0, width_: '100%', height_: '150%' },
      feTurbulence({ type_: NoiseType.Fractal, baseFrequency: [0.008, 0], numOctaves_: numOctaves, seed_, stitchTiles_: 'stitch' }),
      feDisplacementMap({ in: 'SourceGraphic', scale_: 100 }),
    ) +
    filter({ id_: `groundPattern${y}`, x: 0, width_: '100%' },
      feTurbulence({ id_: 'test', baseFrequency: [0.02, 0.01], numOctaves_: numOctaves, type_: NoiseType.Fractal, result: `noise${y}`, seed_, stitchTiles_: 'stitch' }),
      feDiffuseLighting({ in: `noise${y}`, lightingColor: color, surfaceScale: 22 },
        feDistantLight(45, 60)
      ),
      feComposite({ in2: 'SourceGraphic', operator: 'in' }),
    ) +
    group({ filter: `groundPattern${y}` },
      rect({ x: 0, y, width_: skyboxSize * 4, height_: '50%', filter: `filter${y}`})
    );
}

function drawSkyboxHor() {
  return horizontalSkyboxSlice({ width_: skyboxSize * 4, height_: skyboxSize, style: `background:${night};` },
    drawBetterClouds(skyboxSize * 4),
    landPattern(1000, '#1c1d2d', 15, 4),
  );
}

function drawSkyboxTop() {
  return svg({ width_: skyboxSize, height_: skyboxSize, style: `background: ${night}` }, drawClouds());
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
    filter(fullSize({ id_: 'noise' }),
      feTurbulence({ seed_: 3, type_: NoiseType.Fractal, baseFrequency: 0.04, numOctaves_: 4, stitchTiles_: 'stitch' }),
      feMorphology({ operator: 'dilate', radius: 3 }),
      feColorMatrix({ values: [0.1, 0.1, 0, 0.2, -0.1,
                                       0, 0.1, 0.3, 0.2, -0.1,
                                       0, 0, 0.1, 0.2, -0.1,
                                       0, 0, 0, 0, 0.5]
      })
    ),
    rect(fullSize({ fill: '#361e1e' })),
    rect(fullSize({ filter: 'noise' })),
  ));
}

function tileTest() {
  return toImage(svg({ width_: 512, height_: 512 },
    `<pattern id="pattern" width="80" height="128" patternUnits="userSpaceOnUse">
        <path d="m 0 123 h 74 V 66 H 0 V56 h36 V0 h8 v56 h 37 V 0 H 0" stroke="red" stroke-width="1"/>
    </pattern>` +
    filter({ id_: 'rock', x: 0, y: 0, width_: '100%', height_: '100%' },
      `<feDropShadow dx="1" dy="1" result="s"/>` +
      feTurbulence({ type_: NoiseType.Fractal, baseFrequency: 0.007, numOctaves_: 9, stitchTiles_: 'stitch' }),
      feComposite({ in: 's', operator: 'arithmetic', k2: 0.5, k3: 0.5 }),
      feComponentTransfer({}, feFunc('A', 'table', [0, .1, .2, .3, .4, .2, .4, .2, .4])),
      feDiffuseLighting({ surfaceScale: 2.5, lightingColor: '#ffd'},
        feDistantLight(265, 4),
      ),
    ),
    rect({ x: 0, y: 0, width_: '100%', height_: '100%', fill: 'url(#pattern)', filter: 'rock' })
  ));
}

export function drawBloodText(attributes: SvgTextAttributes, textToDisplay?: any) {
    return filter({ id_: 'circleDistort' },
      feTurbulence({ baseFrequency: [0.13, 0.02], numOctaves_: 1, type_: NoiseType.Fractal, result: 'circleDistortNoise' }),
      feDisplacementMap({ in: 'SourceGraphic', in2: 'circleDistortNoise', scale_: 70 }),
    ) +
    filter({ id_: 'bloodPattern' },
      feTurbulence({ baseFrequency: 0.04, numOctaves_: 1, type_: NoiseType.Fractal }),
      feColorMatrix({ values: [
          0.4, 0.2, 0.2, 0, -0.1,
          0, 2, 0, 0, -1.35,
          0, 2, 0, 0, -1.35,
          0, 0, 0, 0, 1,
        ] }),
      feComposite({ in2: 'SourceGraphic', operator: 'in' }),
    ) +
    group({ filter: 'bloodPattern' },
      text({ ...attributes, filter: 'circleDistort', style: 'font-size: 360px; transform: scaleY(1.5);' }, textToDisplay)
    );
}
