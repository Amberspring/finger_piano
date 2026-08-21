import re

with open('src/components/BirthdayCardMode.tsx', 'r') as f:
    content = f.read()

# Replace recipient default
content = content.replace(
    "initialCardData?.recipient || (language === 'zh' ? '小美 (Alice)' : 'Alice')",
    "initialCardData?.recipient || (language === 'zh' ? '鸭鸭' : 'Yaya')"
)

# Replace words default
old_words = """    initialCardData?.words || {
      Left: { index: 'Happy', middle: 'Birthday', ring: 'Wishing', pinky: 'Joy' },
      Right: { index: 'Peace', middle: 'Smiles', ring: 'Health', pinky: 'Forever 💖' },
    }"""
new_words = """    initialCardData?.words || (language === 'zh' ? {
      Left: { index: '祝你', middle: '生日', ring: '快乐', pinky: '心想' },
      Right: { index: '事成', middle: '天天', ring: '开心', pinky: '平安' }
    } : {
      Left: { index: 'Happy', middle: 'Birthday', ring: 'Wishing', pinky: 'Joy' },
      Right: { index: 'Peace', middle: 'Smiles', ring: 'Health', pinky: 'Forever 💖' },
    })"""
content = content.replace(old_words, new_words)

with open('src/components/BirthdayCardMode.tsx', 'w') as f:
    f.write(content)
