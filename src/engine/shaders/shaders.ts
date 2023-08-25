// Generated with Shader Minifier 1.3.4 (https://github.com/laurentlb/Shader_Minifier/)
export const aCoords = 'd';
export const aDepth = 'D';
export const aNormal = 'C';
export const aPerInstanceMatrix = 'z';
export const aPerInstanceNormalMatrix = 'L';
export const aTexCoord = 'A';
export const color = 'e';
export const emissive = 't';
export const modelviewProjection = 'G';
export const normalMatrix = 'F';
export const outColor = 'o';
export const textureRepeat = 'f';
export const uSampler = 'h';
export const u_skybox = 'J';
export const u_viewDirectionProjectionInverse = 'I';
export const vColor = 'v';
export const vDepth = 'i';
export const vNormal = 'm';
export const vNormalMatrix = 'n';
export const vTexCoord = 'l';
export const v_position = 'H';
export const viewProjection = 'K';

export const fragment_glsl = `#version 300 es
precision highp float;
in vec4 v;in vec2 l;in float i;in vec3 m;in mat4 n;uniform vec2 f;uniform vec4 e,t;uniform mediump sampler2DArray h;out vec4 o;vec3 s=vec3(-1,2,1);void main(){vec3 v=normalize(mat3(n)*m),z=normalize(s);float A=max(dot(z,v),0.);vec3 d=length(t)>0.?t.xyz:e.xyz*.4f+A*e.xyz*.8f;vec4 C=vec4(d.x-.1f,d.y-.1f,d.z,e.w);o=i<0.?C:texture(h,vec3(l*f,i))*C;}`;

export const skybox_fragment_glsl = `#version 300 es
precision highp float;
uniform samplerCube J;uniform mat4 I;in vec4 H;out vec4 o;void main(){vec4 v=I*H;o=texture(J,v.xyz);}`;

export const skybox_vertex_glsl = `#version 300 es
layout(location=0) in vec4 d;out vec4 H;void main(){H=d;gl_Position=d;gl_Position.z=1.;}`;

export const vertex_glsl = `#version 300 es
layout(location=0) in vec3 d;layout(location=1) in vec3 C;layout(location=2) in vec2 A;layout(location=3) in float D;uniform mat4 G,F;out vec2 l;out float i;out vec3 m;out mat4 n;void main(){vec4 v=vec4(d,1);gl_Position=G*v;l=A;i=D;m=C;n=F;}`;
