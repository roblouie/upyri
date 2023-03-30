#version 300 es

layout(location=0) in vec4 aPosition;

out vec4 vColor;

void main()
{
    gl_Position = aPosition;
}
