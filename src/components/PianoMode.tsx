import React, { useState, useEffect, useRef } from 'react';
import { FingerId, HandId, InstrumentType, RecordedNote, ScalePreset, DualHandRecord } from '../types';
import { FINGER_CONFIGS, INSTRUMENTS, SCALE_PRESETS, ALL_FINGER_IDS } from '../utils/presets';
import { audioEngine } from '../utils/audioEngine';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Music, 
  Disc3, 
  Circle, 
  Play, 
  Square, 
  RotateCcw, 
  Repeat, 
  Trash2, 
  Share2, 
  Sparkles,
  Volume2,
  Check
} from 'lucide-react';

interface PianoModeProps {
  language: Language;
  notes: DualHandRecord<string>;
  onChangeNotes: (newNotes: DualHandRecord<string>) => void;
  selectedInstrument: InstrumentType;
  onSelectInstrument: (inst: InstrumentType) => void;
  octaveOffset: number;
  onChangeOctave: (offset: number) => void;
  recentTriggeredFinger?: { hand: HandId; finger: FingerId } | null;
  onRecordNote: (hand: HandId, finger: FingerId, note: string) => void;
  recordedMelody: RecordedNote[];
  onClearRecording: () => void;
}

const AVAILABLE_NOTES = [
  'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
  'C6', 'D6', 'E6', 'G6'
];

export const PianoMode: React.FC<PianoModeProps> = ({
  language,
  notes,
  onChangeNotes,
  selectedInstrument,
  onSelectInstrument,
  octaveOffset,
  onChangeOctave,
  recentTriggeredFinger,
  onRecordNote,
  recordedMelody,
  onClearRecording,
}) => {
  const t = TRANSLATIONS[language];
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Metronome
  const [bpm, setBpm] = useState(100);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeTimerRef = useRef<number | null>(null);

  // Metronome tick
  useEffect(() => {
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;
      metronomeTimerRef.current = window.setInterval(() => {
        audioEngine.playClick(beat % 4 === 0);
        beat++;
      }, intervalMs);
    } else {
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current);
      }
    }

    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isMetronomeActive, bpm]);

  // Handle note change for single finger
  const handleNoteChange = (hand: HandId, finger: FingerId, newNote: string) => {
    const updated: DualHandRecord<string> = {
      ...notes,
      [hand]: {
        ...notes[hand],
        [finger]: newNote,
      },
    };
    onChangeNotes(updated);
    audioEngine.playNote(newNote, selectedInstrument, octaveOffset);
  };

  // Apply Scale preset
  const handleApplyScale = (preset: ScalePreset) => {
    onChangeNotes(preset.notes);
  };

  // Playback recorded melody
  const handlePlayRecording = () => {
    if (recordedMelody.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);

    const startTime = recordedMelody[0].timestamp;
    const duration = recordedMelody[recordedMelody.length - 1].timestamp - startTime + 800;

    recordedMelody.forEach((item) => {
      const delay = item.timestamp - startTime;
      setTimeout(() => {
        audioEngine.playNote(item.noteOrWord, item.instrument || selectedInstrument, octaveOffset);
      }, delay);
    });

    setTimeout(() => {
      setIsPlayingBack(false);
      if (isLooping) {
        handlePlayRecording();
      }
    }, duration);
  };

  // Share melody as URL
  const handleShareMelody = () => {
    const data = {
      n: notes,
      inst: selectedInstrument,
    };
    const jsonStr = encodeURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}#melody=${jsonStr}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Top Section: 8-Finger Note Customizer (Dual Hands) */}
      <div 
        id="piano-note-customizer"
        className="aero-glass-card rounded-3xl p-5 sm:p-6 border border-white/70 shadow-lg flex flex-col gap-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full water-orb flex items-center justify-center text-sm shadow-sm">
              🎹
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-800">
                {t.pianoTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.pianoSubtitle}
              </p>
            </div>
          </div>

          {/* Octave & Metronome Controls */}
          <div className="flex items-center gap-2">
            {/* Octave Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/70 border border-white/90 text-xs text-slate-700 shadow-inner">
              <span className="font-semibold px-1 text-slate-600">{t.octaveShift}:</span>
              <button
                onClick={() => onChangeOctave(Math.max(-2, octaveOffset - 1))}
                className="w-6 h-6 rounded-lg aero-btn font-digital font-bold text-slate-800 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="font-digital font-bold text-sky-800 px-1">
                {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}
              </span>
              <button
                onClick={() => onChangeOctave(Math.min(2, octaveOffset + 1))}
                className="w-6 h-6 rounded-lg aero-btn font-digital font-bold text-slate-800 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Metronome Toggle */}
            <button
              onClick={() => setIsMetronomeActive(!isMetronomeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isMetronomeActive
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md animate-pulse'
                  : 'aero-btn text-slate-700 border-white/90'
              }`}
            >
              <span className="text-xs">⏱️</span>
              <span>{bpm} BPM</span>
            </button>
          </div>
        </div>

        {/* Dual Hands 8-Finger Note Customizer Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Hand Notes (Bass / Low) */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <span>{t.leftHandNotes}</span>
              </span>
              <span className="text-[10px] font-digital font-bold text-sky-700 bg-white/80 px-2 py-0.5 rounded-md border border-sky-200">
                KEYS: A · S · D · F
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_FINGER_IDS.map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const currentNote = notes.Left[fId];
                const isTriggered =
                  recentTriggeredFinger?.hand === 'Left' && recentTriggeredFinger?.finger === fId;

                return (
                  <div
                    key={`left-note-${fId}`}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all duration-150 ${
                      isTriggered
                        ? 'bg-sky-200/90 border-sky-400 scale-105 shadow-md'
                        : 'bg-white/90 border-sky-100 shadow-xs hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
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

                    {/* Note Selector Dropdown */}
                    <select
                      value={currentNote}
                      onChange={(e) => handleNoteChange('Left', fId, e.target.value)}
                      className="w-full text-center font-digital font-bold text-sm bg-sky-50 text-sky-900 py-1 px-1 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-inner"
                    >
                      {AVAILABLE_NOTES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Hand Notes (Melody / High) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>{t.rightHandNotes}</span>
              </span>
              <span className="text-[10px] font-digital font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                KEYS: 1 · 2 · 3 · 4
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_FINGER_IDS.map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const currentNote = notes.Right[fId];
                const isTriggered =
                  recentTriggeredFinger?.hand === 'Right' && recentTriggeredFinger?.finger === fId;

                return (
                  <div
                    key={`right-note-${fId}`}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all duration-150 ${
                      isTriggered
                        ? 'bg-emerald-200/90 border-emerald-400 scale-105 shadow-md'
                        : 'bg-white/90 border-emerald-100 shadow-xs hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
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

                    {/* Note Selector Dropdown */}
                    <select
                      value={currentNote}
                      onChange={(e) => handleNoteChange('Right', fId, e.target.value)}
                      className="w-full text-center font-digital font-bold text-sm bg-emerald-50 text-emerald-900 py-1 px-1 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-inner"
                    >
                      {AVAILABLE_NOTES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Synthesizer Instrument Sound Selector */}
      <div 
        id="piano-instrument-picker"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold font-display text-slate-800">
            {t.instrumentSelect}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInstrument === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => {
                  onSelectInstrument(inst.id);
                  audioEngine.playNote('C4', inst.id, octaveOffset);
                }}
                className={`p-3 rounded-2xl transition-all duration-150 cursor-pointer flex flex-col items-center text-center gap-1 border ${
                  isSelected
                    ? 'aero-btn text-slate-900 font-bold border-sky-400 shadow-md scale-105'
                    : 'bg-white/50 hover:bg-white/80 text-slate-700 border-white/60'
                }`}
              >
                <span className="text-2xl filter drop-shadow-xs">{inst.icon}</span>
                <span className="text-xs font-bold line-clamp-1">
                  {language === 'zh' ? inst.nameZh : inst.nameEn}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {language === 'zh' ? inst.descriptionZh : inst.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Chord & Scale Presets */}
      <div 
        id="piano-scale-presets"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg flex flex-col gap-3"
      >
        <span className="text-sm font-bold font-display text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.scalePresets}</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyScale(preset)}
              className="p-3 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 text-left transition hover:scale-[1.01] cursor-pointer flex flex-col justify-between shadow-xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  {language === 'zh' ? preset.nameZh : preset.nameEn}
                </span>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'zh' ? preset.descriptionZh : preset.descriptionEn}
                </p>
              </div>
              <div className="text-[10px] font-digital font-bold text-sky-700 mt-1.5 flex items-center justify-between">
                <span>L: {Object.values(preset.notes.Left).join(' ')}</span>
                <span>R: {Object.values(preset.notes.Right).join(' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cassette Tape Recorder & Melody Sharing */}
      <div 
        id="piano-tape-recorder"
        className="aero-window rounded-3xl p-5 border border-white/80 shadow-xl flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Disc3 className={`w-5 h-5 text-sky-600 ${isPlayingBack ? 'animate-spin' : ''}`} />
            <div>
              <h3 className="text-sm font-bold font-display text-slate-800">
                {t.recordingTape}
              </h3>
              <p className="text-[11px] text-slate-500">
                {recordedMelody.length} {t.notesCount}
              </p>
            </div>
          </div>

          {/* Recording / Playback Transport Controls */}
          <div className="flex items-center gap-2">
            {/* Record Toggle */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : 'aero-btn text-slate-700'
              }`}
            >
              <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-white' : 'text-rose-500 fill-rose-500'}`} />
              <span>{isRecording ? t.recStop : t.recStart}</span>
            </button>

            {/* Play Recording */}
            <button
              onClick={handlePlayRecording}
              disabled={recordedMelody.length === 0 || isPlayingBack}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                isPlayingBack
                  ? 'bg-emerald-500 text-white shadow-md'
                  : recordedMelody.length > 0
                  ? 'aero-btn text-slate-800'
                  : 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
            >
              {isPlayingBack ? (
                <Square className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
              )}
              <span>{t.recPlay}</span>
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                isLooping ? 'bg-sky-500 text-white shadow-md' : 'aero-btn text-slate-700'
              }`}
              title={t.recLoop}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Clear Recording */}
            <button
              onClick={onClearRecording}
              disabled={recordedMelody.length === 0}
              className="p-2 rounded-xl aero-btn text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={t.clearNotes}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Share Melody URL */}
            <button
              onClick={handleShareMelody}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl aero-btn text-xs font-bold text-sky-800 hover:scale-105 transition cursor-pointer shadow-xs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.linkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.shareMelody}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Note Strip Visualizer */}
        <div className="p-3 rounded-2xl bg-white/60 border border-white/80 flex items-center gap-1.5 overflow-x-auto min-h-[48px] shadow-inner">
          {recordedMelody.length === 0 ? (
            <span className="text-xs text-slate-400 italic px-2">
              {t.noRecording}
            </span>
          ) : (
            recordedMelody.slice(-16).map((item, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-xl text-xs font-digital font-bold shadow-xs animate-in zoom-in-75 duration-150 whitespace-nowrap ${
                  item.hand === 'Left'
                    ? 'bg-sky-100 text-sky-900 border border-sky-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                {item.hand === 'Left' ? 'L' : 'R'}:{item.noteOrWord}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
