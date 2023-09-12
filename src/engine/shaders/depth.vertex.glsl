#version 300 es

//[
precision highp float;
//]

layout(location=0) in vec4 aPosition;

uniform mat4 lightPovMvp;

void main(){
    gl_Position = lightPovMvp * aPosition;
}
