import { addGap, createAudioNode, createPannerNode, zzfxG } from '@/engine/audio/audio-player';

const sadGhostBuffer2 = zzfxG(...[2.11,.85,100,.38,.58,.08,1,,-0.1,-0.2,350,.14,,,4,.1,.05,-0.6,.26,.17]);
export const sadGhostAudio2 = createPannerNode(sadGhostBuffer2);

export const outsideFootsteps = createAudioNode(addGap(zzfxG(...[.1,.65,986,.01,.03,.03,4,2.63,,,,,.25,6.8,,,.09,.14,.01]), 0.3));
export const indoorFootsteps = createAudioNode(zzfxG(...[.1,.65,1100,,.03,.42,4,2.63,,,,,,2.2,,,,.14,.01]));

export const doorCreak = createPannerNode(zzfxG(...[.1,,349,.57,.51,1,2,,2.4,-2,,.09,,.4,,,.02,1.3,.72]));

export const draggingSound = createPannerNode(zzfxG(...[1.09,,152,.11,1,1,1,2.19,4,,-10,,.06,1.1,51,.2,.16,.86,.5,.31]));
export const draggingSound2 = createPannerNode(zzfxG(...[0.1,0,50,.1,1.3,,4,9,,,-10,.01,,,,-0.2,,.87,1]));

export const draggingSound3 = createPannerNode(zzfxG(...[,.15,50,.34,1,1,,.11,-1.9,-0.9,20,3,.18,5,,,.31,1.01,1,.08]));

export const draggingSound4 = createPannerNode(zzfxG(...[0.1,.15,50,.34,.91,.31,,.11,-1.9,-0.9,20,3,.01,7.2,,,.15,1.01,1]));

export const ominousDiscovery1 = createAudioNode(zzfxG(...[1.2,0,87.30706,.5,1,1.4,1,.83,10.5,,40,.5,-0.01,,,.1,.8,1.3,.5,.14]));

export const ominousDiscovery2 = createAudioNode(zzfxG(...[3,,87.30706,.08,.41,1.41,1,.83,10.5,,3,.5,-0.01,.1,,.1,.78,,.11,.14]));

export const pickup1 = createAudioNode(zzfxG(...[1.09,,152,.01,.08,1,,2.19,,,,,.05,1.1,51,.2,.02,.86,.04]));
