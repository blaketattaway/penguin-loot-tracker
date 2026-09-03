/** Long edge of the generated thumbnail, in CSS pixels of the largest grid tile. */
const THUMBNAIL_MAX_EDGE = 640;

/** JPEG quality for thumbnails — visually clean at grid size, a fraction of the bytes. */
const THUMBNAIL_QUALITY = 0.72;

export interface MeasuredPhoto {
  width: number;
  height: number;
  /** Null when the browser couldn't decode the file; the original still uploads. */
  thumbnail: Blob | null;
}

/**
 * Measures a photo and renders a downscaled copy of it, in the browser.
 *
 * The alternative was resizing server-side, which would have meant adding an
 * imaging library to the API for the sake of one screen. The browser already
 * has a decoder and a canvas, the officer's machine is idle while they pick
 * files, and it keeps a phone-sized original from being what the grid loads
 * twelve times over.
 */
export const measureAndThumbnail = (file: File): Promise<MeasuredPhoto> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    const fail = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, thumbnail: null });
    };

    image.onerror = fail;

    image.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = image;
      const longEdge = Math.max(width, height);

      // Already small enough: a "thumbnail" would just be a second copy.
      if (longEdge <= THUMBNAIL_MAX_EDGE) {
        URL.revokeObjectURL(url);
        resolve({ width, height, thumbnail: null });
        return;
      }

      const scale = THUMBNAIL_MAX_EDGE / longEdge;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const context = canvas.getContext("2d");
      if (!context) {
        fail();
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve({ width, height, thumbnail: blob });
        },
        "image/jpeg",
        THUMBNAIL_QUALITY
      );
    };

    image.src = url;
  });
