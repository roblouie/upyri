import { gl, lilgl } from "@/engine/renderer/lil-gl";
import { Camera } from "@/engine/renderer/camera";
import { Skybox } from '@/engine/skybox';

import { Scene } from '@/engine/renderer/scene';
import { Mesh } from '@/engine/renderer/mesh';
import {
  emissive, lightPovMvp,
  modelviewProjection,
  normalMatrix,
  textureRepeat, u_skybox, u_viewDirectionProjectionInverse
} from '@/engine/shaders/shaders';
import { createOrtho, Object3d } from '@/engine/renderer/object-3d';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

// IMPORTANT! The index of a given buffer in the buffer array must match it's respective data location in the shader.
// This allows us to use the index while looping through buffers to bind the attributes. So setting a buffer
// happens by placing
export const enum AttributeLocation {
  Positions,
  Normals,
  TextureCoords,
  TextureDepth,
  LocalMatrix,
  NormalMatrix = 8,
}

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
const modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, modelviewProjection)!;
const normalMatrixLocation =  gl.getUniformLocation(lilgl.program, normalMatrix)!;
const emissiveLocation = gl.getUniformLocation(lilgl.program, emissive)!;
const textureRepeatLocation = gl.getUniformLocation(lilgl.program, textureRepeat)!;
const skyboxLocation = gl.getUniformLocation(lilgl.skyboxProgram, u_skybox)!;
const viewDirectionProjectionInverseLocation = gl.getUniformLocation(lilgl.skyboxProgram, u_viewDirectionProjectionInverse)!;


const origin = new EnhancedDOMPoint(0, 0, 0);

const lightPovProjection = createOrtho(-105,105,-105,105,-400,400);

const inverseLightDirection = new EnhancedDOMPoint(-0.8, 1.5, -1).normalize_();
const lightPovView = new Object3d();
lightPovView.position_.set(inverseLightDirection);
lightPovView.lookAt(origin);
lightPovView.rotationMatrix.invertSelf();

const lightPovMvpMatrix = lightPovProjection.multiply(lightPovView.rotationMatrix);

const lightPovMvpDepthLocation = gl.getUniformLocation(lilgl.depthProgram, lightPovMvp);
gl.useProgram(lilgl.depthProgram);
gl.uniformMatrix4fv(lightPovMvpDepthLocation, false, lightPovMvpMatrix.toFloat32Array());

const textureSpaceConversion = new DOMMatrix([
  0.5, 0.0, 0.0, 0.0,
  0.0, 0.5, 0.0, 0.0,
  0.0, 0.0, 0.5, 0.0,
  0.5, 0.5, 0.5, 1.0
]);

const textureSpaceMvp = textureSpaceConversion.multiplySelf(lightPovMvpMatrix);
const lightPovMvpRenderLocation = gl.getUniformLocation(lilgl.program, lightPovMvp);
gl.useProgram(lilgl.program);
gl.uniformMatrix4fv(lightPovMvpRenderLocation, false, textureSpaceMvp.toFloat32Array());

const depthTextureSize = new DOMPoint(4096, 4096);
const depthTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, depthTexture);
gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, depthTextureSize.x, depthTextureSize.y);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const depthFramebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);


export function render(camera: Camera, scene: Scene) {
  const viewMatrix = camera.worldMatrix.inverse();
  const viewMatrixCopy = viewMatrix.scale(1, 1, 1);
  const viewProjectionMatrix = camera.projection.multiply(viewMatrix);

  const renderSkybox = (skybox: Skybox) => {
    gl.useProgram(lilgl.skyboxProgram);
    gl.uniform1i(skyboxLocation, 0);
    viewMatrixCopy.m41 = 0;
    viewMatrixCopy.m42 = 0;
    viewMatrixCopy.m43 = 0;
    const inverseViewProjection = camera.projection.multiply(viewMatrixCopy).inverse();
    gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, inverseViewProjection.toFloat32Array());
    gl.bindVertexArray(skybox.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const renderMesh = (mesh: Mesh, projection: DOMMatrix) => {
    // @ts-ignore
    gl.useProgram(lilgl.program);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const modelViewProjectionMatrix = projection.multiply(mesh.worldMatrix);

    gl.uniform4fv(emissiveLocation, mesh.material.emissive);
    gl.vertexAttrib1f(AttributeLocation.TextureDepth, mesh.material.texture?.id ?? -1.0);
    const textureRepeat = [mesh.material.texture?.textureRepeat.x ?? 1, mesh.material.texture?.textureRepeat.y ?? 1];
    gl.uniform2fv(textureRepeatLocation, textureRepeat);

    gl.bindVertexArray(mesh.geometry.vao!);

    // @ts-ignore
    gl.uniformMatrix4fv(normalMatrixLocation, true, mesh.color ? mesh.cachedMatrixData : mesh.worldMatrix.inverse().toFloat32Array());
    gl.uniformMatrix4fv(modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
    if (!mesh.material.isTransparent) {
      gl.uniformMatrix4fv(lightPovMvpRenderLocation, false, textureSpaceMvp.multiply(mesh.worldMatrix).toFloat32Array());
    }
    gl.drawElements(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
  };


  // Render shadow map to depth texture
  gl.useProgram(lilgl.depthProgram);
  // gl.cullFace(gl.FRONT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, depthTextureSize.x, depthTextureSize.y);

  scene.solidMeshes.forEach((mesh, index) => {
    if (index > 0) {
      gl.bindVertexArray(mesh.geometry.vao!);
      gl.uniformMatrix4fv(lightPovMvpDepthLocation, false, lightPovMvpMatrix.multiply(mesh.worldMatrix).toFloat32Array());
      gl.drawElements(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
    }
  });

  // Render solid meshes first
  // gl.activeTexture(gl.TEXTURE0);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.cullFace(gl.BACK);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  scene.solidMeshes.forEach(mesh => renderMesh(mesh, viewProjectionMatrix));

  // Set the depthFunc to less than or equal so the skybox can be drawn at the absolute farthest depth. Without
  // this the skybox will be at the draw distance and so not drawn. After drawing set this back.
  if (scene.skybox) {
    gl.depthFunc(gl.LEQUAL);
    renderSkybox(scene.skybox!);
    gl.depthFunc(gl.LESS);
  }

  // Now render transparent items. For transparent items, stop writing to the depth mask. If we don't do this
  // the transparent portion of a transparent mesh will hide other transparent items. After rendering the
  // transparent items, set the depth mask back to writable.
  gl.depthMask(false);
  scene.transparentMeshes.forEach(mesh => renderMesh(mesh, viewProjectionMatrix));
  gl.depthMask(true);

  // Unbinding the vertex array being used to make sure the last item drawn isn't still bound on the next draw call.
  // In theory this isn't necessary but avoids bugs.
  gl.bindVertexArray(null);
}
