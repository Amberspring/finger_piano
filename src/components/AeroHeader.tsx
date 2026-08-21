import React from 'react';
import { AppMode } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Music, MessageSquare, Gift, BookOpen, Volume2, VolumeX, Sparkles, Globe } from 'lucide-react';

interface AeroHeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAudioPlaying?: boolean;
}

export const AeroHeader: React.FC<AeroHeaderProps> = ({
  language,
  onToggleLanguage,
  currentMode,
  onSelectMode,
  isMuted,
  onToggleMute,
  isAudioPlaying,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="w-full mb-6">
      {/* Top Aero Gloss Bar */}
      <div 
        id="aero-main-header"
        className="aero-window rounded-3xl p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/70 shadow-xl"
      >
        {/* Left Branding / Title */}
        <div className="flex items-center gap-3">
          {/* Animated Spinning CD Disc */}
          <div className="relative w-11 h-11 rounded-full cd-disc flex items-center justify-center p-1 shadow-md">
            <div className={`w-4 h-4 rounded-full bg-white/90 border border-sky-400 flex items-center justify-center ${isAudioPlaying ? 'animate-spin' : ''}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-sky-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-digital tracking-tight text-slate-800 flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <nav 
          id="mode-navigation-bar"
          className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-white/40 border border-white/80 backdrop-blur-md shadow-inner"
        >
          <button
            id="nav-piano-mode"
            onClick={() => onSelectMode('piano')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentMode === 'piano'
                ? 'aero-btn text-slate-900 font-bold shadow-md scale-105'
                : 'text-slate-700 hover:bg-white/50 hover:text-sky-700'
            }`}
          >
            <Music className="w-4 h-4 text-sky-600" />
            <span>{t.modePiano}</span>
          </button>

          <button
            id="nav-word-mode"
            onClick={() => onSelectMode('word')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentMode === 'word'
                ? 'aero-btn-emerald text-slate-900 font-bold shadow-md scale-105'
                : 'text-slate-700 hover:bg-white/50 hover:text-emerald-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{t.modeWord}</span>
          </button>

          <button
            id="nav-birthday-mode"
            onClick={() => onSelectMode('birthday')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentMode === 'birthday'
                ? 'aero-btn-pink text-slate-900 font-bold shadow-md scale-105'
                : 'text-slate-700 hover:bg-white/50 hover:text-pink-700'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-600" />
            <span>{t.modeBirthday}</span>
          </button>

          <button
            id="nav-tutorial-mode"
            onClick={() => onSelectMode('tutorial')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentMode === 'tutorial'
                ? 'aero-btn text-slate-900 font-bold shadow-md scale-105'
                : 'text-slate-700 hover:bg-white/50 hover:text-amber-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>{t.modeTutorial}</span>
          </button>
        </nav>

        {/* Right Quick Controls (Language + Sound) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            id="btn-toggle-language"
            onClick={onToggleLanguage}
            title={language === 'zh' ? 'Switch to English' : '切换为中文'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl aero-glass-card hover:brightness-110 text-xs font-bold text-slate-800 border border-white/80 shadow-sm transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === 'zh' ? 'EN / English' : '中文 (ZH)'}</span>
          </button>

          {/* Mute / Unmute Button */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            title={isMuted ? t.unmute : t.mute}
            className="p-2 rounded-xl aero-glass-card hover:brightness-110 text-slate-700 hover:text-sky-700 transition cursor-pointer border border-white/80 shadow-sm"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
