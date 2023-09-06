#version 300 es

//[
precision highp float;
//]
in vec4 vColor;
in vec2 vTexCoord;
in float vDepth;
in vec3 vNormal;
in mat4 vNormalMatrix;
in vec4 positionFromLightPov;

uniform vec2 textureRepeat;
uniform vec4 color;
uniform vec4 emissive;
uniform mediump sampler2DArray uSampler;
uniform mediump sampler2DShadow shadowMap;

out vec4 outColor;

vec3 light_direction = vec3(-1, 2, -1);

float ambientLight = 0.1f;
float maxLit = 0.6f;

vec2 adjacentPixels[5] = vec2[](
  vec2(0, 0),
  vec2(-1, 0),
  vec2(1, 0),
  vec2(0, 1),
  vec2(0, -1)
);

float visibility = 1.0;
float shadowSpread = 800.0;

void main() {
    for (int i = 0; i < 5; i++) {
        vec3 samplePosition = vec3(positionFromLightPov.xy + adjacentPixels[i]/shadowSpread, positionFromLightPov.z - 0.002);
        float hitByLight = texture(shadowMap, samplePosition);
        visibility *= max(hitByLight, 0.87);
    }

    vec3 correctedNormals = normalize(mat3(vNormalMatrix) * vNormal);
    vec3 normalizedLightPosition = normalize(light_direction);
    float litPercent = max(dot(normalizedLightPosition, correctedNormals) * visibility, ambientLight);


    vec3 litColor = length(emissive) > 0.0 ? emissive.rgb : (litPercent * color.rgb);

    vec4 vColor = vec4(litColor.r - 0.1f, litColor.g - 0.1f, litColor.b, color.a);

    if (vDepth < 0.0) {
        outColor = vColor;
    } else {
        outColor = texture(uSampler, vec3(vTexCoord * textureRepeat, vDepth)) * vColor;
    }
}
