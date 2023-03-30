#version 300 es

precision highp float;

uniform vec2 uBallPosition;
uniform vec2 uBallVelocity;

out vec4 fragColor;

void main()
{
    float red = length(uBallVelocity) / 20.0;
    fragColor = vec4(red, fract((gl_FragCoord.xy - uBallPosition) / vec2(1920 * 2, 1080 * 2)), 1);
}
