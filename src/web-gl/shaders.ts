// Generated with Shader Minifier 1.3.4 (https://github.com/laurentlb/Shader_Minifier/)
export const aPosition = 'm';
export const fragColor = 'e';
export const uBallPosition = 'v';
export const uBallVelocity = 'f';
export const vColor = 'h';

export const fragment_glsl = `#version 300 es
precision highp float;uniform vec2 v,f;out vec4 e;void main(){float m=length(f)/20.;e=vec4(m,fract((gl_FragCoord.xy-v)/vec2(3840,2160)),1);}`;

export const vertex_glsl = `#version 300 es
layout(location=0) in vec4 m;out vec4 h;void main(){gl_Position=m;}`;

