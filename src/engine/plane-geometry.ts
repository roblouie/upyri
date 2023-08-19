import { MoldableCubeGeometry } from "@/engine/moldable-cube-geometry";

export class PlaneGeometry extends MoldableCubeGeometry {

  constructor(width_ = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1, heightmap?: number[]) {
    super({ fixedTextureSize: 6, width_, depth, widthSegments: subdivisionsWidth, depthSegments: subdivisionsDepth, sidesToDraw: 1 });

    if (heightmap) {
      this
        .modifyEachVertex((vertex, index) => {
          vertex.y = heightmap[index];
        })
        .computeNormals()
        .done_();
    }
  }
}
