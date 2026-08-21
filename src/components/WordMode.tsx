import React, { useState } from 'react';
import { FingerId, HandId, WordPreset, DualHandRecord } from '../types';
import { FINGER_CONFIGS, WORD_PRESETS, ALL_FINGER_IDS } from '../utils/presets';
import { audioEngine } from '../utils/audioEngine';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Bot, 
  Volume2, 
  Copy, 
  Trash2, 
  Sparkles, 
  Check, 
  Send
} from 'lucide-react';

interface WordModeProps {
  language: Language;
  words: DualHandRecord<string>;
  onChangeWords: (newWords: DualHandRecord<string>) => void;
  sentenceHistory: Array<{ word: string; hand: HandId; finger: FingerId; timestamp: number }>;
  onClearSentence: () => void;
  recentTriggeredFinger?: { hand: HandId; finger: FingerId } | null;
}

export const WordMode: React.FC<WordModeProps> = ({
  language,
  words,
  onChangeWords,
  sentenceHistory,
  onClearSentence,
  recentTriggeredFinger,
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);

  const fullSentence = sentenceHistory.map((s) => s.word).join(' ');

  const handleWordChange = (hand: HandId, finger: FingerId, val: string) => {
    const updated: DualHandRecord<string> = {
      ...words,
      [hand]: {
        ...words[hand],
        [finger]: val,
      },
    };
    onChangeWords(updated);
  };

  const handleApplyPreset = (preset: WordPreset) => {
    if (language === 'zh') {
      onChangeWords(preset.wordsZh);
    } else {
      onChangeWords(preset.wordsEn);
    }
  };

  const handleSpeakAll = () => {
    if (!fullSentence) return;
    audioEngine.speakWord(fullSentence);
  };

  const handleCopyText = () => {
    if (!fullSentence) return;
    navigator.clipboard.writeText(fullSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Sentence Builder Typewriter Screen */}
      <div 
        id="sentence-builder-display"
        className="aero-glass-card rounded-3xl p-5 sm:p-6 border border-white/70 shadow-lg flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full water-orb flex items-center justify-center text-sm shadow-sm">
              💬
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-800">
                {t.wordTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.wordSubtitle}
              </p>
            </div>
          </div>

        </div>

        {/* Typewriter Display Screen (Glossy CRT Screen) */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 border-2 border-white/80 shadow-2xl text-cyan-200 min-h-[110px] flex flex-col justify-between overflow-hidden">
          {/* Subtle TV Scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

          {/* Real-time sentence output */}
          <div className="relative z-10 flex-1">
            {sentenceHistory.length === 0 ? (
              <p className="text-sm font-digital text-sky-400/60">
                {t.sentencePlaceholder}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                {sentenceHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-block px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold font-display border shadow-sm animate-in zoom-in-75 duration-150 ${
                      item.hand === 'Left'
                        ? 'bg-sky-400/20 text-sky-200 border-sky-400/50'
                        : 'bg-emerald-400/20 text-emerald-200 border-emerald-400/50'
                    }`}
                  >
                    {item.word}
                  </span>
                ))}
                <span className="w-2.5 h-5 bg-cyan-400 animate-ping inline-block rounded-xs" />
              </div>
            )}
          </div>

          {/* Bottom Screen Bar: Controls */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs mt-2">
            <span className="text-[11px] font-digital text-sky-400">
              WORDS: {sentenceHistory.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeakAll}
                disabled={!fullSentence}
                className="aero-btn-emerald px-3 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.speakAll}</span>
              </button>

              <button
                onClick={handleCopyText}
                disabled={!fullSentence}
                className="aero-btn px-3 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-sky-600" />
                )}
                <span>{copied ? 'Copied' : t.copySentence}</span>
              </button>

              <button
                onClick={onClearSentence}
                disabled={sentenceHistory.length === 0}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title={t.clearSentence}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 8-Word Dual Hand Binding Inputs */}
      <div 
        id="word-bindings-grid"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold font-display text-slate-800">
              {language === 'zh' ? '双手 8 指词汇自定义绑定' : 'Dual-Hand 8-Word Custom Bindings'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {language === 'zh' ? '支持任意中文或地道英语短语' : 'Enter crisp words or phrases'}
          </span>
        </div>

        {/* Left Hand & Right Hand Input Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Hand Words */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-sky-900 flex items-center justify-between">
              <span>{t.leftHandWords}</span>
              <span className="text-[10px] font-digital font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                KEYS: A · S · D · F
              </span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_FINGER_IDS.map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const currentWord = words.Left[fId];
                const isTriggered =
                  recentTriggeredFinger?.hand === 'Left' && recentTriggeredFinger?.finger === fId;

                return (
                  <div
                    key={`left-word-${fId}`}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-150 ${
                      isTriggered
                        ? 'bg-sky-200/90 border-sky-400 scale-105 shadow-md'
                        : 'bg-white/90 border-sky-100 shadow-xs hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-digital text-slate-900 border border-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.keyShortcutLeft}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {language === 'zh' ? config.nameZh : config.name.split(' ')[0]}
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={14}
                      value={currentWord}
                      onChange={(e) => handleWordChange('Left', fId, e.target.value)}
                      className="w-full text-center font-bold text-[10px] sm:text-xs bg-sky-50 text-sky-950 py-1 px-1 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Hand Words */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-emerald-900 flex items-center justify-between">
              <span>{t.rightHandWords}</span>
              <span className="text-[10px] font-digital font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                KEYS: 1 · 2 · 3 · 4
              </span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_FINGER_IDS.map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const currentWord = words.Right[fId];
                const isTriggered =
                  recentTriggeredFinger?.hand === 'Right' && recentTriggeredFinger?.finger === fId;

                return (
                  <div
                    key={`right-word-${fId}`}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-150 ${
                      isTriggered
                        ? 'bg-emerald-200/90 border-emerald-400 scale-105 shadow-md'
                        : 'bg-white/90 border-emerald-100 shadow-xs hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-digital text-slate-900 border border-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.keyShortcutRight}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {language === 'zh' ? config.nameZh : config.name.split(' ')[0]}
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={14}
                      value={currentWord}
                      onChange={(e) => handleWordChange('Right', fId, e.target.value)}
                      className="w-full text-center font-bold text-[10px] sm:text-xs bg-emerald-50 text-emerald-950 py-1 px-1 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Word Presets Bank (Pure Natural English / Chinese) */}
      <div 
        id="word-preset-bank"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold font-display text-slate-800">
            {t.wordPresetsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {WORD_PRESETS.map((preset) => {
            const displayWords = language === 'zh' ? preset.wordsZh : preset.wordsEn;
            const leftWords = Object.values(displayWords.Left).join(' · ');
            const rightWords = Object.values(displayWords.Right).join(' · ');

            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 text-left transition hover:scale-[1.01] cursor-pointer flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {language === 'zh' ? preset.nameZh : preset.nameEn}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-700 font-semibold line-clamp-1">
                    L: {leftWords}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold line-clamp-1 mt-0.5">
                    R: {rightWords}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
