// Generated with Shader Minifier 1.3.4 (https://github.com/laurentlb/Shader_Minifier/)
export const aCoords = 'B';
export const aDepth = 'L';
export const aNormal = 'J';
export const aPosition = 'm';
export const aTexCoord = 'K';
export const color = 's';
export const emissive = 't';
export const fragDepth = 'v';
export const lightPovMvp = 'f';
export const modelviewProjection = 'M';
export const normalMatrix = 'N';
export const outColor = 'g';
export const positionFromLightPov = 'u';
export const shadowMap = 'd';
export const textureRepeat = 'h';
export const uSampler = 'z';
export const u_skybox = 'H';
export const u_viewDirectionProjectionInverse = 'G';
export const vColor = 'e';
export const vDepth = 'n';
export const vNormal = 'o';
export const vNormalMatrix = 'l';
export const vTexCoord = 'i';
export const v_position = 'E';

export const depth_fragment_glsl = `#version 300 es
precision highp float;
out float v;void main(){v=gl_FragCoord.z;}`;

export const depth_vertex_glsl = `#version 300 es
precision highp float;
layout(location=0) in vec4 m;uniform mat4 f;void main(){gl_Position=f*m;}`;

export const fragment_glsl = `#version 300 es
precision highp float;
in vec4 e;in vec2 i;in float n;in vec3 o;in mat4 l;in vec4 u;uniform vec2 h;uniform vec4 s,t;uniform mediump sampler2DArray z;uniform mediump sampler2DShadow d;out vec4 g;vec3 w=vec3(-1,2,-1);float A=.2f,C=.6f;vec2 D[5]=vec2[](vec2(0),vec2(-1,0),vec2(1,0),vec2(0,1),vec2(0,-1));float F=1.,I=4200.;void main(){for(int v=0;v<5;v++){vec3 m=vec3(u.xy+D[v]/I,u.z-.001);float f=texture(d,m);F*=max(f,.87);}vec3 v=normalize(mat3(l)*o),f=normalize(w);float m=max(dot(f,v)*F,A);vec3 e=length(t)>0.?t.xyz:m*s.xyz;vec4 C=vec4(e.xyz,s.w);g=n<0.?C:texture(z,vec3(i*h,n))*C;}`;

export const skybox_fragment_glsl = `#version 300 es
precision highp float;
uniform samplerCube H;uniform mat4 G;in vec4 E;out vec4 g;void main(){vec4 v=G*E;g=texture(H,v.xyz);}`;

export const skybox_vertex_glsl = `#version 300 es
layout(location=0) in vec4 B;out vec4 E;void main(){E=B;gl_Position=B;gl_Position.z=1.;}`;

export const vertex_glsl = `#version 300 es
layout(location=0) in vec3 B;layout(location=1) in vec3 J;layout(location=2) in vec2 K;layout(location=3) in float L;uniform mat4 M,N,f;out vec2 i;out float n;out vec3 o;out mat4 l;out vec4 u;void main(){vec4 v=vec4(B,1);gl_Position=M*v;i=K;n=L;o=J;l=N;u=f*v;}`;

