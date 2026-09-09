import React from 'react';
import { ShieldCheck, Zap, Layers, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: '100% Client-Side Privacy',
      description:
        'Your photos never touch any external server. All format conversions happen directly in your browser with zero latency and full privacy.',
      tag: 'Zero Uploads',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      title: 'Lightning-Fast Speed',
      description:
        'Powered by modern HTML5 Canvas, OffscreenCanvas, and hardware-accelerated Web APIs for instantaneous processing.',
      tag: 'Instant',
    },
    {
      icon: <Layers className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: 'Batch & Bulk ZIP Export',
      description:
        'Upload dozens of photos simultaneously. Convert them with a single click and download everything packaged in a clean .ZIP archive.',
      tag: 'Batch Ready',
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      title: 'Universal Format Support',
      description:
        'Seamlessly convert between JPG, PNG, WEBP, AVIF, BMP, and ICO. Create website favicons or compress photos for web usage.',
      tag: '6+ Formats',
    },
    {
      icon: <Sliders className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: 'Compression & Quality',
      description:
        'Fine-tune output file size and visual fidelity with precision quality sliders for JPEG, WEBP, and AVIF formats.',
      tag: 'Customizable',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
      title: 'Dimension Resizing',
      description:
        'Easily scale images to 25%, 50%, 75%, 200% or specify exact pixel dimensions while maintaining original aspect ratio.',
      tag: 'Smart Scaling',
    },
  ];

  return (
    <section className="mt-20 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 transition-colors">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Why use <span className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">PixShift</span>?
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Professional-grade image processing without subscriptions, watermarks, file limits, or privacy concerns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="group relative bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500/30 rounded-2xl p-6 transition-all duration-300 shadow-sm dark:shadow-md hover:shadow-xl hover:shadow-teal-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/50">
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
