const MAX_EDGE = 1600;
const THUMBNAIL_EDGE = 96;
const JPEG_QUALITY = 0.85;

/** Maximum number of reference images attached to one prompt. */
export const UI_BUILDER_MAX_REFERENCE_IMAGES = 3;

/** A reference image prepared for a prompt: a downscaled JPEG and a small thumbnail, as data URLs. */
export type UiBuilderReferenceImage = { dataUrl: string; thumbnail: string; name: string };

const drawScaled = (bitmap: ImageBitmap, maxEdge: number, quality: number) => {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot process images.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
};

/** Downscales an image file for a vision model and makes a thumbnail for the transcript. */
export const prepareUiBuilderReferenceImage = async (
  file: File,
): Promise<UiBuilderReferenceImage> => {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
  const bitmap = await createImageBitmap(file);
  try {
    return {
      name: file.name || "Pasted image",
      dataUrl: drawScaled(bitmap, MAX_EDGE, JPEG_QUALITY),
      thumbnail: drawScaled(bitmap, THUMBNAIL_EDGE, 0.7),
    };
  } finally {
    bitmap.close();
  }
};
