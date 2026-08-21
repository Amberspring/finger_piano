import { 
  FingerConfig, 
  FingerId, 
  HandId, 
  InstrumentInfo, 
  ScalePreset, 
  SongTutorial, 
  WordPreset,
  DualHandRecord,
  FrameOption
} from '../types';

export const FINGER_CONFIGS: Record<FingerId, FingerConfig> = {
  index: {
    id: 'index',
    name: 'Index Finger',
    nameZh: '食指',
    defaultNote: 'C4',
    defaultWordEn: 'Happy',
    defaultWordZh: '祝你',
    color: '#38bdf8', // Cyan / Aqua
    glowColor: 'rgba(56, 189, 248, 0.6)',
    keyShortcutLeft: 'A',
    keyShortcutRight: '1',
    landmarkIndex: 8,
  },
  middle: {
    id: 'middle',
    name: 'Middle Finger',
    nameZh: '中指',
    defaultNote: 'D4',
    defaultWordEn: 'Birthday',
    defaultWordZh: '生日',
    color: '#4ade80', // Mint Green
    glowColor: 'rgba(74, 222, 128, 0.6)',
    keyShortcutLeft: 'S',
    keyShortcutRight: '2',
    landmarkIndex: 12,
  },
  ring: {
    id: 'ring',
    name: 'Ring Finger',
    nameZh: '无名指',
    defaultNote: 'E4',
    defaultWordEn: 'Wishing',
    defaultWordZh: '快乐',
    color: '#fbbf24', // Sunny Amber
    glowColor: 'rgba(251, 191, 36, 0.6)',
    keyShortcutLeft: 'D',
    keyShortcutRight: '3',
    landmarkIndex: 16,
  },
  pinky: {
    id: 'pinky',
    name: 'Pinky Finger',
    nameZh: '小指',
    defaultNote: 'F4',
    defaultWordEn: 'Joy',
    defaultWordZh: '平安',
    color: '#f472b6', // Bubble Pink
    glowColor: 'rgba(244, 114, 182, 0.6)',
    keyShortcutLeft: 'F',
    keyShortcutRight: '4',
    landmarkIndex: 20,
  },
};

export const ALL_FINGER_IDS: FingerId[] = ['index', 'middle', 'ring', 'pinky'];
export const ALL_HAND_IDS: HandId[] = ['Left', 'Right'];

export const DEFAULT_DUAL_NOTES: DualHandRecord<string> = {
  Left: {
    pinky: 'C4',
    ring: 'D4',
    middle: 'E4',
    index: 'F4',
  },
  Right: {
    index: 'G4',
    middle: 'A4',
    ring: 'B4',
    pinky: 'C5',
  },
};

export const DEFAULT_DUAL_WORDS_EN: DualHandRecord<string> = {
  Left: {
    index: 'Happy',
    middle: 'Birthday',
    ring: 'Wishing',
    pinky: 'Joy',
  },
  Right: {
    index: 'Peace',
    middle: 'Smiles',
    ring: 'Health',
    pinky: 'Always',
  },
};

export const DEFAULT_DUAL_WORDS_ZH: DualHandRecord<string> = {
  Left: {
    index: '祝你',
    middle: '生日',
    ring: '快乐',
    pinky: '心想',
  },
  Right: {
    index: '事成',
    middle: '天天',
    ring: '开心',
    pinky: '平安',
  },
};

export const INSTRUMENTS: InstrumentInfo[] = [
  {
    id: 'grand_piano',
    nameEn: 'Grand Acoustic Piano',
    nameZh: '原声大三角钢琴',
    icon: '🎹',
    category: 'Keyboard',
    descriptionEn: 'Crisp acoustic piano with warm resonance and natural decay',
    descriptionZh: '清脆明亮的原声大钢琴音色，具备浑厚共鸣与细腻泛音',
  },
  {
    id: 'electric_piano',
    nameEn: 'Electric FM Piano',
    nameZh: '复古电钢琴 (DX7)',
    icon: '⚡',
    category: 'Keyboard',
    descriptionEn: 'Glossy 80s DX7 bell chime timbre with lush stereo chorus',
    descriptionZh: '千禧与80年代经典的FM钟鸣音色，晶莹剔透充满梦幻感',
  },
  {
    id: 'acoustic_guitar',
    nameEn: 'Acoustic Guitar',
    nameZh: '民谣木吉他',
    icon: '🎸',
    category: 'Strings',
    descriptionEn: 'Warm plucked folk steel strings with organic finger touch',
    descriptionZh: '温暖清澈的民谣钢弦拨弦质感，极具真实空气感',
  },
  {
    id: 'retro_synth',
    nameEn: 'Retro 80s Lead Synth',
    nameZh: '复古模拟合成器',
    icon: '🎛️',
    category: 'Synth',
    descriptionEn: 'Analog sawtooth filtered dream pop lead with rich harmonics',
    descriptionZh: '模拟锯齿波低通滤波合成器，千禧合成器流行乐主角',
  },
  {
    id: 'chiptune',
    nameEn: '8-Bit Arcade Chiptune',
    nameZh: '8-Bit 像素红白机',
    icon: '👾',
    category: 'Arcade',
    descriptionEn: 'Vintage Game Boy square wave bleeps and nostalgic arpeggios',
    descriptionZh: '经典掌机方波与跳音音效，充满复古极客趣味',
  },
  {
    id: 'music_box',
    nameEn: 'Crystalline Music Box',
    nameZh: '水晶八音盒',
    icon: '✨',
    category: 'Chime',
    descriptionEn: 'Sparkling crystalline lullaby bell with gentle metallic warmth',
    descriptionZh: '纯净透明的八音盒发条钟鸣，宛如梦幻水晶球',
  },
  {
    id: 'marimba',
    nameEn: 'Tropical Marimba',
    nameZh: '热带马林巴木琴',
    icon: '🪵',
    category: 'Percussion',
    descriptionEn: 'Punchy tropical wooden bars with rapid percussive response',
    descriptionZh: '清脆弹性的热带木质共鸣打击乐，极具节奏弹性',
  },
  {
    id: 'drum_kit',
    nameEn: '808 Drum & Beat Machine',
    nameZh: '808 电子鼓机套件',
    icon: '🥁',
    category: 'Beats',
    descriptionEn: 'Punchy kick, snappy snare, crisp hi-hat & handclaps',
    descriptionZh: '经典808底鼓、军鼓、擦片与击掌，双手可随时敲击节奏',
  },
];

export const SCALE_PRESETS: ScalePreset[] = [
  {
    id: 'c_major_full',
    nameEn: 'C Major Diatonic Octave (Full 8 Notes)',
    nameZh: 'C 大调全音阶 (双手 8 音完整八度)',
    notes: {
      Left: { pinky: 'C4', ring: 'D4', middle: 'E4', index: 'F4' },
      Right: { index: 'G4', middle: 'A4', ring: 'B4', pinky: 'C5' },
    },
    descriptionEn: 'Left Hand (C4-F4) + Right Hand (G4-C5) forms a complete 8-note diatonic octave',
    descriptionZh: '左手负责低区 C4-F4，右手负责高区 G4-C5，构成完整八度大调音阶',
  },
  {
    id: 'harmony_bass_melody',
    nameEn: 'Pop Harmony: Bass Chords + Lead Melody',
    nameZh: '流行和声：左手低音和弦 + 右手主旋律',
    notes: {
      Left: { pinky: 'C3', ring: 'F3', middle: 'G3', index: 'A3' },
      Right: { index: 'C4', middle: 'E4', ring: 'G4', pinky: 'C5' },
    },
    descriptionEn: 'Left hand punches deep bass root notes while right hand plays bright triad melody',
    descriptionZh: '左手演奏深沉低音和弦根音，右手演奏明亮三和弦主音旋律',
  },
  {
    id: 'pentatonic_dual',
    nameEn: 'Pure Pentatonic Star (Oriental & Pop)',
    nameZh: '纯净五声星芒 (国风空灵与现代流行)',
    notes: {
      Left: { pinky: 'C4', ring: 'D4', middle: 'E4', index: 'G4' },
      Right: { index: 'A4', middle: 'C5', ring: 'D5', pinky: 'E5' },
    },
    descriptionEn: 'Harmonious pentatonic scale spanning two octaves — no dissonant notes!',
    descriptionZh: '跨越双八度的宫商角徵羽五声音阶，任意乱弹都能和谐动听',
  },
  {
    id: 'lofi_dream_8',
    nameEn: 'Lo-Fi Chill & 7th Chords',
    nameZh: 'Lo-Fi 温暖治愈 7 和弦音阶',
    notes: {
      Left: { pinky: 'F3', ring: 'A3', middle: 'C4', index: 'E4' },
      Right: { index: 'G4', middle: 'B4', ring: 'D5', pinky: 'F5' },
    },
    descriptionEn: 'Soft nostalgic dream-pop chord progression for relaxing sessions',
    descriptionZh: '柔和怀旧的梦幻爵士七和弦配置，随手弹奏即是午后慵懒氛围',
  },
  {
    id: 'y2k_dream_pop',
    nameEn: 'Y2K Dream Pop Hook Key',
    nameZh: '千禧梦幻流行键位',
    notes: {
      Left: { pinky: 'A3', ring: 'C4', middle: 'E4', index: 'G4' },
      Right: { index: 'A4', middle: 'B4', ring: 'C5', pinky: 'E5' },
    },
    descriptionEn: 'Emotional Y2K melodic hook layout for popular millennium pop tunes',
    descriptionZh: '千禧年感伤流行旋律键位，双手左右开弓轻松弹奏抓耳副歌',
  },
  {
    id: 'cyber_bass_arp',
    nameEn: 'Cyberpunk Bass & Lead Arpeggio',
    nameZh: '赛博电音低音推进与主音琶音',
    notes: {
      Left: { pinky: 'C3', ring: 'D#3', middle: 'G3', index: 'A#3' },
      Right: { index: 'C5', middle: 'D#5', ring: 'G5', pinky: 'C6' },
    },
    descriptionEn: 'Heavy minor bass groove in left hand and piercing lead synths in right',
    descriptionZh: '左手硬核电子低音节奏，右手高亢琶音跳动，电子乐现场既视感',
  },
];

export const WORD_PRESETS: WordPreset[] = [
  {
    id: 'daily_conversation',
    nameEn: '✨ Natural Daily Conversation',
    nameZh: '✨ 自然地道日常对话',
    category: 'Daily',
    wordsEn: {
      Left: { pinky: 'I', ring: 'really', middle: 'love', index: 'this' },
      Right: { index: 'beautiful', middle: 'bright', ring: 'sunny', pinky: 'day' },
    },
    wordsZh: {
      Left: { pinky: '我', ring: '真的', middle: '喜欢', index: '这个' },
      Right: { index: '美丽', middle: '明亮', ring: '晴朗', pinky: '日子' },
    },
  },
  {
    id: 'birthday_blessing',
    nameEn: '🎂 Birthday Wishes & Joy',
    nameZh: '🎂 生日祝福与温馨寄语',
    category: 'Celebration',
    wordsEn: {
      Left: { index: 'Happy', middle: 'Birthday', ring: 'Wishing', pinky: 'Joy' },
      Right: { index: 'Peace', middle: 'Smiles', ring: 'Health', pinky: 'Always' },
    },
    wordsZh: {
      Left: { index: '祝你', middle: '生日', ring: '快乐', pinky: '心想' },
      Right: { index: '事成', middle: '天天', ring: '开心', pinky: '平安' },
    },
  },
  {
    id: 'music_rhythm',
    nameEn: '🎵 Rhythm & Beatbox Vocals',
    nameZh: '🎵 节拍律动与口技人声',
    category: 'Music',
    wordsEn: {
      Left: { index: 'Drop', middle: 'The', ring: 'Heavy', pinky: 'Bass' },
      Right: { index: 'Feel', middle: 'The', ring: 'Rhythm', pinky: 'Now' },
    },
    wordsZh: {
      Left: { index: '释放', middle: '律动', ring: '强劲', pinky: '低音' },
      Right: { index: '感受', middle: '节拍', ring: '随心', pinky: '摇摆' },
    },
  },
  {
    id: 'affection_love',
    nameEn: '💖 Love & Deep Appreciation',
    nameZh: '💖 爱意表达与真挚感激',
    category: 'Romance',
    wordsEn: {
      Left: { index: 'Thank', middle: 'You', ring: 'So', pinky: 'Much' },
      Right: { index: 'Always', middle: 'Here', ring: 'For', pinky: 'You' },
    },
    wordsZh: {
      Left: { index: '非常', middle: '感谢', ring: '你的', pinky: '陪伴' },
      Right: { index: '永远', middle: '在此', ring: '为你', pinky: '守护' },
    },
  },
];

export const SONG_TUTORIALS: SongTutorial[] = [
  {
    id: 'twinkle',
    titleEn: 'Twinkle Twinkle Little Star',
    titleZh: '小星星 (双手版)',
    artist: 'Traditional Melody',
    difficulty: 'Easy',
    descriptionEn: 'The timeless classic — play melody with Left and Right hand coordination.',
    descriptionZh: '永恒童年经典旋律，练习左右手指尖灵敏交替与节奏感。',
    notes: [
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Right', finger: 'middle', note: 'A4' },
      { hand: 'Right', finger: 'middle', note: 'A4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Left', finger: 'pinky', note: 'F4' },
      { hand: 'Left', finger: 'pinky', note: 'F4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
    ],
  },
  {
    id: 'birthday_song',
    titleEn: 'Happy Birthday to You',
    titleZh: '生日快乐歌 (双手双音阶)',
    artist: 'Celebration Classic',
    difficulty: 'Easy',
    descriptionEn: 'Play the birthday celebration anthem with Left and Right hands to send sweet blessings!',
    descriptionZh: '双手弹奏生日快乐主旋律，为好友奉上专属互动乐声！',
    notes: [
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'pinky', note: 'F4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Left', finger: 'pinky', note: 'F4' },
    ],
  },
  {
    id: 'ditto_hook',
    titleEn: 'Y2K Dreamy Intro Hook',
    titleZh: '千禧年代梦幻前奏',
    artist: 'Y2K Pop',
    difficulty: 'Fun',
    descriptionEn: 'Dreamy Y2K millennium pop intro played across Left and Right hands.',
    descriptionZh: '千禧梦幻复古前奏旋律，左右手交织弹奏清脆乐音。',
    notes: [
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Right', finger: 'middle', note: 'A4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
    ],
  },
  {
    id: 'super_shy',
    titleEn: 'Upbeat Chorus Loop',
    titleZh: '副歌欢快律动',
    artist: 'Y2K Pop',
    difficulty: 'Medium',
    descriptionEn: 'Upbeat jersey club style rhythm with bouncy Left & Right finger coordination.',
    descriptionZh: '欢快跳跃的流行节奏，双手配合左右开弓！',
    notes: [
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Right', finger: 'middle', note: 'A4' },
      { hand: 'Right', finger: 'index', note: 'G4' },
      { hand: 'Left', finger: 'ring', note: 'E4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
      { hand: 'Left', finger: 'index', note: 'C4' },
      { hand: 'Left', finger: 'middle', note: 'D4' },
    ],
  },
];

export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: 'none',
    nameZh: '无边框 (纯净全屏)',
    nameEn: 'Clean Fullscreen',
    icon: '✨',
    descriptionZh: '纯净摄像头画面，保留顶部微光水印与底部动态字幕，极简通透',
  },
  {
    id: 'frutiger_aero',
    nameZh: 'Frutiger Aero (千禧水感)',
    nameEn: 'Frutiger Aero Aqua',
    icon: '🫧',
    descriptionZh: '千禧拟物晶莹水感玻璃视窗，带有高光折射与浮动水珠光泽',
  },
  {
    id: 'y2k_vhs',
    nameZh: 'Y2K DV摄像机 (复古VHS)',
    nameEn: 'Vintage Camcorder VHS',
    icon: '📹',
    descriptionZh: '90年代复古DV录像机取景框，REC红点、电量指示与复古时间戳',
  },
  {
    id: 'polaroid',
    nameZh: '拍立得即时胶片 (经典白边)',
    nameEn: 'Polaroid Classic Film',
    icon: '📷',
    descriptionZh: '经典复古拍立得白边相框与底部手写质感文字',
  },
  {
    id: 'retro_os',
    nameZh: '复古电脑视窗 (Win 98/OS 9)',
    nameEn: 'Retro Desktop 98',
    icon: '💻',
    descriptionZh: '经典千禧操作系统灰调立体浮雕窗口与窗口控件',
  },
  {
    id: 'cyber_matrix',
    nameZh: '赛博霓虹科幻 (Cyber Matrix)',
    nameEn: 'Cyber Neon HUD',
    icon: '⚡',
    descriptionZh: '荧光科幻全息战术瞄准角标与动态网格光效',
  },
];
