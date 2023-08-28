import { addGap, createAudioNode, createPannerNode, zzfxG } from '@/engine/audio/audio-player';

const sadGhostBuffer2 = zzfxG(...[2.11,.85,100,.38,.58,.08,1,,-0.1,-0.2,350,.14,,,4,.1,.05,-0.6,.26,.17]);
export const sadGhostAudio2 = createPannerNode(sadGhostBuffer2);

export const outsideFootsteps = createAudioNode(addGap(zzfxG(...[.1,.65,986,.01,.03,.03,4,2.63,,,,,.25,6.8,,,.09,.14,.01]), 0.3));
export const indoorFootsteps = createAudioNode(zzfxG(...[.1,.65,1100,,.03,.42,4,2.63,,,,,,2.2,,,,.14,.01]));

