import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';

export function segmentedWall(segmentWidth: number[], segmentHeight: number, topSegments: number[], bottomSegments: number[], startingX = 0,startingY = 0) {
  let runningSide = 0;
  let runningLeft = 0;
  const depth = 3; // TODO: Add to args

  const result = new MoldableCubeGeometry(segmentWidth[0], topSegments[0], depth, 1, 1, 1, 6, { isTop: true, wallHeight: segmentHeight, runningLeft }).translate_(startingX, segmentHeight - topSegments[0] / 2 + startingY).done_();

  topSegments.forEach((top, index) => {
    const currentWidth = segmentWidth.length === 1 ? segmentWidth[0] : segmentWidth[index];
    // TODO: Horizontal shift the texture coordinates for the individual cubes before merging in, at least for testing purposes
    // This way there's direct control over individual cubes and more experimenting can be done to match up back faces.
    // Possibly move vertical shift here too if doing on a per-cube basis. If we are accessing the per-cube coords anyway for horizontal shift it should
    // actually be easier/shorter to just do it here.
    if (index > 0 && top > 0) {
      result.merge(new MoldableCubeGeometry(currentWidth, top, depth,1,1,1,6,{ isTop: true, wallHeight: segmentHeight, runningLeft}).translate_(startingX + runningSide + (currentWidth / 2), segmentHeight - top / 2 + startingY).done_());
    }

    if (bottomSegments[index] > 0) {
      result.merge(new MoldableCubeGeometry(currentWidth, bottomSegments[index], depth, 1, 1, 1, 6, { wallHeight: segmentHeight, isTop: false, runningLeft }).translate_(startingX + runningSide + (currentWidth / 2), bottomSegments[index] / 2 + startingY).done_());
    }
    runningSide+= (index === 0 ? currentWidth / 2 : currentWidth);
    runningLeft += currentWidth;
  });

  const textureCoords = result.getAttribute_(AttributeLocation.TextureCoords).data;
  console.log(textureCoords);
  // textureCoords.set([0,0.1, 0.1,0.1, 0,0, 0.1,0], 31);
  // result.setAttribute_(AttributeLocation.TextureCoords, textureCoords, 2);


  return result.computeNormals().done_();
}
