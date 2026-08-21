import React, { useState, useEffect } from 'react';
import { FingerId, HandId, SongTutorial } from '../types';
import { FINGER_CONFIGS, SONG_TUTORIALS } from '../utils/presets';
import { audioEngine } from '../utils/audioEngine';
import { Language, TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';
import { RotateCcw } from 'lucide-react';

interface TutorialModeProps {
  language: Language;
  recentTriggeredFinger?: { hand: HandId; finger: FingerId } | null;
  onFingerTouch: (hand: HandId, finger: FingerId) => void;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({
  language,
  recentTriggeredFinger,
  onFingerTouch,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedSong, setSelectedSong] = useState<SongTutorial>(SONG_TUTORIALS[0]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const totalNotes = selectedSong.notes.length;
  const currentTarget = selectedSong.notes[currentNoteIndex];
  const progressPercent = Math.round((currentNoteIndex / totalNotes) * 100);

  // Handle finger touch for song note matching
  useEffect(() => {
    if (!recentTriggeredFinger || isFinished || !currentTarget) return;

    if (
      recentTriggeredFinger.hand === currentTarget.hand &&
      recentTriggeredFinger.finger === currentTarget.finger
    ) {
      // Hit correct note!
      audioEngine.playNote(currentTarget.note, 'grand_piano');
      const nextIndex = currentNoteIndex + 1;
      setScore((prev) => prev + 100 + combo * 10);
      setCombo((prev) => prev + 1);

      if (nextIndex >= totalNotes) {
        setIsFinished(true);
        audioEngine.playCelebrationFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setCurrentNoteIndex(nextIndex);
      }
    } else {
      // Missed / broke combo
      setCombo(0);
    }
  }, [recentTriggeredFinger, currentNoteIndex, isFinished, currentTarget, totalNotes, combo]);

  const handleSelectSong = (song: SongTutorial) => {
    setSelectedSong(song);
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsFinished(false);
  };

  const handleRestart = () => {
    setCurrentNoteIndex(0);
    setScore(0);
    setCombo(0);
    setIsFinished(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Song Selector Card Grid */}
      <div 
        id="tutorial-song-selector"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full water-orb flex items-center justify-center text-sm shadow-sm">
            🎵
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-slate-800">
              {t.tutorialTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {t.tutorialSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SONG_TUTORIALS.map((song) => {
            const isSelected = selectedSong.id === song.id;
            return (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-150 cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'aero-btn text-slate-900 font-bold border-sky-400 shadow-md scale-[1.02]'
                    : 'bg-white/50 hover:bg-white/80 text-slate-700 border-white/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-sky-800 line-clamp-1">{song.artist}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      song.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {song.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold line-clamp-1">
                    {language === 'zh' ? song.titleZh : song.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                    {language === 'zh' ? song.descriptionZh : song.descriptionEn}
                  </p>
                </div>

                <div className="mt-3 text-[10px] font-digital text-slate-500">
                  {song.notes.length} {t.notesUnit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Guided Play Stage */}
      <div 
        id="tutorial-play-stage"
        className="aero-glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Score & Progress Ribbon */}
        <div className="w-full max-w-xl flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">{t.score}:</span>
            <span className="font-digital text-lg font-bold text-sky-700 bg-white/80 px-3 py-1 rounded-xl border border-white/90 shadow-xs">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">{t.combo}:</span>
            <span className={`font-digital text-sm font-bold px-2.5 py-1 rounded-xl border shadow-xs ${
              combo > 2 ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' : 'bg-white/80 text-slate-700 border-white/90'
            }`}>
              🔥 x{combo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">{t.progress}:</span>
            <span className="font-digital text-sm font-bold text-slate-800">
              {currentNoteIndex} / {totalNotes}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl h-3 rounded-full bg-slate-200/80 overflow-hidden mb-8 border border-white/80">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-500 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!isFinished ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.currentTarget}:
            </span>

            {/* Target Finger Big Callout */}
            {currentTarget && (
              <div 
                onClick={() => onFingerTouch(currentTarget.hand, currentTarget.finger)}
                className="p-6 sm:p-8 rounded-3xl border-2 border-white shadow-2xl flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-200 animate-bounce"
                style={{
                  background: `linear-gradient(135deg, #ffffff 0%, ${FINGER_CONFIGS[currentTarget.finger].color}33 100%)`,
                  borderColor: FINGER_CONFIGS[currentTarget.finger].color,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-digital">
                    {currentTarget.hand === 'Left' ? t.leftHand : t.rightHand}
                  </span>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-digital font-bold text-slate-900 shadow-md"
                    style={{ backgroundColor: FINGER_CONFIGS[currentTarget.finger].color }}
                  >
                    {currentTarget.hand === 'Left'
                      ? FINGER_CONFIGS[currentTarget.finger].keyShortcutLeft
                      : FINGER_CONFIGS[currentTarget.finger].keyShortcutRight}
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                  {language === 'zh'
                    ? FINGER_CONFIGS[currentTarget.finger].nameZh
                    : FINGER_CONFIGS[currentTarget.finger].name}
                </h3>

                <span className="text-lg font-bold font-digital text-sky-700">
                  Note: {currentTarget.note}
                </span>

                <span className="text-xs text-slate-500">
                  {currentTarget.hand === 'Left' ? 'Left' : 'Right'} Hand: Thumb + {FINGER_CONFIGS[currentTarget.finger].id.toUpperCase()}
                </span>
              </div>
            )}

            {/* Upcoming Next Notes Preview Ribbon */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-md p-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">{t.upcoming}:</span>
              {selectedSong.notes.slice(currentNoteIndex + 1, currentNoteIndex + 5).map((note, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/70 text-slate-700 border border-white/80"
                >
                  {note.hand === 'Left' ? 'L' : 'R'}:{FINGER_CONFIGS[note.finger].id.slice(0, 3)} ({note.note})
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Song Cleared Screen */
          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl aero-window border-2 border-emerald-300 shadow-xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-3xl mb-1 shadow-md">
              🏆
            </div>
            <h3 className="text-2xl font-extrabold font-display text-slate-900">
              {t.songCompleted}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm">
              Great rhythm! Final score: {score}!
            </p>

            <button
              onClick={handleRestart}
              className="aero-btn px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 shadow-md flex items-center gap-2 mt-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-sky-700" />
              <span>{t.playAgain}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
