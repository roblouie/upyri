import { drawBloodText } from '@/textures';

export function overlaySvg(...elements: string[]): string {
  return `<svg viewBox="0 0 1920 1080" style="text-anchor: middle" xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
}

export function drawFullScreenText(text: string, fontSize = 250) {
  tmpl.innerHTML = overlaySvg(
  `<rect x="0" y="0" width="100%" height="100%" />`,
      drawBloodText('50%', '52%', `font-size: ${fontSize}px; text-shadow: 1px 1px 20px`, text, 40),
  );
}
