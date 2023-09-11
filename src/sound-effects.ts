import { addGap, createAudioNode, createPannerNode, zzfxG } from '@/engine/audio/audio-player';

const pannerFunc = navigator.userAgent.includes('fox') ? createAudioNode : createPannerNode;

export const outsideFootsteps = createAudioNode(addGap(zzfxG(...[.1,.65,986,.01,.03,.03,4,2.63,,,,,.25,6.8,,,.09,.14,.01]), 0.3));
export const indoorFootsteps = createAudioNode(zzfxG(...[.1,.65,1100,,.03,.42,4,2.63,,,,,,2.2,,,,.14,.01]));

export const doorCreak = pannerFunc(zzfxG(...[.1,,349,.57,.51,1,2,,2.4,-2,,.09,,.4,,,.02,1.3,.72]));

// export const draggingSound = createPannerNode(zzfxG(...[1.09,,152,.11,1,1,1,2.19,4,,-10,,.06,1.1,51,.2,.16,.86,.5,.31]));
export const draggingSound2 = pannerFunc(zzfxG(...[0.05,0,50,.1,1.3,,4,9,,,-10,.01,,,,-0.2,,.87,1]));

// export const draggingSound3 = createPannerNode(zzfxG(...[,.15,50,.34,1,1,,.11,-1.9,-0.9,20,3,.18,5,,,.31,1.01,1,.08]));

export const draggingSound4 = pannerFunc(zzfxG(...[0.2,.15,50,.34,.91,.31,,.11,-1.9,-0.9,20,3,.01,7.2,,,.15,1.01,1]));

export const ominousDiscovery1 = createAudioNode(zzfxG(...[,0,146.8324,.3,.3,.9,,.83,10.5,,40,.3,-0.01,,,.1,.2,,.3]));

export const ominousDiscovery2 = createAudioNode(zzfxG(...[3,,87.30706,.08,.41,1.41,1,.83,10.5,,3,.5,-0.01,.1,,.1,.78,,.11,.14]));

export const pickup1 = createAudioNode(zzfxG(...[1.09,,152,.01,.08,1,,2.19,,,,,.05,1.1,51,.2,.02,.86,.04]));

export const scaryNote2 = (vol = 1) => createAudioNode(addGap(zzfxG(...[vol,0,50,.6,.1,1,,.11,-0.1,-0.1,,,.18,,,,.3,1.01,.5,.08]), .8));

export const upyriAttack = createAudioNode(zzfxG(...[3.2,0,276,,2,,,.71,7.5,,,,,.1,-430,.5,.19,.2,.2]));
export const upyriAttack2 = createAudioNode(zzfxG(...[2.4,0,50,.01,.1,1,,.11,-0.1,-0.1,,,.18,,,,.31,.3,.5,.08]));

export const upyriHit = createPannerNode(zzfxG(...[1.65,,57,.01,.09,.08,4,.11,,,,,.15,1.3,,.2,.08,.72,.04]));

const music = (freqs: number[], durs: number[]) => createAudioNode(freqs.flatMap((freq, i) => zzfxG(...[,0,freq,.1,durs[i],.26,2,1.18,,,,,,.2,,,.11,.38,.03])));

export const makeSong = music([65.41	, 82.41, 77.78, 65.41	, 82.41, 77.78, 65.41	, 82.41, 77.78, 61.74, 65.41], [.25, .25, 1, .25, .25, 1,  .25, .25, .25, .25, 2])
