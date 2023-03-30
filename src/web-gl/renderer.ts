import { uBallPosition, uBallVelocity, fragment_glsl, vertex_glsl } from '@/web-gl/shaders';

const gl = c3d.getContext('webgl2');

const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex_glsl);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment_glsl);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

const vertData = new Float32Array([
  -1, -1,
  1, -1,
  -1,  1,
  -1,  1,
  1, -1,
  1,  1,
]);

const aPositionLoc = 0;

gl.vertexAttrib4f(aPositionLoc, 0, 0, 0, 1);
const ballPositionUniform = gl.getUniformLocation(program, uBallPosition);
const ballVelocityUniform = gl.getUniformLocation(program, uBallVelocity);

const vertBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 8, 0);

gl.enableVertexAttribArray(aPositionLoc);
gl.useProgram(program);

export function renderWebGl(ballLocation: DOMPoint, ballVelocity: DOMPoint) {
  gl.uniform2f(ballPositionUniform, ballLocation.x + gl.canvas.width, ballLocation.y * -1);
  gl.uniform2f(ballVelocityUniform, ballVelocity.x, ballVelocity.y);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
