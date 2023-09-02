import {
  AllSvgAttributes,
  ellipse,
  feColorMatrix,
  feComponentTransfer,
  feComposite,
  feDiffuseLighting,
  feDisplacementMap,
  feDistantLight,
  feFunc,
  feMorphology,
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
  svgStop,
  SvgTextAttributes,
  text
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
  // materials.grass.texture!.textureRepeat.x = 160;
  // materials.grass.texture!.textureRepeat.y = 10;

  materials.brickWall = new Material({ texture: textureLoader.load_(await bricksRocksPlanksWood(true, true))});
  materials.stone = new Material({texture: textureLoader.load_(await bricksRocksPlanksWood(true, false))});
  materials.wood = new Material({ texture: textureLoader.load_(await bricksRocksPlanksWood(false, false))});
  materials.planks = new Material({ texture: textureLoader.load_(await bricksRocksPlanksWood(false, true))});
  materials.castleWriting = new Material({ texture: textureLoader.load_(await castleSign()), isTransparent: true });
  materials.handprint = new Material({ texture: textureLoader.load_(await handprint()), isTransparent: true });
  materials.face = new Material({ texture: textureLoader.load_(await face())})

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

function castleSign() {
  return toImage(
    svg({ width_: textureSize, height_: textureSize },
      drawBloodText({ x: 10, y: '30%', style: 'font-size: 120px; transform: scaleY(1.5); font-family: sans-serif' }, 'CASTLE', 50)
    )
  )
}

function handprint() {
  return toImage(
    svg({ width_: textureSize, height_: textureSize },
      drawBloodText({ x: 10, y: '30%', style: 'font-size: 120px; transform: scaleY(1.5); font-family: sans-serif' }, '🖐️', 50)
    )
  )
}

function stars() {
  return filter(fullSize({id_: 's'}),
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
  return stars() + filter(fullSize({ id_: 'f' }),
      feTurbulence({ seed_: 2, type_: NoiseType.Fractal, numOctaves_: 6, baseFrequency: 0.003, stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [0.8, 0.8]),
        feFunc('G',  'table', [0.8, 0.8]),
        feFunc('B',  'table', [1, 1]),
        feFunc('A',  'table', [0, 0, 1])
      )
    ) +
    mask({ id_: 'mask' },
      radialGradient({ id_: 'g' },
        svgStop({ offset_: '20%', stopColor: 'white' }),
        svgStop({ offset_: '30%', stopColor: '#666' }),
        svgStop({ offset_: '100%', stopColor: 'black' })
      ),
      ellipse({ cx: 1000, cy: 1000, rx: '50%', ry: '50%', fill: 'url(#g)'})
    )
    + radialGradient({ id_: 'l' },
      svgStop({ offset_: '10%', stopColor: '#fff' }),
      svgStop({ offset_: '30%', stopColor: '#0000' })
    )
    + rect(fullSize({ filter: 's' }))
    + ellipse({cx: 1000, cy: 1000, rx: 200, ry: 200, fill: 'url(#l)' })
    + rect(fullSize({ filter: 'f', mask: 'url(#mask)' }));
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
    return filter(fullSize({ id_: `f${index}` }),
      feTurbulence({ seed_: seeds[index], type_: NoiseType.Fractal, numOctaves_: numOctaves[index], baseFrequency: baseFrequencies[index], stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [0.2, 0.2]),
        feFunc('G',  'table', [0.2, 0.2]),
        feFunc('B',  'table', [0.25, 0.25]),
        feFunc('A',  'table', alphaTableValues[index])
      )
    ) +
      linearGradient({ id_: `g${index}`, gradientTransform: 'rotate(90)'},
        svgStop({ offset_: 0, stopColor: 'black'}),
        svgStop({ offset_: 0.3, stopColor: 'white'}),
        svgStop({ offset_: 0.7, stopColor: 'white'}),
        svgStop({ offset_: 1, stopColor: 'black'}),
      ) +
      mask({ id_: `m${index}`},
        rect({ x: 0, y: yPositions[index], width_, height_: heights[index], fill: `url(#g${index})`})
      ) +
      rect({ filter: `f${index}`, height_: heights[index], width_, x: 0, y: yPositions[index], mask: `url(#m${index})`});
  }).join('');

  return stars() + rect(fullSize({ filter: 's' })) + clouds;
}


function landPattern(y: number, color: string, seed_: number, numOctaves: number) {
  return filter({ id_: `f${y}`, x: 0, width_: '100%', height_: '150%' },
      feTurbulence({ type_: NoiseType.Fractal, baseFrequency: [0.008, 0], numOctaves_: numOctaves, seed_, stitchTiles_: 'stitch' }),
      feDisplacementMap({ in: 'SourceGraphic', scale_: 100 }),
    ) +
    filter({ id_: `g${y}`, x: 0, width_: '100%' },
      feTurbulence({ id_: 'test', baseFrequency: [0.02, 0.01], numOctaves_: numOctaves, type_: NoiseType.Fractal, result: `n${y}`, seed_, stitchTiles_: 'stitch' }),
      feDiffuseLighting({ in: `n${y}`, lightingColor: color, surfaceScale: 22 },
        feDistantLight(45, 60)
      ),
      feComposite({ in2: 'SourceGraphic', operator: 'in' }),
    ) +
    group({ filter: `g${y}` },
      rect({ x: 0, y, width_: skyboxSize * 4, height_: '50%', filter: `f${y}`})
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
    filter(fullSize({ id_: 'n' }),
      feTurbulence({ seed_: 3, type_: NoiseType.Fractal, baseFrequency: 0.04, numOctaves_: 4, stitchTiles_: 'stitch' }),
      feMorphology({ operator: 'dilate', radius: 3 }),
      feComponentTransfer({},
        feFunc('R',  'table', [0.2, 0.2]),
        feFunc('G',  'table', [0.2, 0.2]),
        feFunc('B',  'table', [0.25, 0.25]),
        // feFunc('A',  'table', [0.])
      )
    ),
    rect(fullSize({ fill: '#171717' })),
    rect(fullSize({ filter: 'n' })),
  ));
}

function getPattern(width = 160, height = 256) {
  return `<pattern id="pattern" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
        <path d="m 0 246 h 148 V 125 H 0 V112 h72 V0 h15 v112 h 74 V 0 H 0"/>
    </pattern>`
}

function rockWoodFilter(isRock = true) {
  return filter(fullSize({ id_: 'rw' }),
    `<feDropShadow dx="${isRock ? 1 : 300}" dy="${isRock ? 1 : 930}" result="s"/>` +
    feTurbulence({ type_: NoiseType.Fractal, baseFrequency: isRock ? 0.007 : [0.1, 0.007], numOctaves_: isRock ? 9 : 6, stitchTiles_: 'stitch' }),
    feComposite({ in: 's', operator: 'arithmetic', k2: isRock ? 0.5 : 0.5, k3: 0.5 }),
    feComponentTransfer({}, feFunc('A', 'table', [0, .1, .2, .3, .4, .2, .4, .2, .4])),
    feDiffuseLighting({ surfaceScale: 2.5, lightingColor: isRock ? '#ffd' : '#6e5e42' },
      feDistantLight(isRock ? 265 : 110, isRock ? 4 : 10),
    ),
  )
}

function bricksRocksPlanksWood(isRock = true, isPattern = true) {
  return toImage(svg({ width_: 512, height_: 512 },
    (isPattern ? getPattern( isRock ? 160 : 75, isRock ? 256 : 1) : '') +
    rockWoodFilter(isRock),
    rect({ x: 0, y: 0, width_: '100%', height_: '100%', fill: isPattern ? 'url(#pattern)' : undefined, filter: 'rw' })
  ));
}

export function drawBloodText(attributes: SvgTextAttributes, textToDisplay: string, scale = 70) {
  return bloodEffect(text({ style: 'font-size: 360px; transform: scaleY(1.5);', ...attributes, filter: 'd' }, textToDisplay), scale)
}

export function bloodEffect(component: string, scale_ = 70, freq1: [number, number] = [0.13, 0.02], freq2 = 0.04) {
    return filter({ id_: 'd' },
      feTurbulence({ baseFrequency: freq1, numOctaves_: 1, type_: NoiseType.Fractal, result: 'd' }),
      feDisplacementMap({ in: 'SourceGraphic', in2: 'd', scale_ }),
    ) +
    filter({ id_: 'b' },
      feTurbulence({ baseFrequency: freq2, numOctaves_: 1, type_: NoiseType.Fractal }),
      feColorMatrix({ values: [
          0.4, 0.2, 0.2, 0, -0.1,
          0, 2, 0, 0, -1.35,
          0, 2, 0, 0, -1.35,
          0, 0, 0, 0, 1,
        ] }),
      feComposite({ in2: 'SourceGraphic', operator: 'in' }),
    ) +
    group({ filter: 'b' }, component);
}

export function face() {
    return toImage(svg({ width_: 512, height_: 512, style: 'filter: invert()', viewBox: '0 0 512 512' },
      filter({ id_: 'filter', x: '-0.01%', primitiveUnits: 'objectBoundingBox', width_: '100%', height_: '100%'},
          feTurbulence({ seed_: 7, type_: NoiseType.Fractal, baseFrequency: 0.005, numOctaves_: 5, result: 'n'}),
          feComposite({ in: 'SourceAlpha', operator: 'in' }),
          feDisplacementMap({ in2: 'n', scale_: 0.9 })
        ),
      rect(fullSize({ id_: 'l', filter: 'filter', y: -37 })),
      rect({ fill: '#fff', width_: '100%', height_: '100%' }),
    `
    <use href="#l" x="22%" y="42" transform="scale(2.2, 1.2)"></use>
    <use href="#l" x="-22%" y="42" transform="rotate(.1) scale(-2.2 1.2)"></use>`,
      rect({ fill: '#777', x: 220, y: 230, width_: 50, height_: 50 })
    ));
}
