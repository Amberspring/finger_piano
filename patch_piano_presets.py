import re

with open('src/utils/presets.ts', 'r') as f:
    content = f.read()

# Replace NewJeans preset
content = content.replace("id: 'newjeans_ditto_full',", "id: 'y2k_dream_pop',")
content = content.replace("nameEn: 'NewJeans Ditto & Hype Boy Key',", "nameEn: 'Y2K Dream Pop Hook Key',")
content = content.replace("nameZh: 'NewJeans 千禧梦幻流行键位',", "nameZh: '千禧梦幻流行键位',")

# Also need to check SONG_TUTORIALS for NewJeans
content = content.replace("titleEn: 'Ditto (NewJeans Intro Hook)',", "titleEn: 'Y2K Dreamy Intro Hook',")
content = content.replace("titleZh: 'Ditto (NewJeans 梦幻前奏)',", "titleZh: '千禧年代梦幻前奏',")
content = content.replace("artist: 'NewJeans',", "artist: 'Y2K Pop',")

content = content.replace("titleEn: 'Super Shy (Chorus Loop)',", "titleEn: 'Upbeat Chorus Loop',")
content = content.replace("titleZh: 'Super Shy (副歌欢快律动)',", "titleZh: '副歌欢快律动',")

with open('src/utils/presets.ts', 'w') as f:
    f.write(content)
