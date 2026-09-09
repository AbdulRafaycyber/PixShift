export type SupportedOutputFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp' | 'ico';

export interface FormatOption {
  format: SupportedOutputFormat;
  label: string;
  mime: string;
  extension: string;
  supportsQuality: boolean;
  description: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalExtension: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  previewUrl: string;
  targetFormat: SupportedOutputFormat;
  targetQuality: number; // 0.1 - 1.0
  resizeMode: 'none' | 'percent' | 'custom';
  resizePercent: number;
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio: boolean;
  status: 'idle' | 'converting' | 'completed' | 'error';
  progress: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedWidth?: number;
  convertedHeight?: number;
  errorMessage?: string;
}

export interface BatchSettings {
  targetFormat: SupportedOutputFormat;
  quality: number;
  resizeMode: 'none' | 'percent' | 'custom';
  resizePercent: number;
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio: boolean;
}

