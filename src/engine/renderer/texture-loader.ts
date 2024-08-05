import { gl } from '@/engine/renderer/lil-gl';
import { Texture } from '@/engine/renderer/texture';

class TextureLoader {
  textures: Texture[] = [];

  load_(textureSource: TexImageSource, animationFunction?: Function): Texture {
    const texture = new Texture(this.textures.length, textureSource, animationFunction);
    this.textures.push(texture);
    return texture;
  }

  updateAnimatedTextures() {
    this.textures.forEach((texture, index) => {
      if (texture.animationFunction) {
        texture.animationFunction();
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, 512, 512, 1, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
      }
    });
  }

  bindTextures() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture());
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, 512, 512, this.textures.length);

    this.textures.forEach((texture, index) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, 512, 512, 1, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
    });
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  }
}

export const textureLoader = new TextureLoader();
