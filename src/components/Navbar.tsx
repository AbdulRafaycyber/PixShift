import React from 'react';
import { RefreshCw, ShieldCheck, Sparkles, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950">
            <RefreshCw className="w-5 h-5 font-bold animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-300 dark:via-emerald-300 dark:to-cyan-400 bg-clip-text text-transparent">
                PixShift
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300">
                <Sparkles className="w-3 h-3" /> Pro Converter
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Lightning Fast Image Converter & Resizer</p>
          </div>
        </div>

        {/* Right side badges & actions */}
        <div className="flex items-center space-x-3">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% In-Browser • Zero Uploads</span>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark and light mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
