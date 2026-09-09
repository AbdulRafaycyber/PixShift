import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageFileItem } from '../types';

export async function downloadAllAsZip(
  items: ImageFileItem[],
  zipFilename = 'converted-images.zip',
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const convertedItems = items.filter((item) => item.status === 'completed' && item.convertedBlob);

  if (convertedItems.length === 0) {
    throw new Error('No converted images available to download.');
  }

  // Handle duplicate filenames
  const nameCounts: Record<string, number> = {};

  convertedItems.forEach((item) => {
    let name = item.name;
    const dotIndex = name.lastIndexOf('.');
    const base = dotIndex !== -1 ? name.substring(0, dotIndex) : name;
    const ext = item.targetFormat === 'jpeg' ? '.jpg' : `.${item.targetFormat}`;

    let finalName = `${base}${ext}`;
    if (nameCounts[finalName]) {
      nameCounts[finalName]++;
      finalName = `${base}_${nameCounts[finalName]}${ext}`;
    } else {
      nameCounts[finalName] = 1;
    }

    if (item.convertedBlob) {
      zip.file(finalName, item.convertedBlob);
    }
  });

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  saveAs(content, zipFilename);
}

