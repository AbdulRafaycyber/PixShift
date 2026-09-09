import React, { useState } from 'react';
import { SupportedOutputFormat, BatchSettings } from '../types';
import { FORMAT_OPTIONS, getFormatOption } from '../utils/imageConverter';
import {
  Play,
  Download,
  Trash2,
  Sliders,
  Maximize2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';

interface ConversionControlsProps {
  settings: BatchSettings;
  onUpdateSettings: (newSettings: Partial<BatchSettings>) => void;
  onConvertAll: () => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  isConverting: boolean;
  totalCount: number;
  completedCount: number;
  isZipping: boolean;
  zipProgress?: number;
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({
  settings,
  onUpdateSettings,
  onConvertAll,
  onDownloadAllZip,
  onClearAll,
  isConverting,
  totalCount,
  completedCount,
  isZipping,
  zipProgress,
}) => {
  const [showResizePanel, setShowResizePanel] = useState(true);
  const currentFormat = getFormatOption(settings.targetFormat);

  // Resolution presets for quick selection
  const resolutionPresets = [
    { label: 'Full HD', w: 1920, h: 1080 },
    { label: 'HD 720p', w: 1280, h: 720 },
    { label: 'Square (1:1)', w: 1080, h: 1080 },
    { label: 'Web Standard', w: 800, h: 600 },
    { label: 'App Icon', w: 512, h: 512 },
    { label: 'Favicon 64', w: 64, h: 64 },
    { label: 'Favicon 32', w: 32, h: 32 },
  ];

  // Helper text for current resize mode
  let resizeBadgeText = 'Original (100%)';
  if (settings.resizeMode === 'percent') {
    resizeBadgeText = `Scale ${settings.resizePercent}%`;
  } else if (settings.resizeMode === 'custom') {
    if (settings.customWidth && settings.customHeight) {
      resizeBadgeText = `${settings.customWidth}×${settings.customHeight}px`;
    } else if (settings.customWidth) {
      resizeBadgeText = `W: ${settings.customWidth}px`;
    } else if (settings.customHeight) {
      resizeBadgeText = `H: ${settings.customHeight}px`;
    } else {
      resizeBadgeText = 'Custom px';
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800/85 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xl transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Global format, quality & resize toggles */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Format selection */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Convert All to:
            </label>
            <div className="relative">
              <select
                value={settings.targetFormat}
                onChange={(e) =>
                  onUpdateSettings({ targetFormat: e.target.value as SupportedOutputFormat })
                }
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-teal-500/50 hover:border-teal-400 text-teal-700 dark:text-teal-300 font-bold text-sm rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner cursor-pointer transition-colors"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.format} value={opt.format} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {opt.label} ({opt.extension})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quality Slider (for lossy formats) */}
          {currentFormat.supportsQuality && (
            <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 rounded-xl transition-colors">
              <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Quality:</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.quality}
                onChange={(e) => onUpdateSettings({ quality: parseFloat(e.target.value) })}
                className="w-20 sm:w-28 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 w-10 text-right">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
          )}

          {/* Resize Options Toggle Button */}
          <button
            type="button"
            onClick={() => setShowResizePanel(!showResizePanel)}
            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl border transition-all ${
              showResizePanel || settings.resizeMode !== 'none'
                ? 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-sm shadow-teal-500/10'
                : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Resize Image</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                settings.resizeMode !== 'none'
                  ? 'bg-teal-500 text-white dark:text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {resizeBadgeText}
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Convert All Button */}
          <button
            type="button"
            onClick={onConvertAll}
            disabled={isConverting || totalCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
              isConverting
                ? 'bg-teal-600/50 text-white cursor-not-allowed'
                : totalCount === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white dark:text-slate-950 shadow-teal-500/25 active:scale-95'
            }`}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Convert All ({totalCount})</span>
              </>
            )}
          </button>

          {/* Download ZIP Button */}
          <button
            type="button"
            onClick={onDownloadAllZip}
            disabled={completedCount === 0 || isZipping}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
              completedCount > 0 && !isZipping
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 border-slate-300 dark:border-teal-500/40 text-slate-800 dark:text-teal-300 hover:border-slate-400 dark:hover:border-teal-400 shadow-md active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Zipping {zipProgress ? `${zipProgress}%` : ''}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download All ZIP ({completedCount})</span>
              </>
            )}
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={onClearAll}
            disabled={isConverting}
            title="Clear all images"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Image Resize Control Panel */}
      {showResizePanel && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-4 animate-fadeIn">
          {/* Header & Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Image Resize Mode:
              </span>
            </div>

            {/* Mode selection tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => onUpdateSettings({ resizeMode: 'none' })}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  settings.resizeMode === 'none'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Original Size (100%)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ resizeMode: 'percent' })}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  settings.resizeMode === 'percent'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Scale Percentage
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ resizeMode: 'custom' })}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  settings.resizeMode === 'custom'
                    ? 'bg-teal-500 text-white dark:text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Exact Dimensions (WxH)
              </button>
            </div>
          </div>

          {/* Sub-panel: Scale Percentage */}
          {settings.resizeMode === 'percent' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-3 transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Scale:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onUpdateSettings({ resizePercent: pct })}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      settings.resizePercent === pct
                        ? 'bg-teal-500/20 border border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Custom percentage slider & input */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={settings.resizePercent}
                  onChange={(e) =>
                    onUpdateSettings({ resizePercent: parseInt(e.target.value) || 100 })
                  }
                  className="w-24 sm:w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={settings.resizePercent}
                    onChange={(e) =>
                      onUpdateSettings({ resizePercent: parseInt(e.target.value) || 100 })
                    }
                    className="w-12 bg-transparent text-xs text-center text-teal-700 dark:text-teal-300 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-panel: Exact Dimensions */}
          {settings.resizeMode === 'custom' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-3 transition-colors">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Width input */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Width:</label>
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      placeholder="Auto"
                      min="1"
                      max="10000"
                      value={settings.customWidth || ''}
                      onChange={(e) =>
                        onUpdateSettings({
                          customWidth: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-20 bg-transparent text-xs text-teal-700 dark:text-teal-300 font-mono font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">px</span>
                  </div>
                </div>

                {/* Aspect ratio lock toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ maintainAspectRatio: !settings.maintainAspectRatio })
                  }
                  title={
                    settings.maintainAspectRatio
                      ? 'Aspect Ratio Locked (Images won’t distort)'
                      : 'Aspect Ratio Unlocked (Freeform dimensions)'
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    settings.maintainAspectRatio
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {settings.maintainAspectRatio ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Locked Ratio</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Unlocked</span>
                    </>
                  )}
                </button>

                {/* Height input */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Height:</label>
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      placeholder="Auto"
                      min="1"
                      max="10000"
                      value={settings.customHeight || ''}
                      onChange={(e) =>
                        onUpdateSettings({
                          customHeight: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-20 bg-transparent text-xs text-teal-700 dark:text-teal-300 font-mono font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">px</span>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      customWidth: undefined,
                      customHeight: undefined,
                      resizeMode: 'none',
                    })
                  }
                  className="ml-auto flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Quick Dimension Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 mr-1">Presets:</span>
                {resolutionPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        customWidth: preset.w,
                        customHeight: preset.h,
                        resizeMode: 'custom',
                      })
                    }
                    className={`px-2 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                      settings.customWidth === preset.w && settings.customHeight === preset.h
                        ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                        : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {preset.label} ({preset.w}×{preset.h})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress / Status banner */}
      {completedCount > 0 && (
        <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {completedCount} of {totalCount} image{totalCount > 1 ? 's' : ''} ready to download
          </span>
        </div>
      )}
    </div>
  );
};
