import React, { useState, useEffect } from 'react';
import { BirthdayCardData, FingerId, HandId, DualHandRecord } from '../types';
import { FINGER_CONFIGS, ALL_FINGER_IDS } from '../utils/presets';
import { audioEngine } from '../utils/audioEngine';
import { Language, TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Sparkles, 
  Share2, 
  Check, 
  RotateCcw, 
  Heart, 
  Cake, 
  Send
} from 'lucide-react';

interface BirthdayCardModeProps {
  language: Language;
  initialCardData?: BirthdayCardData | null;
  recentTriggeredFinger?: { hand: HandId; finger: FingerId } | null;
  onFingerTouch: (hand: HandId, finger: FingerId) => void;
}

export const BirthdayCardMode: React.FC<BirthdayCardModeProps> = ({
  language,
  initialCardData,
  recentTriggeredFinger,
  onFingerTouch,
}) => {
  const t = TRANSLATIONS[language];

  // Card Editor State
  const [recipient, setRecipient] = useState(
    initialCardData?.recipient || (language === 'zh' ? '鸭鸭' : 'Yaya')
  );
  const [sender, setSender] = useState(
    initialCardData?.sender || (language === 'zh' ? '你最好的朋友' : 'Your Best Friend')
  );
  const [message, setMessage] = useState(
    initialCardData?.message ||
      (language === 'zh'
        ? '愿你新的一岁眼里有星辰，身边有暖阳，所有的美好与愿望都如期而至！生日快乐！🎂✨'
        : 'Wishing you a magical year filled with endless laughter, sweet melodies, and pure happiness! 🎂✨')
  );
  const [words, setWords] = useState<DualHandRecord<string>>(
    initialCardData?.words || (language === 'zh' ? {
      Left: { index: '祝你', middle: '生日', ring: '快乐', pinky: '心想' },
      Right: { index: '事成', middle: '天天', ring: '开心', pinky: '平安' }
    } : {
      Left: { index: 'Happy', middle: 'Birthday', ring: 'Wishing', pinky: 'Joy' },
      Right: { index: 'Peace', middle: 'Smiles', ring: 'Health', pinky: 'Forever 💖' },
    })
  );
  const [theme, setTheme] = useState<'aquatic' | 'cyber_y2k' | 'sweet_pink' | 'meadow_green'>(
    initialCardData?.theme || 'aquatic'
  );

  // 8-step reveal sequence: Left (index, middle, ring, pinky) -> Right (index, middle, ring, pinky)
  const SEQUENCE: Array<{ hand: HandId; finger: FingerId }> = [
    { hand: 'Left', finger: 'index' },
    { hand: 'Left', finger: 'middle' },
    { hand: 'Left', finger: 'ring' },
    { hand: 'Left', finger: 'pinky' },
    { hand: 'Right', finger: 'index' },
    { hand: 'Right', finger: 'middle' },
    { hand: 'Right', finger: 'ring' },
    { hand: 'Right', finger: 'pinky' },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 8
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'edit'>('play');

  // Handle sequential finger touch
  useEffect(() => {
    if (!recentTriggeredFinger || isCompleted) return;

    const expected = SEQUENCE[currentStep];
    if (
      recentTriggeredFinger.hand === expected.hand &&
      recentTriggeredFinger.finger === expected.finger
    ) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Speak word with cute audio
      audioEngine.speakWord(words[expected.hand][expected.finger]);

      if (nextStep >= 8) {
        setIsCompleted(true);
        audioEngine.playCelebrationFanfare();
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#a855f7'],
        });
      }
    }
  }, [recentTriggeredFinger, currentStep, isCompleted, words]);

  // Reset
  const handleReset = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setCandlesBlown(false);
  };

  // Generate shareable URL
  const handleShareCard = () => {
    const cardData: BirthdayCardData = {
      recipient,
      sender,
      message,
      words,
      theme,
      melody: ['C4', 'E4', 'G4', 'C5'],
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cardData))));
    const url = `${window.location.origin}${window.location.pathname}#card=${b64}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentTarget = SEQUENCE[currentStep];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher: Play Reveal vs Edit Card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/50 border border-white/80 shadow-inner">
          <button
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'play' ? 'aero-btn-pink text-slate-900 shadow-md' : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-pink-600" />
            <span>{t.previewCard}</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'edit' ? 'aero-btn text-slate-900 shadow-md' : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.createCard}</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="p-2 rounded-xl aero-glass-card text-xs text-slate-700 hover:text-pink-600 transition cursor-pointer flex items-center gap-1 border border-white/80"
          title="Reset Reveal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">{language === 'zh' ? '重置' : 'Reset'}</span>
        </button>
      </div>

      {/* Mode 1: Interactive Reveal Stage */}
      {activeTab === 'play' && (
        <div 
          id="birthday-reveal-stage"
          className="aero-glass-card rounded-3xl p-6 sm:p-8 border-2 border-white/90 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Header Banner */}
          <div className="flex flex-col items-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 font-digital mb-1">
              ✨ BIRTHDAY_GREETING_V1 ✨
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-800">
              Happy Birthday, <span className="text-pink-600">{recipient}</span>! 🎉
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              From: <strong className="text-slate-700">{sender}</strong>
            </p>
          </div>

          {/* 8-Step Progress Bar */}
          <div className="w-full max-w-md mb-6">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold mb-1.5">
              <span>{t.stepProgress}:</span>
              <span className="font-digital text-pink-600">{currentStep} / 8</span>
            </div>
            <div className="w-full h-3 rounded-full bg-pink-100 border border-white/90 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-sky-400 to-emerald-400 transition-all duration-300 shadow-sm"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* 8-Word Dual Hand Unlocked Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg mb-8">
            {SEQUENCE.map((seq, idx) => {
              const isUnlocked = idx < currentStep;
              const isCurrent = idx === currentStep && !isCompleted;
              const wordText = words[seq.hand][seq.finger];
              const config = FINGER_CONFIGS[seq.finger];

              return (
                <button
                  key={`reveal-${seq.hand}-${seq.finger}`}
                  onClick={() => onFingerTouch(seq.hand, seq.finger)}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center min-h-[76px] cursor-pointer ${
                    isUnlocked
                      ? 'bg-white/90 border-pink-300 shadow-md scale-100'
                      : isCurrent
                      ? 'bg-pink-100/90 border-pink-400 scale-105 animate-bounce shadow-lg'
                      : 'bg-white/40 border-white/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[9px] font-digital font-bold text-slate-500 mb-0.5">
                    <span>{seq.hand === 'Left' ? 'L' : 'R'}:</span>
                    <span>{seq.finger}</span>
                  </div>

                  <span className="text-sm sm:text-base font-extrabold font-display text-slate-800">
                    {isUnlocked ? wordText : isCurrent ? '👉 Pinch' : '🔒 ?'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Target Hand Gesture Prompt */}
          {!isCompleted && currentTarget && (
            <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex items-center gap-3 animate-pulse">
              <span className="text-xl">✋</span>
              <div className="text-left text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">
                  {t.pinchTip}:
                </span>
                <span>
                  {currentTarget.hand === 'Left' ? t.leftHand : t.rightHand} · {FINGER_CONFIGS[currentTarget.finger].nameZh}
                </span>
              </div>
            </div>
          )}

          {/* Completed Unlocked Blessing Card + 3D Cake */}
          {isCompleted && (
            <div className="w-full max-w-lg p-6 rounded-3xl aero-window border-2 border-pink-300 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-90 duration-300">
              <div className="text-3xl animate-bounce">🎂</div>
              <h3 className="text-xl font-bold font-display text-pink-700">
                {t.cardUnlocked}
              </h3>

              <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white/70 p-4 rounded-2xl border border-white/90 shadow-inner">
                &ldquo;{message}&rdquo;
              </p>

              {/* Interactive Birthday Cake Candle */}
              <button
                onClick={() => {
                  setCandlesBlown(true);
                  confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  candlesBlown
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'aero-btn-pink text-slate-900 shadow-md animate-pulse'
                }`}
              >
                <Cake className="w-4 h-4 text-pink-600" />
                <span>{candlesBlown ? t.candleBlown : t.blowCandle}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Card Customizer Editor */}
      {activeTab === 'edit' && (
        <div 
          id="birthday-card-editor"
          className="aero-glass-card rounded-3xl p-6 border border-white/80 shadow-xl flex flex-col gap-5"
        >
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="text-base font-bold font-display text-slate-800">
                {t.createCard}
              </h3>
              <p className="text-xs text-slate-500">
                {t.cardSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.recipientName}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white/90 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.senderName}
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white/90 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.secretWishes}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white/90 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* 8-Word Dual Hand Customizer for Card */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-700 block">
              {t.stepWords}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Hand Words */}
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                <span className="text-[11px] font-bold text-sky-800 block mb-2">{t.leftHand}</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_FINGER_IDS.map((fId) => (
                    <input
                      key={`left-card-${fId}`}
                      type="text"
                      maxLength={10}
                      value={words.Left[fId]}
                      onChange={(e) =>
                        setWords({
                          ...words,
                          Left: { ...words.Left, [fId]: e.target.value },
                        })
                      }
                      className="text-center font-bold text-xs p-1.5 rounded-lg bg-white border border-sky-200"
                    />
                  ))}
                </div>
              </div>

              {/* Right Hand Words */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-800 block mb-2">{t.rightHand}</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_FINGER_IDS.map((fId) => (
                    <input
                      key={`right-card-${fId}`}
                      type="text"
                      maxLength={10}
                      value={words.Right[fId]}
                      onChange={(e) =>
                        setWords({
                          ...words,
                          Right: { ...words.Right, [fId]: e.target.value },
                        })
                      }
                      className="text-center font-bold text-xs p-1.5 rounded-lg bg-white border border-emerald-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/60">
            <button
              onClick={handleShareCard}
              className="aero-btn-pink px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 shadow-md flex items-center gap-2 hover:scale-105 transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t.linkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-pink-600" />
                  <span>{t.generateShareLink}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
