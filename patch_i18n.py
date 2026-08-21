import re

with open('src/utils/i18n.ts', 'r') as f:
    content = f.read()

content = re.sub(r"\n    voiceRobot: '.*',\n    voiceCute: '.*',\n    voiceRetro: '.*',", "", content)

with open('src/utils/i18n.ts', 'w') as f:
    f.write(content)
