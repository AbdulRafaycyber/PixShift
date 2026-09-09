import React, { useState } from 'react';
import { ImageFileItem, SupportedOutputFormat } from '../types';
import { FORMAT_OPTIONS, formatFileSize, getFormatOption } from '../utils/imageConverter';
import {
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Maximize2,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';
import { saveAs } from 'file-saver';

interface ImageCardProps {
  item: ImageFileItem;
  onUpdateFormat: (id: string, format: SupportedOutputFormat) => void;
  onUpdateResize: (
    id: string,
    resize: {
      resizeMode: 'none' | 'percent' | 'custom';
      resizePercent: number;
      customWidth?: number;
      customHeight?: number;
      maintainAspectRatio: boolean;
    }
  ) => void;
  onConvertSingle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onUpdateFormat,
  onUpdateResize,
  onConvertSingle,
  onRemove,
}) => {
  const [showResize, setShowResize] = useState(false);
  const targetOption = getFormatOption(item.targetFormat);

  const handleDownload = () => {
    if (item.convertedBlob) {
      const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const filename = `${baseName}${targetOption.extension}`;
      saveAs(item.convertedBlob, filename);
    }
  };

  // Calculate projected dimensions
  const origW = item.originalWidth || 0;
  const origH = item.originalHeight || 0;
  let targetW = origW;
  let targetH = origH;

  if (origW > 0 && origH > 0) {
    if (item.resizeMode === 'percent') {
      const scale = item.resizePercent / 100;
      targetW = Math.max(1, Math.round(origW * scale));
      targetH = Math.max(1, Math.round(origH * scale));
    } else if (item.resizeMode === 'custom') {
      if (item.customWidth && item.customHeight) {
        if (item.maintainAspectRatio) {
          const scale = Math.min(item.customWidth / origW, item.customHeight / origH);
          targetW = Math.max(1, Math.round(origW * scale));
          targetH = Math.max(1, Math.round(origH * scale));
        } else {
          targetW = item.customWidth;
          targetH = item.customHeight;
        }
      } else if (item.customWidth) {
        targetW = item.customWidth;
        targetH = item.maintainAspectRatio
          ? Math.max(1, Math.round((origH / origW) * item.customWidth))
          : origH;
      } else if (item.customHeight) {
        targetH = item.customHeight;
        targetW = item.maintainAspectRatio
          ? Math.max(1, Math.round((origW / origH) * item.customHeight))
          : origW;
      }
    }
  }

  // Handle custom width change with aspect ratio auto-update
  const handleWidthChange = (valStr: string) => {
    const val = valStr ? parseInt(valStr) : undefined;
    let newH = item.customHeight;

    if (val && origW > 0 && origH > 0 && item.maintainAspectRatio) {
      newH = Math.max(1, Math.round((origH / origW) * val));
    }

    onUpdateResize(item.id, {
      resizeMode: 'custom',
      resizePercent: item.resizePercent,
      customWidth: val,
      customHeight: newH,
      maintainAspectRatio: item.maintainAspectRatio,
    });
  };

  // Handle custom height change with aspect ratio auto-update
  const handleHeightChange = (valStr: string) => {
    const val = valStr ? parseInt(valStr) : undefined;
    let newW = item.customWidth;

    if (val && origW > 0 && origH > 0 && item.maintainAspectRatio) {
      newW = Math.max(1, Math.round((origW / origH) * val));
    }

    onUpdateResize(item.id, {
      resizeMode: 'custom',
      resizePercent: item.resizePercent,
      customWidth: newW,
      customHeight: val,
      maintainAspectRatio: item.maintainAspectRatio,
    });
  };

  // Calculate size difference
  let sizeDifferenceBadge = null;
  if (item.status === 'completed' && item.convertedSize !== undefined) {
    const diff = item.convertedSize - item.originalSize;
    const diffPercent = Math.round(Math.abs(diff / item.originalSize) * 100);

    if (diff < 0) {
      sizeDifferenceBadge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <TrendingDown className="w-3 h-3" /> -{diffPercent}%
        </span>
      );
    } else if (diff > 0) {
      sizeDifferenceBadge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
          <TrendingUp className="w-3 h-3" /> +{diffPercent}%
        </span>
      );
    } else {
      sizeDifferenceBadge = (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300">
          0%
        </span>
      );
    }
  }

  const isResized = item.resizeMode !== 'none';

  return (
    <div className="group relative bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-4 transition-all duration-200 shadow-sm dark:shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Thumbnail and info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Image Thumbnail */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center group-hover:border-teal-500/40 transition-colors">
            <img
              src={item.convertedUrl || item.previewUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.status === 'completed' && (
              <div className="absolute top-1 right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate" title={item.name}>
              {item.name}
            </h4>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono bg-slate-100 dark:bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 uppercase font-semibold">
                {item.originalExtension}
              </span>
              <span>•</span>
              <span>{formatFileSize(item.originalSize)}</span>
              {origW > 0 && origH > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {origW}×{origH}
                  </span>
                </>
              )}

              {/* Tag showing custom resize active */}
              {isResized && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    <Maximize2 className="w-2.5 h-2.5" />
                    {item.resizeMode === 'percent' ? `${item.resizePercent}%` : `${targetW}×${targetH}`}
                  </span>
                </>
              )}
            </div>

            {/* If completed, show converted metrics */}
            {item.status === 'completed' && item.convertedSize !== undefined && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  {formatFileSize(item.convertedSize)}
                </span>
                {item.convertedWidth && item.convertedHeight && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({item.convertedWidth}×{item.convertedHeight})
                  </span>
                )}
                {sizeDifferenceBadge}
              </div>
            )}

            {/* If error */}
            {item.status === 'error' && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-500 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.errorMessage || 'Conversion failed'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Target Format & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700/60">
          {/* Target Format selector */}
          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden md:block" />
            <div className="relative">
              <select
                value={item.targetFormat}
                onChange={(e) => onUpdateFormat(item.id, e.target.value as SupportedOutputFormat)}
                disabled={item.status === 'converting'}
                className="bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 hover:border-teal-500/60 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.format} value={opt.format} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    to {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Per-image Resize button */}
          <button
            type="button"
            onClick={() => setShowResize(!showResize)}
            title="Resize options for this image"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showResize || isResized
                ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Resize</span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {item.status === 'completed' ? (
              <button
                onClick={handleDownload}
                title="Download this file"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            ) : item.status === 'converting' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Processing</span>
              </div>
            ) : (
              <button
                onClick={() => onConvertSingle(item.id)}
                title="Convert this image"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert</span>
              </button>
            )}

            {/* Remove */}
            <button
              onClick={() => onRemove(item.id)}
              disabled={item.status === 'converting'}
              title="Remove file"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Per-Image Resize Panel */}
      {showResize && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 animate-fadeIn space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <Maximize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Resize this image</span>
              {origW > 0 && origH > 0 && (
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  (Original: {origW}×{origH}px)
                </span>
              )}
            </div>

            {/* Target output preview */}
            {origW > 0 && origH > 0 && (
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                Target: {targetW}×{targetH}px
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode selection */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() =>
                  onUpdateResize(item.id, {
                    resizeMode: 'none',
                    resizePercent: 100,
                    customWidth: undefined,
                    customHeight: undefined,
                    maintainAspectRatio: item.maintainAspectRatio,
                  })
                }
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  item.resizeMode === 'none'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                100% (Original)
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateResize(item.id, {
                    resizeMode: 'percent',
                    resizePercent: item.resizePercent || 50,
                    customWidth: undefined,
                    customHeight: undefined,
                    maintainAspectRatio: item.maintainAspectRatio,
                  })
                }
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  item.resizeMode === 'percent'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Scale %
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateResize(item.id, {
                    resizeMode: 'custom',
                    resizePercent: item.resizePercent,
                    customWidth: item.customWidth || targetW,
                    customHeight: item.customHeight || targetH,
                    maintainAspectRatio: item.maintainAspectRatio,
                  })
                }
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  item.resizeMode === 'custom'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Custom W×H
              </button>
            </div>

            {/* Percentage options */}
            {item.resizeMode === 'percent' && (
              <div className="flex items-center gap-1.5">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() =>
                      onUpdateResize(item.id, {
                        resizeMode: 'percent',
                        resizePercent: pct,
                        maintainAspectRatio: item.maintainAspectRatio,
                      })
                    }
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      item.resizePercent === pct
                        ? 'bg-teal-500/20 border border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {/* Custom dimensions */}
            {item.resizeMode === 'custom' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-[11px] text-slate-500 mr-1">W:</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Width"
                    value={item.customWidth || ''}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-16 bg-transparent text-xs text-teal-700 dark:text-teal-300 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">px</span>
                </div>

                {/* Aspect ratio lock */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateResize(item.id, {
                      resizeMode: 'custom',
                      resizePercent: item.resizePercent,
                      customWidth: item.customWidth,
                      customHeight: item.customHeight,
                      maintainAspectRatio: !item.maintainAspectRatio,
                    })
                  }
                  title={item.maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  {item.maintainAspectRatio ? (
                    <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-[11px] text-slate-500 mr-1">H:</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Height"
                    value={item.customHeight || ''}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-16 bg-transparent text-xs text-teal-700 dark:text-teal-300 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">px</span>
                </div>
              </div>
            )}

            {/* Reset */}
            {isResized && (
              <button
                type="button"
                onClick={() =>
                  onUpdateResize(item.id, {
                    resizeMode: 'none',
                    resizePercent: 100,
                    customWidth: undefined,
                    customHeight: undefined,
                    maintainAspectRatio: true,
                  })
                }
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
