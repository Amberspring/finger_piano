export type AppMode = 'piano' | 'word' | 'birthday' | 'tutorial';

export type FingerId = 'index' | 'middle' | 'ring' | 'pinky';

export type HandId = 'Left' | 'Right';

export type DualHandKey = 
  | 'l_index' | 'l_middle' | 'l_ring' | 'l_pinky'
  | 'r_index' | 'r_middle' | 'r_ring' | 'r_pinky';

export type DualHandRecord<T> = Record<HandId, Record<FingerId, T>>;

export interface FingerConfig {
  id: FingerId;
  name: string;
  nameZh: string;
  defaultNote: string;
  defaultWordEn: string;
  defaultWordZh: string;
  color: string;
  glowColor: string;
  keyShortcutLeft: string;
  keyShortcutRight: string;
  landmarkIndex: number;
}

export type InstrumentType = 
  | 'grand_piano'
  | 'electric_piano'
  | 'acoustic_guitar'
  | 'retro_synth'
  | 'chiptune'
  | 'music_box'
  | 'marimba'
  | 'drum_kit';

export interface InstrumentInfo {
  id: InstrumentType;
  nameEn: string;
  nameZh: string;
  icon: string;
  category: string;
  descriptionEn: string;
  descriptionZh: string;
}

export interface ScalePreset {
  id: string;
  nameEn: string;
  nameZh: string;
  notes: DualHandRecord<string>;
  descriptionEn: string;
  descriptionZh: string;
}

export interface WordPreset {
  id: string;
  nameEn: string;
  nameZh: string;
  wordsEn: DualHandRecord<string>;
  wordsZh: DualHandRecord<string>;
  category: string;
}

export interface SongTutorial {
  id: string;
  titleEn: string;
  titleZh: string;
  artist: string;
  difficulty: 'Easy' | 'Medium' | 'Fun';
  notes: { hand: HandId; finger: FingerId; note: string; duration?: number }[];
  descriptionEn: string;
  descriptionZh: string;
}

export interface BirthdayCardData {
  recipient: string;
  sender: string;
  message: string;
  words: DualHandRecord<string>;
  theme: 'aquatic' | 'cyber_y2k' | 'sweet_pink' | 'meadow_green';
  melody: string[];
}

export interface RecordedNote {
  hand: HandId;
  finger: FingerId;
  noteOrWord: string;
  timestamp: number;
  mode: AppMode;
  instrument?: InstrumentType;
}

export interface TouchTriggerEvent {
  hand: HandId;
  finger: FingerId;
  timestamp: number;
  distance: number;
}

export type RetroFrameType = 
  | 'none'          // 无边框 (极简纯净全屏，与用户截图一致)
  | 'frutiger_aero' // Frutiger Aero (千禧拟物水感气泡玻璃窗)
  | 'y2k_vhs'       // Y2K VHS/DV (复古DV录像机取景框)
  | 'polaroid'      // Polaroid Film (拍立得复古胶片框)
  | 'retro_os'      // Classic OS 98 (复古电脑桌面视窗)
  | 'cyber_matrix'; // Cyber Neon HUD (赛博霓虹科幻矩阵)

export interface FrameOption {
  id: RetroFrameType;
  nameZh: string;
  nameEn: string;
  icon: string;
  descriptionZh: string;
}
