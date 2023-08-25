export type LengthOrPercentage = `${number}%` | `${number}` | number;
export type SvgString = `<svg${string}</svg>`;
type FeTurbulenceString = `<feTurbulence${string}/>`;
type FeColorMatrixString = `<feColorMatrix${string}/>`;
type FeDisplacementMapString = `<feDisplacementMap${string}/>`;
type FeFuncString = `<feFunc${string}/>`;
type FeComponentTransferString = `<feComponentTransfer${string}</feComponentTransfer>`;
type FeCompositeString = `<feComposite${string}/>`;
type FeBlendString = `<feBlend${string}/>`;
type FeDiffuseLightingString = `<feDiffuseLighting${string}</feDiffuseLighting>`;
type FeDistanceLightString = `<feDistantLight${string}/>`
type FeMorphologyString = `<feMorphology${string}/>`;

type FilterElements = FeTurbulenceString | FeColorMatrixString | FeFuncString | FeComponentTransferString | FeDisplacementMapString | FeCompositeString | FeBlendString | FeDiffuseLightingString | FeMorphologyString;
type FilterString = `<filter${string}</filter>`;
type RectString = `<rect${string}/>`;
type EllipseString = `<ellipse${string}/>`;
type TextString = `<text${string}</text>`;
type LinearGradientString = `<linearGradient${string}</linearGradient>`;
type RadialGradientString = `<radialGradient${string}</radialGradient>`;
type SvgStopString = `<stop${string}/>`;
type SvgMaskString = `<mask${string}</mask>`;

interface HasId {
  id_?: string;
}

interface Maskable {
  mask?: string;
}

interface Placeable {
  x?: LengthOrPercentage;
  y?: LengthOrPercentage;
}

interface Sizeable {
  width_?: LengthOrPercentage;
  height_?: LengthOrPercentage;
}

interface Filterable {
  filter?: string;
}

interface Drawable {
  fill?: string;
}

interface Styleable {
  style?: string;
}

export const enum NoiseType {
  Turbulence = 'turbulence',
  Fractal = 'fractalNoise',
}

interface HasInputs {
  in?: string;
  in2?: string;
}

interface DoesColorTransformation {
  colorInterpolationFilters?: 'sRGB' | 'linearRGB';
}

interface HasGradientTransform {
  gradientTransform?: string;
}

interface FeTurbulenceAttributes extends DoesColorTransformation, HasId {
  seed_?: number
  baseFrequency?: number | [number, number];
  numOctaves_?: number;
  type_?: NoiseType;
  result?: string;
  stitchTiles_?: 'stitch' | 'noStitch'
}

interface SvgEllipseAttributes extends Filterable, Drawable, Maskable {
  cx: LengthOrPercentage,
  cy: LengthOrPercentage,
  rx: LengthOrPercentage,
  ry: LengthOrPercentage,
}

type SvgFilterAttributes = HasId & Placeable & Sizeable;

type SvgLinearGradientAttributes = HasId & HasGradientTransform;

interface SvgRadialGradientAttributes extends HasId, HasGradientTransform {
  cx?: LengthOrPercentage,
  cy?: LengthOrPercentage,
  fr?: LengthOrPercentage,
  fx?: LengthOrPercentage,
  fy?: LengthOrPercentage,
}

interface SvgStopAttributes {
  offset_: LengthOrPercentage;
  stopColor: string;
}

interface FeColorMatrixAttributes extends DoesColorTransformation {
  in?: string;
  type_?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha';
  values?: number[] | string;
}

type SvgRectAttributes = Filterable & Placeable & Sizeable & Drawable & Maskable;

export type SvgTextAttributes = HasId & Filterable & Placeable & Sizeable & Drawable & Styleable & Maskable;

interface FeBlendAttributes extends HasInputs {
  mode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge'
    | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation'
    | 'color' | 'luminosity';
}

interface FeDiffuseLightingAttributes extends HasInputs {
  lightingColor: string;
  surfaceScale: number;
}

interface HasOperator {
  operator: string;
}

interface FeCompositeAttributes extends HasInputs, HasOperator {
  operator: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'lighter' | 'arithmetic';
  k2?: number;
  k3?: number;
}

interface FeDisplacementMapAttributes extends HasInputs, DoesColorTransformation {
  scale_?: number;
}

interface FeMorphologyAttributes extends HasOperator {
  radius: LengthOrPercentage;
  operator: 'dilate' | 'erode';
}

export interface SvgAttributes extends Sizeable, HasId, Styleable {
  viewBox?: string;
}

export type AllSvgAttributes = FeTurbulenceAttributes & SvgEllipseAttributes & HasId
  & FeColorMatrixAttributes & SvgRectAttributes & SvgTextAttributes
  & FeDisplacementMapAttributes & FeBlendAttributes & FeDiffuseLightingAttributes & SvgAttributes
  & SvgLinearGradientAttributes & SvgRadialGradientAttributes & SvgStopAttributes
  & HasOperator & Pick<FeMorphologyAttributes, 'radius'> & Pick<FeCompositeAttributes, 'k2' | 'k3'>;


export function svg(attributes: SvgAttributes, ...elements: string[]): SvgString {
  return `<svg ${attributesToString(attributes)} xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
}

export function group(attributes: Filterable, ...elements: string[]) {
  return `<g ${attributesToString(attributes)}>${elements.join('')}</g>`;
}

export function filter(attributes: SvgFilterAttributes, ...filterElements: FilterElements[]): FilterString {
  return `<filter ${attributesToString(attributes)}>${filterElements.join('')}</filter>`;
}

// Rectangle
export function rect(attributes: SvgRectAttributes): RectString {
  return `<rect ${attributesToString(attributes)}/>`;
}

// Ellipse
export function ellipse(attributes: SvgEllipseAttributes): EllipseString {
  return `<ellipse ${attributesToString(attributes)}/>`;
}

// Text
export function text(attributes: SvgTextAttributes, textToDisplay?: any): TextString {
  return `<text ${attributesToString(attributes)}>${textToDisplay ?? ''}</text>`;
}

// Gradients
export function linearGradient(attributes: SvgLinearGradientAttributes, ...stops: SvgStopString[]): LinearGradientString {
  return `<linearGradient ${attributesToString(attributes)}>${stops.join('')}</linearGradient>`;
}

export function radialGradient(attributes: SvgRadialGradientAttributes, ...stops: SvgStopString[]): RadialGradientString {
  return `<radialGradient ${attributesToString(attributes)}>${stops.join('')}</radialGradient>`;
}

export function svgStop(attributes: SvgStopAttributes): SvgStopString {
  return `<stop ${attributesToString(attributes)} />`;
}

// Mask
export function mask(attributes: HasId, ...elements: string[]): SvgMaskString {
  return `<mask ${attributesToString(attributes)}>${elements.join('')}</mask>`;
}

// Minify-safe attribute converter
export function attributesToString(object: Partial<AllSvgAttributes>) {
  const mapper = {
    'baseFrequency': object.baseFrequency,
    'color-interpolation-filters': object.colorInterpolationFilters,
    'cx': object.cx,
    'cy': object.cy,
    'fill': object.fill,
    'filter': object.filter ? `url(#${object.filter})` : object.filter,
    'fr': object.fr,
    'fx': object.fx,
    'fy': object.fy,
    'gradientTransform': object.gradientTransform,
    'height': object.height_,
    'id': object.id_,
    'in': object.in,
    'in2': object.in2,
    'k2': object.k2,
    'k3': object.k3,
    'lighting-color': object.lightingColor,
    'mask': object.mask,
    'mode': object.mode,
    'numOctaves': object.numOctaves_,
    'offset': object.offset_,
    'operator': object.operator,
    'radius': object.radius,
    'result': object.result,
    'rx': object.rx,
    'ry': object.ry,
    'scale': object.scale_,
    'seed': object.seed_,
    'stitchTiles': object.stitchTiles_,
    'stop-color': object.stopColor,
    'style': object.style,
    'surfaceScale': object.surfaceScale,
    'type': object.type_,
    'values': object.values,
    'viewBox': object.viewBox,
    'width': object.width_,
    'x': object.x,
    'y': object.y,
  };

  return Object.entries(mapper).map(([key, value]: [string, any]) => value != null ? `${key}="${value}"` : '').join(' ');
}

// Turbulence
export function feTurbulence(attributes: FeTurbulenceAttributes): FeTurbulenceString {
  // @ts-ignore
  return `<feTurbulence ${attributesToString(attributes)} />`;
}

// Color Matrix
export function feColorMatrix(attributes: FeColorMatrixAttributes): FeColorMatrixString {
  // @ts-ignore
  return `<feColorMatrix ${attributesToString(attributes)}/>`;
}

// Component Transfer
interface FeComponentTransferAttributes extends DoesColorTransformation {
  in?: string;
}
export function feComponentTransfer(attributes: FeComponentTransferAttributes, ...feFuncs: FeFuncString[]): FeComponentTransferString {
  return `<feComponentTransfer color-interpolation-filters="sRGB">${feFuncs.join('')}</feComponentTransfer>`;
}

export function feFunc(color: 'R' | 'G' | 'B' | 'A', type: 'linear' | 'discrete' | 'table', values: number[]): FeFuncString {
  return `<feFunc${color} type="${type}" tableValues="${values}"/>`;
}

// Displacement Map
export function feDisplacementMap(attributes: FeDisplacementMapAttributes): FeDisplacementMapString {
  return `<feDisplacementMap ${attributesToString(attributes)} />`;
}

// Morphology
export function feMorphology(attributes: FeMorphologyAttributes): FeMorphologyString {
  return `<feMorphology ${attributesToString(attributes)} />`;
}

// Composite
export function feComposite(attributes: FeCompositeAttributes): FeCompositeString {
  return `<feComposite ${attributesToString(attributes)} />`;
}

// Blend
export function feBlend(attributes: FeBlendAttributes): FeBlendString {
  return `<feBlend ${attributesToString(attributes)} />`;
}

// Diffuse Lighting
export function feDiffuseLighting(attributes: FeDiffuseLightingAttributes, ...lights: FeDistanceLightString[]): FeDiffuseLightingString {
  return `<feDiffuseLighting ${attributesToString(attributes)}>${lights.join('')}</feDiffuseLighting>`;
}

export function feDistantLight(azimuth: number, elevation: number): FeDistanceLightString {
  return `<feDistantLight azimuth="${azimuth}" elevation="${elevation}"/>`;
}
