import { toHeightmap } from '@/engine/svg-maker/converters';

export async function newNoiseLandscape(size: number,seed_: number, baseFrequency: number, numOctaves_: number, type_: 'fractalNoise' | 'turbulentNoise', scale_: number) {
  const s = `<svg width="${256}" height="${256}" xmlns="http://www.w3.org/2000/svg">
    <filter id="n">
        <feTurbulence seed="${seed_}" baseFrequency="${baseFrequency}" numOctaves="${numOctaves_}" type="${type_}"/>
    </filter>
    <radialGradient id="l">
        <stop offset="10%" stop-color="#0004" />
        <stop offset="22%" stop-color="#0000" />
    </radialGradient>
    <rect x="0" y="0" width="100%" height="100%" filter="url(#n)"/>
    <ellipse rx="200" ry="200" cx="128" cy="128" fill="url(#l)"/>
    <ellipse rx="26" ry="26" cx="128" cy="128" fill="#afafaf"/>
    <rect x="125" y="10" width="6" height="80" fill="#afafaf"/>
</svg>`;
  return toHeightmap(s, scale_);
}
