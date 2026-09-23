export interface CapturedFrame {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  timestamp: number;
}

/**
 * Extracts a high-quality JPEG frame from an HTML5 video source at a specific timestamp
 * using an off-screen HTMLCanvasElement.
 */
export async function extractFrameFromVideo(
  videoSource: string | File,
  timestampSeconds: number = 1
): Promise<CapturedFrame> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let objectUrl = '';
    if (typeof videoSource === 'string') {
      video.src = videoSource;
    } else {
      objectUrl = URL.createObjectURL(videoSource);
      video.src = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      video.remove();
    };

    video.onloadedmetadata = () => {
      const safeTime = Math.min(
        Math.max(0.1, timestampSeconds),
        Math.max(0.1, video.duration - 0.2)
      );
      video.currentTime = safeTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          cleanup();
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve({
                dataUrl,
                blob,
                width,
                height,
                timestamp: video.currentTime,
              });
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/jpeg',
          0.88
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (e) => {
      cleanup();
      reject(new Error(`Failed to load video file: ${video.error?.message || 'Unknown error'}`));
    };
  });
}

/**
 * Generates an array of evenly spaced candidate thumbnails from a video file.
 */
export async function generateThumbnailStrip(
  videoFile: File,
  count: number = 5
): Promise<CapturedFrame[]> {
  const metadata = await getVideoMetadata(videoFile);
  const duration = metadata.duration || 10;
  const frames: CapturedFrame[] = [];

  for (let i = 0; i < count; i++) {
    // Pick timestamps from 10% to 90%
    const ratio = (i + 1) / (count + 1);
    const targetTime = duration * ratio;
    try {
      const frame = await extractFrameFromVideo(videoFile, targetTime);
      frames.push(frame);
    } catch (e) {
      console.warn(`Could not extract frame at ${targetTime}s`, e);
    }
  }

  return frames;
}

export function getVideoMetadata(
  videoSource: string | File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    let objectUrl = '';

    if (typeof videoSource === 'string') {
      video.src = videoSource;
    } else {
      objectUrl = URL.createObjectURL(videoSource);
      video.src = objectUrl;
    }

    video.onloadedmetadata = () => {
      const info = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      };
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.remove();
      resolve(info);
    };

    video.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.remove();
      reject(new Error('Could not read video metadata'));
    };
  });
}
