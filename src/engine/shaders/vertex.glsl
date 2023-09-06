#version 300 es

layout(location = 0) in vec3 aCoords;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in float aDepth;

uniform mat4 modelviewProjection;
uniform mat4 normalMatrix;
uniform mat4 lightPovMvp;

out vec2 vTexCoord;
out float vDepth;
out vec3 vNormal;
out mat4 vNormalMatrix;
out vec4 positionFromLightPov;

void main() {
    vec4 coords = vec4(aCoords, 1.0);
    gl_Position = modelviewProjection * coords;

    vTexCoord = aTexCoord;
    vDepth = aDepth;
    vNormal = aNormal;
    vNormalMatrix = normalMatrix;
    positionFromLightPov = lightPovMvp * coords;
}
