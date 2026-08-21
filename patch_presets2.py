import re

with open('src/utils/presets.ts', 'r') as f:
    content = f.read()

florayeung_preset = """  {
    id: 'florayeung_original',
    nameEn: '✨ florayeung Original (I / mochi / smile / me / you / make / flora / love)',
    nameZh: '✨ florayeung 指尖原版 (8指诗意物语)',
    category: 'Featured',
    wordsEn: {
      Left: { pinky: 'I', ring: 'mochi', middle: 'smile', index: 'me' },
      Right: { index: 'you', middle: 'make', ring: 'flora', pinky: 'love' },
    },
    wordsZh: {
      Left: { pinky: '我', ring: '年糕', middle: '微笑', index: '自己' },
      Right: { index: '你', middle: '创造', ring: '繁花', pinky: '热爱' },
    },
  },"""

# Insert right after WORD_PRESETS = [
content = content.replace("export const WORD_PRESETS: WordPreset[] = [", "export const WORD_PRESETS: WordPreset[] = [\n" + florayeung_preset)

with open('src/utils/presets.ts', 'w') as f:
    f.write(content)
