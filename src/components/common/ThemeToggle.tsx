import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon-button' | 'pill' | 'switch';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon-button',
  className = '',
  showLabel = false
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        id="theme-toggle-pill-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to switch.`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all select-none ${
          isDark
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 shadow-sm'
            : 'bg-white border-zinc-300 text-zinc-800 hover:text-black hover:border-zinc-400 shadow-sm'
        } ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 rotate-90 scale-100" />
          )}
        </div>
        <span className="text-xs font-bold font-mono">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        {showLabel && (
          <span className="text-xs font-bold text-zinc-400">
            {isDark ? 'Dark Theme' : 'Light Theme'}
          </span>
        )}
        <button
          type="button"
          id="theme-toggle-switch-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
            isDark
              ? 'bg-zinc-900 border-zinc-700'
              : 'bg-zinc-200 border-zinc-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 shadow-md ${
              isDark
                ? 'translate-x-5.5 bg-zinc-800 text-amber-400'
                : 'translate-x-0 bg-white text-amber-500'
            }`}
          >
            {isDark ? (
              <Moon className="w-3 h-3" />
            ) : (
              <Sun className="w-3 h-3" />
            )}
          </div>
        </button>
      </div>
    );
  }

  // Default 'icon-button'
  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light Mode (Clear Day)' : 'Dark Mode (Obsidian)'}`}
      className={`relative p-2 rounded-2xl border transition-all duration-200 group flex items-center justify-center ${
        isDark
          ? 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white shadow-sm'
          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold ml-2">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
