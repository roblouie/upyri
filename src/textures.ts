import {
  ellipse,
  feComponentTransfer, feComposite, feDiffuseLighting,
  feDisplacementMap, feDistantLight,
  feFunc,
  feTurbulence,
  filter, group,
  NoiseType,
  rect,
  svg, SvgAttributes, SvgString
} from '@/engine/svg-maker/base';
import { toImage, toImageData } from '@/engine/svg-maker/converters';

const textureSize = 512;
const skyboxSize = 1024;

export const textures: {[key: string]: TexImageSource} = {};
export const skyboxes: {[key: string]: TexImageSource[]} = {};

export async function initTextures() {
  // textures.clouds = await toImage(drawClouds());

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
  console.log(skyboxes.test);
}

function drawClouds(width_: number) {
  return filter({ id_: 'filter', width_: '100%', height_: '100%', x: 0, y: 0 },
      feTurbulence({ seed_: 2, type_: NoiseType.Fractal, numOctaves_: 6, baseFrequency: 0.003, stitchTiles_: 'stitch' }),
      feComponentTransfer({},
        feFunc('R',  'table', [1, 1]),
        feFunc('G',  'table', [1, 1]),
        feFunc('B',  'table', [1, 1]),
        feFunc('A',  'table', [0, 0, 0.8])
      )
    ) +
    rect({ x: 0, y: 0, width_, height_: 1024, filter: 'filter' });
}

function landPattern(y: number, color: string, seed_: number, numOctaves: number) {
  return filter({ id_: `filter${y}`, x: 0, width_: '100%', height_: '150%' },
      feTurbulence({ type_: NoiseType.Fractal, baseFrequency: [0.01, 0], numOctaves_: numOctaves, seed_, stitchTiles_: 'stitch' }),
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
  return horizontalSkyboxSlice({ width_: skyboxSize * 4, height_: skyboxSize, style: 'background:linear-gradient(#2189d9,#11294e)' },
    drawClouds(4096),
    landPattern(500, '#051', 15, 3),
    landPattern(520, '#071', 3, 2),
  );
}

function drawSkyboxTop() {
  return svg({ width_: skyboxSize, height_: skyboxSize, style: 'background: #2189d9' }, drawClouds(skyboxSize));
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
