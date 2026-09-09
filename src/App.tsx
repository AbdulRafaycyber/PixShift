import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { ConversionControls } from './components/ConversionControls';
import { ImageCard } from './components/ImageCard';
import { FeaturesSection } from './components/FeaturesSection';
import { ImageFileItem, BatchSettings, SupportedOutputFormat } from './types';
import { convertImage, getFileExtension, loadImage } from './utils/imageConverter';
import { downloadAllAsZip } from './utils/zipHelper';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function App() {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // default to dark
  });

  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const [batchSettings, setBatchSettings] = useState<BatchSettings>({
    targetFormat: 'png',
    quality: 0.9,
    resizeMode: 'none',
    resizePercent: 100,
    maintainAspectRatio: true,
  });

  // Dark mode effect with localStorage persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle files added
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const newItems: ImageFileItem[] = [];

      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);
        const originalExtension = getFileExtension(file.name);

        // Intelligently choose default target format:
        // If it's a JPG/JPEG, default to PNG (very common: JPG to PNG)
        // If it's already PNG, default to JPEG or WEBP
        let defaultFormat: SupportedOutputFormat = batchSettings.targetFormat;
        if (originalExtension === 'png' && batchSettings.targetFormat === 'png') {
          defaultFormat = 'jpeg';
        } else if ((originalExtension === 'jpg' || originalExtension === 'jpeg') && batchSettings.targetFormat === 'jpeg') {
          defaultFormat = 'png';
        }

        const item: ImageFileItem = {
          id,
          file,
          name: file.name,
          originalExtension,
          originalSize: file.size,
          previewUrl,
          targetFormat: defaultFormat,
          targetQuality: batchSettings.quality,
          resizeMode: batchSettings.resizeMode,
          resizePercent: batchSettings.resizePercent,
          maintainAspectRatio: batchSettings.maintainAspectRatio,
          status: 'idle',
          progress: 0,
        };

        newItems.push(item);

        // Async load image dimensions
        loadImage(file)
          .then((img) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === id
                  ? {
                      ...it,
                      originalWidth: img.naturalWidth || img.width,
                      originalHeight: img.naturalHeight || img.height,
                    }
                  : it
              )
            );
          })
          .catch(() => {
            // Ignore dimension fetch errors for SVGs or unusual formats
          });
      }

      setItems((prev) => [...prev, ...newItems]);
    },
    [batchSettings]
  );

  // Update batch settings
  const handleUpdateBatchSettings = (newSettings: Partial<BatchSettings>) => {
    setBatchSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Also sync targetFormat, quality, and resize settings to all idle items
      if (
        newSettings.targetFormat ||
        newSettings.quality !== undefined ||
        newSettings.resizeMode !== undefined ||
        newSettings.resizePercent !== undefined ||
        newSettings.customWidth !== undefined ||
        newSettings.customHeight !== undefined ||
        newSettings.maintainAspectRatio !== undefined
      ) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.status === 'idle'
              ? {
                  ...item,
                  targetFormat: newSettings.targetFormat || item.targetFormat,
                  targetQuality: newSettings.quality ?? item.targetQuality,
                  resizeMode: newSettings.resizeMode ?? item.resizeMode,
                  resizePercent: newSettings.resizePercent ?? item.resizePercent,
                  customWidth:
                    newSettings.customWidth !== undefined ? newSettings.customWidth : item.customWidth,
                  customHeight:
                    newSettings.customHeight !== undefined ? newSettings.customHeight : item.customHeight,
                  maintainAspectRatio: newSettings.maintainAspectRatio ?? item.maintainAspectRatio,
                }
              : item
          )
        );
      }
      return updated;
    });
  };

  // Update format for individual item
  const handleUpdateItemFormat = (id: string, format: SupportedOutputFormat) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              targetFormat: format,
              status: 'idle', // reset if changed
              convertedBlob: undefined,
              convertedUrl: undefined,
              convertedSize: undefined,
            }
          : item
      )
    );
  };

  // Update resize settings for individual item
  const handleUpdateItemResize = (
    id: string,
    resize: {
      resizeMode: 'none' | 'percent' | 'custom';
      resizePercent: number;
      customWidth?: number;
      customHeight?: number;
      maintainAspectRatio: boolean;
    }
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...resize,
              status: 'idle', // reset status so user can re-convert
              convertedBlob: undefined,
              convertedUrl: undefined,
              convertedSize: undefined,
            }
          : item
      )
    );
  };

  // Convert single item
  const handleConvertSingle = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'converting', errorMessage: undefined } : i))
    );

    try {
      const result = await convertImage({
        file: item.file,
        targetFormat: item.targetFormat,
        quality: item.targetQuality,
        resizeMode: item.resizeMode,
        resizePercent: item.resizePercent,
        customWidth: item.customWidth,
        customHeight: item.customHeight,
        maintainAspectRatio: item.maintainAspectRatio,
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'completed',
                convertedBlob: result.blob,
                convertedUrl: result.url,
                convertedSize: result.size,
                convertedWidth: result.width,
                convertedHeight: result.height,
              }
            : i
        )
      );
    } catch (err: unknown) {
      const error = err as Error;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'error',
                errorMessage: error?.message || 'Failed to convert image.',
              }
            : i
        )
      );
    }
  };

  // Convert all items
  const handleConvertAll = async () => {
    setIsConverting(true);
    const pendingItems = items.filter((i) => i.status !== 'completed');

    for (const item of pendingItems) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' } : i))
      );

      try {
        const result = await convertImage({
          file: item.file,
          targetFormat: item.targetFormat,
          quality: item.targetQuality,
          resizeMode: item.resizeMode,
          resizePercent: item.resizePercent,
          customWidth: item.customWidth,
          customHeight: item.customHeight,
          maintainAspectRatio: item.maintainAspectRatio,
        });

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'completed',
                  convertedBlob: result.blob,
                  convertedUrl: result.url,
                  convertedSize: result.size,
                  convertedWidth: result.width,
                  convertedHeight: result.height,
                }
              : i
          )
        );
      } catch (err: unknown) {
        const error = err as Error;
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error',
                  errorMessage: error?.message || 'Failed to convert.',
                }
            : i
          )
        );
      }
    }

    setIsConverting(false);
  };

  // Download all completed as ZIP
  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(0);
      await downloadAllAsZip(items, 'converted-images.zip', (percent) => {
        setZipProgress(percent);
      });
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
  };

  // Quick Preset Helpers
  const applyPreset = (target: SupportedOutputFormat) => {
    handleUpdateBatchSettings({ targetFormat: target });
  };

  const applyResizePreset = (mode: 'percent' | 'custom', percent = 50, w?: number, h?: number) => {
    if (mode === 'percent') {
      handleUpdateBatchSettings({ resizeMode: 'percent', resizePercent: percent });
    } else {
      handleUpdateBatchSettings({
        resizeMode: 'custom',
        customWidth: w,
        customHeight: h,
        maintainAspectRatio: true,
      });
    }
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Navbar */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Convert Any Image Extension & Resize Dimensions Privately</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Convert Extensions &{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Resize Images
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Convert between <strong className="text-slate-900 dark:text-slate-200">JPG to PNG</strong>, PNG to JPG, WEBP, AVIF, BMP, ICO, and <strong className="text-teal-700 dark:text-teal-300">resize to any dimensions or scale</strong>. 100% in-browser with zero uploads.
          </p>

          {/* Quick Presets */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 font-medium">Quick Presets:</span>
            <button
              onClick={() => applyPreset('png')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.targetFormat === 'png'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              JPG → PNG
            </button>
            <button
              onClick={() => applyPreset('jpeg')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.targetFormat === 'jpeg'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              PNG → JPG
            </button>
            <button
              onClick={() => applyPreset('webp')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.targetFormat === 'webp'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              To WebP
            </button>
            <button
              onClick={() => applyResizePreset('percent', 50)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.resizeMode === 'percent' && batchSettings.resizePercent === 50
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              📐 Resize 50%
            </button>
            <button
              onClick={() => applyResizePreset('custom', 100, 1920, 1080)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.resizeMode === 'custom' && batchSettings.customWidth === 1920
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              📐 1920×1080 (HD)
            </button>
            <button
              onClick={() => applyResizePreset('custom', 100, 800, 600)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.resizeMode === 'custom' && batchSettings.customWidth === 800
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              📐 800×600 (Web)
            </button>
            <button
              onClick={() => applyPreset('ico')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                batchSettings.targetFormat === 'ico'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              Make Favicon (.ICO)
            </button>
          </div>
        </div>

        {/* Global Conversion & Resize Settings Bar (Always Visible) */}
        <div className="mb-6">
          <ConversionControls
            settings={batchSettings}
            onUpdateSettings={handleUpdateBatchSettings}
            onConvertAll={handleConvertAll}
            onDownloadAllZip={handleDownloadAllZip}
            onClearAll={handleClearAll}
            isConverting={isConverting}
            totalCount={items.length}
            completedCount={completedCount}
            isZipping={isZipping}
            zipProgress={zipProgress}
          />
        </div>

        {/* Drop Zone */}
        <div className="mb-8">
          <DropZone onFilesAdded={handleFilesAdded} hasFiles={items.length > 0} />
        </div>

        {/* List of Image Cards */}
        {items.length > 0 && (
          <div className="space-y-4 animate-fadeIn mb-8">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Uploaded Images ({items.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click "Resize" on any card for individual dimensions
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <ImageCard
                  key={item.id}
                  item={item}
                  onUpdateFormat={handleUpdateItemFormat}
                  onUpdateResize={handleUpdateItemResize}
                  onConvertSingle={handleConvertSingle}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Highlight Section */}
        <FeaturesSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 py-8 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">PixShift</span>
            <span>—</span>
            <span>Client-side, zero-server image extension converter & resizer</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Built with speed and privacy</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

