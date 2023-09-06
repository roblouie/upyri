// Generated with Shader Minifier 1.3.4 (https://github.com/laurentlb/Shader_Minifier/)
export const aCoords = 'C';
export const aDepth = 'K';
export const aNormal = 'M';
export const aTexCoord = 'L';
export const color = 'h';
export const emissive = 't';
export const modelviewProjection = 'J';
export const normalMatrix = 'I';
export const outColor = 'n';
export const textureRepeat = 'e';
export const uSampler = 's';
export const u_skybox = 'd';
export const u_viewDirectionProjectionInverse = 'A';
export const vColor = 'v';
export const vDepth = 'm';
export const vNormal = 'f';
export const vNormalMatrix = 'l';
export const vTexCoord = 'i';
export const v_position = 'D';

export const fragment_glsl = `#version 300 es
precision highp float;
in vec4 v;in vec2 i;in float m;in vec3 f;in mat4 l;uniform vec2 e;uniform vec4 h,t;uniform mediump sampler2DArray s;out vec4 n;vec3 z=vec3(-1,2,-1);void main(){vec3 v=normalize(mat3(l)*f),d=normalize(z);float A=max(dot(d,v),0.);vec3 C=length(t)>0.?t.xyz:h.xyz*.4f+A*h.xyz*.8f;vec4 D=vec4(C.x-.1f,C.y-.1f,C.z,h.w);n=m<0.?D:texture(s,vec3(i*e,m))*D;}`;

export const skybox_fragment_glsl = `#version 300 es
precision highp float;
uniform samplerCube d;uniform mat4 A;in vec4 D;out vec4 n;void main(){vec4 v=A*D;n=texture(d,v.xyz);}`;

export const skybox_vertex_glsl = `#version 300 es
layout(location=0) in vec4 C;out vec4 D;void main(){D=C;gl_Position=C;gl_Position.z=1.;}`;

export const vertex_glsl = `#version 300 es
layout(location=0) in vec3 C;layout(location=1) in vec3 M;layout(location=2) in vec2 L;layout(location=3) in float K;uniform mat4 J,I;out vec2 i;out float m;out vec3 f;out mat4 l;void main(){vec4 v=vec4(C,1);gl_Position=J*v;i=L;m=K;f=M;l=I;}`;

