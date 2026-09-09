import { FormatOption, SupportedOutputFormat } from '../types';

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'png',
    label: 'PNG',
    mime: 'image/png',
    extension: '.png',
    supportsQuality: false,
    description: 'Lossless compression with transparency support',
  },
  {
    format: 'jpeg',
    label: 'JPG / JPEG',
    mime: 'image/jpeg',
    extension: '.jpg',
    supportsQuality: true,
    description: 'Universal photo format with high compression',
  },
  {
    format: 'webp',
    label: 'WEBP',
    mime: 'image/webp',
    extension: '.webp',
    supportsQuality: true,
    description: 'Modern web format with superior compression',
  },
  {
    format: 'avif',
    label: 'AVIF',
    mime: 'image/avif',
    extension: '.avif',
    supportsQuality: true,
    description: 'Next-gen format with extreme compression efficiency',
  },
  {
    format: 'bmp',
    label: 'BMP',
    mime: 'image/bmp',
    extension: '.bmp',
    supportsQuality: false,
    description: 'Standard uncompressed bitmap image format',
  },
  {
    format: 'ico',
    label: 'ICO',
    mime: 'image/x-icon',
    extension: '.ico',
    supportsQuality: false,
    description: 'Icon format used for website favicons and apps',
  },
];

export function getFormatOption(format: SupportedOutputFormat): FormatOption {
  return FORMAT_OPTIONS.find((f) => f.format === format) || FORMAT_OPTIONS[0];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getBaseFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot + 1).toLowerCase();
}

/**
 * Loads an image File into an HTMLImageElement
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. The file may be corrupted or unsupported.'));
    };

    img.src = url;
  });
}

/**
 * Encode raw ImageData into an uncompressed 32-bit BMP ArrayBuffer
 */
function encodeBMP(imageData: ImageData): ArrayBuffer {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // BMP header: 14 bytes, DIB header: 40 bytes (BITMAPINFOHEADER)
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const rowSize = width * 4; // 32-bit BGRA
  const pixelArraySize = rowSize * height;
  const fileSize = fileHeaderSize + dibHeaderSize + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // File Header
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true); // reserved
  view.setUint16(8, 0, true); // reserved
  view.setUint32(10, fileHeaderSize + dibHeaderSize, true); // offset to pixel data

  // DIB Header (BITMAPINFOHEADER)
  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // negative height = top-down bitmap
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 32, true); // 32 bits per pixel
  view.setUint32(30, 0, true); // BI_RGB (no compression)
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // ~72 DPI horizontal
  view.setInt32(42, 2835, true); // ~72 DPI vertical
  view.setUint32(46, 0, true); // palette colors
  view.setUint32(50, 0, true); // important colors

  // Pixel Data (BGRA order)
  let offset = fileHeaderSize + dibHeaderSize;
  for (let i = 0; i < data.length; i += 4) {
    view.setUint8(offset++, data[i + 2]); // Blue
    view.setUint8(offset++, data[i + 1]); // Green
    view.setUint8(offset++, data[i]);     // Red
    view.setUint8(offset++, data[i + 3]); // Alpha
  }

  return buffer;
}

/**
 * Encode raw ImageData into standard Windows Icon (.ICO) format
 */
function encodeICO(imageData: ImageData): ArrayBuffer {
  // ICO supports up to 256x256 dimensions
  const width = Math.min(imageData.width, 256);
  const height = Math.min(imageData.height, 256);

  // Canvas to hold scaled image if needed
  let finalData = imageData;
  if (imageData.width > 256 || imageData.height > 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    // create temp canvas for original
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
    finalData = ctx.getImageData(0, 0, width, height);
  }

  const bmpBuffer = encodeBMP(finalData);
  // ICO file: 6-byte header + 16-byte directory entry + BMP data (without the 14-byte file header)
  const dibData = bmpBuffer.slice(14);
  const dibSize = dibData.byteLength;

  const icoSize = 6 + 16 + dibSize;
  const buffer = new ArrayBuffer(icoSize);
  const view = new DataView(buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // image type: 1 = ICO
  view.setUint16(4, 1, true); // number of images: 1

  // ICONDIRENTRY
  view.setUint8(6, width === 256 ? 0 : width);   // width
  view.setUint8(7, height === 256 ? 0 : height); // height
  view.setUint8(8, 0);  // color palette (0 = no palette)
  view.setUint8(9, 0);  // reserved
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, dibSize, true); // size of image data
  view.setUint32(18, 22, true); // offset of image data (6 + 16 = 22)

  // Copy DIB data
  const uint8View = new Uint8Array(buffer);
  uint8View.set(new Uint8Array(dibData), 22);

  return buffer;
}

export interface ConvertOptions {
  file: File;
  targetFormat: SupportedOutputFormat;
  quality?: number; // 0.1 - 1.0
  resizeMode?: 'none' | 'percent' | 'custom';
  resizePercent?: number;
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface ConvertResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  format: SupportedOutputFormat;
  fileName: string;
}

/**
 * Converts an image file to the desired format with resizing and quality options
 */
export async function convertImage(options: ConvertOptions): Promise<ConvertResult> {
  const {
    file,
    targetFormat,
    quality = 0.92,
    resizeMode = 'none',
    resizePercent = 100,
    customWidth,
    customHeight,
    maintainAspectRatio = true,
  } = options;

  const img = await loadImage(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (resizeMode === 'percent' && resizePercent > 0) {
    const scale = resizePercent / 100;
    targetWidth = Math.max(1, Math.round(origWidth * scale));
    targetHeight = Math.max(1, Math.round(origHeight * scale));
  } else if (resizeMode === 'custom') {
    if (customWidth && customHeight) {
      if (maintainAspectRatio) {
        const scale = Math.min(customWidth / origWidth, customHeight / origHeight);
        targetWidth = Math.max(1, Math.round(origWidth * scale));
        targetHeight = Math.max(1, Math.round(origHeight * scale));
      } else {
        targetWidth = Math.max(1, customWidth);
        targetHeight = Math.max(1, customHeight);
      }
    } else if (customWidth) {
      targetWidth = Math.max(1, customWidth);
      targetHeight = maintainAspectRatio ? Math.max(1, Math.round((origHeight / origWidth) * customWidth)) : origHeight;
    } else if (customHeight) {
      targetHeight = Math.max(1, customHeight);
      targetWidth = maintainAspectRatio ? Math.max(1, Math.round((origWidth / origHeight) * customHeight)) : origWidth;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available in this browser.');
  }

  // Smooth scaling configuration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // For JPEG target format, fill transparent areas with white background
  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const formatConfig = getFormatOption(targetFormat);
  let blob: Blob;

  if (targetFormat === 'bmp') {
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const bmpBuffer = encodeBMP(imageData);
    blob = new Blob([bmpBuffer], { type: 'image/bmp' });
  } else if (targetFormat === 'ico') {
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const icoBuffer = encodeICO(imageData);
    blob = new Blob([icoBuffer], { type: 'image/x-icon' });
  } else {
    // Standard Canvas conversion (PNG, JPEG, WEBP, AVIF)
    const mime = formatConfig.mime;
    const compressionQuality = formatConfig.supportsQuality ? Math.min(Math.max(quality, 0.05), 1) : undefined;

    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            // Fallback for formats not natively supported for saving by browser (e.g. AVIF on older browsers)
            if (targetFormat === 'avif') {
              // Fallback to WEBP
              canvas.toBlob(
                (fallback) => {
                  if (fallback) resolve(fallback);
                  else reject(new Error('Failed to convert image to specified format.'));
                },
                'image/webp',
                compressionQuality
              );
            } else {
              reject(new Error(`Failed to encode image as ${targetFormat.toUpperCase()}`));
            }
          }
        },
        mime,
        compressionQuality
      );
    });
  }

  const baseName = getBaseFileName(file.name);
  const outFileName = `${baseName}${formatConfig.extension}`;
  const outUrl = URL.createObjectURL(blob);

  return {
    blob,
    url: outUrl,
    width: targetWidth,
    height: targetHeight,
    size: blob.size,
    format: targetFormat,
    fileName: outFileName,
  };
}

