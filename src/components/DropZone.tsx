import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Plus } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  hasFiles: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, hasFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler to support pasting screenshots directly (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const files: File[] = [];

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        onFilesAdded(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesAdded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|bmp|gif|svg|ico)$/i.test(file.name)
      );
      if (files.length > 0) {
        onFilesAdded(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesAdded(files);
      e.target.value = '';
    }
  };

  const supportedFormats = ['JPG', 'PNG', 'WEBP', 'AVIF', 'BMP', 'GIF', 'SVG', 'ICO'];

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif,.svg,.ico"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
          ${
            isDragOver
              ? 'border-teal-500 bg-teal-500/10 scale-[1.01] shadow-2xl shadow-teal-500/20'
              : hasFiles
              ? 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500/60 bg-white/80 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 py-8 shadow-sm'
              : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500/60 bg-white/90 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-16 sm:py-20 shadow-sm'
          }`}
      >
        {/* Background glow gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center text-center px-6">
          <div
            className={`rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-teal-500/10
            ${hasFiles ? 'w-14 h-14 mb-3' : 'w-20 h-20 mb-6'}`}
          >
            {hasFiles ? (
              <Plus className="w-7 h-7 text-teal-600 dark:text-teal-300" />
            ) : (
              <UploadCloud className="w-10 h-10 text-teal-600 dark:text-teal-300 animate-bounce" />
            )}
          </div>

          <h2 className={`font-bold tracking-tight text-slate-900 dark:text-white ${hasFiles ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
            {hasFiles ? 'Add more images' : 'Drag & drop images to convert or resize'}
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
            or <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline">browse from your computer</span> to convert formats, resize dimensions, and compress. Press{' '}
            <kbd className="px-2 py-0.5 text-xs font-mono rounded-md bg-slate-100 dark:bg-slate-700/70 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              Ctrl+V
            </kbd>{' '}
            to paste.
          </p>

          {!hasFiles && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-2 max-w-lg">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Supported:
              </span>
              {supportedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shadow-sm"
                >
                  {fmt}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
