import re

with open('src/utils/handTracker.ts', 'r') as f:
    content = f.read()

# Pattern to remove the // Add visual ripple in canvas block
pattern = r"          // Add visual ripple in canvas\n          if \(this\.canvasElement\) \{.*?\}\n"

content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/utils/handTracker.ts', 'w') as f:
    f.write(content)
