import re

with open('src/utils/audioEngine.ts', 'r') as f:
    content = f.read()

# Replace the block
content = re.sub(
    r"      if \(voiceType === 'robot'\) \{[\s\S]*?\} else \{\n        // Natural clear pronunciation for language learning\n        utterance\.pitch = speechPitch;\n        utterance\.rate = speechRate;\n      \}",
    "      utterance.pitch = speechPitch;\n      utterance.rate = speechRate;",
    content
)

with open('src/utils/audioEngine.ts', 'w') as f:
    f.write(content)
