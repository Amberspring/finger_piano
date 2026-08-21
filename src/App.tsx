/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppMode, 
  BirthdayCardData, 
  FingerId, 
  HandId, 
  InstrumentType, 
  RecordedNote, 
  TouchTriggerEvent, 
  DualHandRecord 
} from './types';
import { 
  DEFAULT_DUAL_NOTES, 
  DEFAULT_DUAL_WORDS_ZH, 
  DEFAULT_DUAL_WORDS_EN, 
  FINGER_CONFIGS,
  ALL_FINGER_IDS 
} from './utils/presets';
import { audioEngine } from './utils/audioEngine';
import { Language, TRANSLATIONS } from './utils/i18n';
import { AeroHeader } from './components/AeroHeader';
import { CameraHandView } from './components/CameraHandView';
import { PianoMode } from './components/PianoMode';
import { WordMode } from './components/WordMode';
import { BirthdayCardMode } from './components/BirthdayCardMode';
import { TutorialMode } from './components/TutorialMode';
import { AeroDecorations } from './components/AeroDecorations';

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [currentMode, setCurrentMode] = useState<AppMode>('piano');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Piano Mode State (Dual Hand 8 Notes: Left 4 + Right 4)
  const [notes, setNotes] = useState<DualHandRecord<string>>(DEFAULT_DUAL_NOTES);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('grand_piano');
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  const [recordedMelody, setRecordedMelody] = useState<RecordedNote[]>([]);

  // Word Mode State (Dual Hand 8 Words: Left 4 + Right 4)
  const [words, setWords] = useState<DualHandRecord<string>>(
    language === 'zh' ? DEFAULT_DUAL_WORDS_ZH : DEFAULT_DUAL_WORDS_EN
  );
  const [sentenceHistory, setSentenceHistory] = useState<
    Array<{ word: string; hand: HandId; finger: FingerId; timestamp: number }>
  >([]);

  // Birthday Card State
  const [initialCardData, setInitialCardData] = useState<BirthdayCardData | null>(null);

  // Active gesture highlights for both hands
  const [activeFingers, setActiveFingers] = useState<DualHandRecord<boolean>>({
    Left: { index: false, middle: false, ring: false, pinky: false },
    Right: { index: false, middle: false, ring: false, pinky: false },
  });
  const [recentTriggeredFinger, setRecentTriggeredFinger] = useState<{ hand: HandId; finger: FingerId } | null>(null);
  const triggerTimeoutRef = useRef<number | null>(null);

  // Update words when language changes if sentence is empty
  const handleToggleLanguage = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    if (sentenceHistory.length === 0) {
      setWords(nextLang === 'zh' ? DEFAULT_DUAL_WORDS_ZH : DEFAULT_DUAL_WORDS_EN);
    }
  };

  // Check URL hash parameters for shared birthday card or melody
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#card=')) {
        try {
          const raw = hash.replace('#card=', '');
          const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
          setInitialCardData(decoded);
          if (decoded.words) setWords(decoded.words);
          setCurrentMode('birthday');
        } catch (e) {
          console.error('Failed to parse card from URL hash:', e);
        }
      } else if (hash.startsWith('#melody=')) {
        try {
          const raw = hash.replace('#melody=', '');
          const data = JSON.parse(decodeURIComponent(raw));
          if (data.n) setNotes(data.n);
          if (data.inst) setSelectedInstrument(data.inst);
          setCurrentMode('piano');
        } catch (e) {
          console.error('Failed to parse melody from URL hash:', e);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Main Unified Touch Handler for Left & Right Hands
  const handleTouchTrigger = useCallback(
    (event: TouchTriggerEvent) => {
      const { hand, finger } = event;

      // 1. Visual feedback latch for specific hand & finger
      setActiveFingers((prev) => ({
        ...prev,
        [hand]: {
          ...prev[hand],
          [finger]: true,
        },
      }));
      setRecentTriggeredFinger({ hand, finger });
      setIsAudioPlaying(true);

      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }

      triggerTimeoutRef.current = window.setTimeout(() => {
        setActiveFingers((prev) => ({
          ...prev,
          [hand]: {
            ...prev[hand],
            [finger]: false,
          },
        }));
        setRecentTriggeredFinger(null);
        setIsAudioPlaying(false);
      }, 250);

      // 2. Mode-specific action execution
      if (currentMode === 'piano') {
        const note = notes[hand][finger];
        audioEngine.playNote(note, selectedInstrument, octaveOffset);
        setRecordedMelody((prev) => [
          ...prev,
          {
            hand,
            finger,
            noteOrWord: note,
            timestamp: Date.now(),
            mode: 'piano',
            instrument: selectedInstrument,
          },
        ]);
      } else if (currentMode === 'word') {
        const word = words[hand][finger];
        audioEngine.speakWord(word);
        setSentenceHistory((prev) => [
          ...prev,
          { word, hand, finger, timestamp: Date.now() },
        ]);
      }
    },
    [currentMode, notes, selectedInstrument, octaveOffset, words]
  );

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Derive dynamic labels for all 8 finger pads
  const getFingerLabels = (): DualHandRecord<string> => {
    if (currentMode === 'piano') {
      return notes;
    } else if (currentMode === 'word' || currentMode === 'birthday') {
      return words;
    } else {
      return notes;
    }
  };

  const getSubLabels = (): DualHandRecord<string> => {
    const t = TRANSLATIONS[language];
    return {
      Left: {
        index: `[A] ${language === 'zh' ? '左手食指' : 'L.Index'}`,
        middle: `[S] ${language === 'zh' ? '左手中指' : 'L.Middle'}`,
        ring: `[D] ${language === 'zh' ? '左手无名' : 'L.Ring'}`,
        pinky: `[F] ${language === 'zh' ? '左手小指' : 'L.Pinky'}`,
      },
      Right: {
        index: `[1] ${language === 'zh' ? '右手食指' : 'R.Index'}`,
        middle: `[2] ${language === 'zh' ? '右手中指' : 'R.Middle'}`,
        ring: `[3] ${language === 'zh' ? '右手无名' : 'R.Ring'}`,
        pinky: `[4] ${language === 'zh' ? '右手小指' : 'R.Pinky'}`,
      },
    };
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-cyan-200 to-emerald-200 text-slate-800 p-3 sm:p-6 md:p-8 y2k-dots relative selection:bg-cyan-400 selection:text-slate-900 overflow-x-hidden">
      {/* Background Frutiger Aero floating bubbles & decorations */}
      <AeroDecorations />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Aero Top Navigation Bar with Language Switcher */}
        <AeroHeader
          language={language}
          onToggleLanguage={handleToggleLanguage}
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isAudioPlaying={isAudioPlaying}
        />



        {/* Quick Helper Banner */}
        <div className="aero-glass-card rounded-2xl p-3.5 border border-white/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">👐</span>
            <span>
              <strong className="font-semibold text-slate-900">{t.howToPlay} </strong>
              {t.howToPlayDesc}
            </span>
          </div>
          <span className="font-digital text-[11px] font-bold text-sky-800 px-2 py-0.5 rounded-md bg-white/70">
            {t.keysBadge}
          </span>
        </div>
        {/* Main 2-Column Responsive Workspace */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Webcam Hand Gesture Vision & Dual Hand 8-Pad Controls (5 Cols on LG) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <CameraHandView
              language={language}
              onTouch={handleTouchTrigger}
              activeFingers={activeFingers}
              fingerLabels={getFingerLabels()}
              subLabels={getSubLabels()}
              subtitleText={
                currentMode === 'word'
                  ? sentenceHistory.map((s) => s.word).join(' ')
                  : currentMode === 'piano'
                  ? recordedMelody.slice(-8).map((m) => m.noteOrWord).join(' ')
                  : ''
              }
              isCameraActive={isCameraActive}
              onToggleCamera={() => setIsCameraActive(!isCameraActive)}
            />          </div>

          {/* Right Column: Mode-Specific Workspace (7 Cols on LG) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {currentMode === 'piano' && (
              <PianoMode
                language={language}
                notes={notes}
                onChangeNotes={setNotes}
                selectedInstrument={selectedInstrument}
                onSelectInstrument={setSelectedInstrument}
                octaveOffset={octaveOffset}
                onChangeOctave={setOctaveOffset}
                recentTriggeredFinger={recentTriggeredFinger}
                onRecordNote={(hand, finger, note) => {
                  setRecordedMelody((prev) => [
                    ...prev,
                    { hand, finger, noteOrWord: note, timestamp: Date.now(), mode: 'piano' },
                  ]);
                }}
                recordedMelody={recordedMelody}
                onClearRecording={() => setRecordedMelody([])}
              />
            )}

            {currentMode === 'word' && (
              <WordMode
                language={language}
                words={words}
                onChangeWords={setWords}
                sentenceHistory={sentenceHistory}
                onClearSentence={() => setSentenceHistory([])}
                recentTriggeredFinger={recentTriggeredFinger}
              />
            )}

            {currentMode === 'birthday' && (
              <BirthdayCardMode
                language={language}
                initialCardData={initialCardData}
                recentTriggeredFinger={recentTriggeredFinger}
                onFingerTouch={(hand, finger) =>
                  handleTouchTrigger({ hand, finger, timestamp: Date.now(), distance: 0.05 })
                }
              />
            )}

            {currentMode === 'tutorial' && (
              <TutorialMode
                language={language}
                recentTriggeredFinger={recentTriggeredFinger}
                onFingerTouch={(hand, finger) =>
                  handleTouchTrigger({ hand, finger, timestamp: Date.now(), distance: 0.05 })
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
