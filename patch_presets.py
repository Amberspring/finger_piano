import re

with open('src/utils/presets.ts', 'r') as f:
    content = f.read()

# Replace WORD_PRESETS entirely
new_presets = """export const WORD_PRESETS: WordPreset[] = [
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
];"""

content = re.sub(r"export const WORD_PRESETS: WordPreset\[\] = \[.*?\];", new_presets, content, flags=re.DOTALL)

with open('src/utils/presets.ts', 'w') as f:
    f.write(content)
