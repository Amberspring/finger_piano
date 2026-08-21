import { InstrumentType } from '../types';

// Note frequency map for central octaves
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11
};

export function noteToFrequency(noteStr: string, octaveOffset = 0): number {
  const match = noteStr.match(/^([A-G][b#]?)([0-8])?$/);
  if (!match) return 440; // Default A4
  
  const noteName = match[1];
  let octave = match[2] ? parseInt(match[2], 10) : 4;
  octave = Math.max(1, Math.min(8, octave + octaveOffset));
  
  const semitone = NOTE_SEMITONES[noteName] ?? 0;
  // A4 is note 69 in MIDI, 440Hz. C4 is MIDI 60 (261.63Hz)
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted = false;
  private volume = 0.8;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master chain: MasterGain -> Compressor -> Destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  // Play musical note based on chosen instrument
  public playNote(note: string, instrument: InstrumentType = 'grand_piano', octaveOffset = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const freq = noteToFrequency(note, octaveOffset);
    const now = this.ctx.currentTime;

    switch (instrument) {
      case 'grand_piano':
        this.playPiano(freq, now);
        break;
      case 'electric_piano':
        this.playElectricPiano(freq, now);
        break;
      case 'acoustic_guitar':
        this.playGuitar(freq, now);
        break;
      case 'retro_synth':
        this.playRetroSynth(freq, now);
        break;
      case 'chiptune':
        this.playChiptune(freq, now);
        break;
      case 'music_box':
        this.playMusicBox(freq, now);
        break;
      case 'marimba':
        this.playMarimba(freq, now);
        break;
      case 'drum_kit':
        this.playDrum(note, now);
        break;
      default:
        this.playPiano(freq, now);
    }
  }

  // 1. Grand Piano (Acoustic multi-harmonic + hammer transient)
  private playPiano(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const noteGain = this.ctx.createGain();
    noteGain.connect(this.masterGain);

    // Envelope
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.9, now + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.4, now + 0.15);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Fundamental + overtones
    const harmonics = [1, 2, 3, 4, 5, 6];
    const harmonicGains = [0.6, 0.35, 0.18, 0.1, 0.05, 0.02];

    harmonics.forEach((h, i) => {
      const osc = this.ctx!.createOscillator();
      const hGain = this.ctx!.createGain();
      
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * h, now);
      
      // Slight detune for realism
      if (i > 0) {
        osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);
      }

      hGain.gain.setValueAtTime(harmonicGains[i], now);
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 / Math.sqrt(h));

      osc.connect(hGain);
      hGain.connect(noteGain);

      osc.start(now);
      osc.stop(now + 1.9);
    });

    // Hammer noise click
    const bufferSize = this.ctx.sampleRate * 0.015;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(noteGain);

    noise.start(now);
  }

  // 2. Electric Piano (FM chime)
  private playElectricPiano(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const noteGain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * 14, now); // Bell harmonic ratio

    modGain.gain.setValueAtTime(freq * 4, now);
    modGain.gain.exponentialRampToValueAtTime(1, now + 0.8);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.8, now + 0.005);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    carrier.connect(noteGain);
    noteGain.connect(this.masterGain);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 2.3);
    modulator.stop(now + 2.3);
  }

  // 3. Acoustic Guitar (Warm plucked string)
  private playGuitar(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc2.detune.setValueAtTime(4, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);
    filter.Q.setValueAtTime(4, now);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.85, now + 0.004);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
  }

  // 4. Retro 80s Synth / Lead
  private playRetroSynth(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.detune.setValueAtTime(-8, now);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq, now);
    osc2.detune.setValueAtTime(8, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 8, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.5);
    filter.Q.setValueAtTime(6, now);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.7, now + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  }

  // 5. 8-Bit Chiptune / Gameboy
  private playChiptune(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'square';
    // Classic chiptune pitch arpeggio blip
    osc.frequency.setValueAtTime(freq * 2, now);
    osc.frequency.setValueAtTime(freq, now + 0.02);

    noteGain.gain.setValueAtTime(0.4, now);
    noteGain.gain.setValueAtTime(0.35, now + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  // 6. Music Box (Celesta / Sparkle)
  private playMusicBox(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq * 2, now); // Higher chime octave
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 4, now);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.7, now + 0.003);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.6);
    osc2.stop(now + 2.6);
  }

  // 7. Marimba (Woody Percussion)
  private playMarimba(freq: number, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.5, now);
    filter.Q.setValueAtTime(8, now);

    noteGain.gain.setValueAtTime(0.8, now);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // 8. Drum Kit
  private playDrum(note: string, now: number) {
    if (!this.ctx || !this.masterGain) return;

    const firstChar = note.charAt(0).toUpperCase();
    if (firstChar === 'C') {
      // 808 Kick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (firstChar === 'D') {
      // Snare
      const noise = this.createNoiseBuffer(0.2);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } else if (firstChar === 'E') {
      // Hi-Hat
      const noise = this.createNoiseBuffer(0.08);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(9000, now);
      filter.Q.setValueAtTime(5, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } else {
      // Clap
      const noise = this.createNoiseBuffer(0.25);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    }
  }

  private createNoiseBuffer(duration: number): AudioBufferSourceNode {
    const bufferSize = Math.floor(this.ctx!.sampleRate * duration);
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    return noise;
  }

  // Clean and accurate speech pronunciation for words / phonetic learning
  public speakWord(word: string, speechRate = 1.0, speechPitch = 1.0) {
    if (this.isMuted || !word) return;
    this.initContext();

    // Subtle gentle click/pop tone to indicate tactile feedback
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }

    // Web Speech API standard synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel previous to avoid queue delay
      const utterance = new SpeechSynthesisUtterance(word.trim());
      
      const isChinese = /[\u4e00-\u9fa5]/.test(word);

      utterance.pitch = speechPitch;
      utterance.rate = speechRate;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (isChinese) {
          const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN') || v.name.includes('Chinese') || v.name.includes('Tingting') || v.name.includes('Xiaoxiao'));
          if (zhVoice) utterance.voice = zhVoice;
          utterance.lang = 'zh-CN';
        } else {
          const enVoice = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Siri')));
          if (enVoice) {
            utterance.voice = enVoice;
          } else {
            const anyEn = voices.find(v => v.lang.startsWith('en'));
            if (anyEn) utterance.voice = anyEn;
          }
          utterance.lang = 'en-US';
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  // Metronome tick sound
  public playClick(accent = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(accent ? 1200 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Celebration Chime Fanfare for Birthday / Success
  public playCelebrationFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const fanfareNotes = ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'];
    const times = [0, 0.12, 0.24, 0.38, 0.52, 0.68];
    const now = this.ctx.currentTime;

    fanfareNotes.forEach((note, idx) => {
      setTimeout(() => {
        this.playNote(note, 'music_box');
      }, times[idx] * 1000);
    });
  }
}

export const audioEngine = new AudioEngine();
