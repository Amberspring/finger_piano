import re

with open('src/utils/handTracker.ts', 'r') as f:
    content = f.read()

# Replace AeroKeys with Fingertalk
content = content.replace("AeroKeys", "Fingertalk")

# Subtitle styling: remove pill, update font
old_subtitle_block = r"      // Translucent pill backdrop.*?ctx\.stroke\(\);\n\n      // Glowing subtitle text\n      ctx\.fillStyle = '#38bdf8';\n      ctx\.shadowColor = 'rgba\(56, 189, 248, 0\.8\)';\n      ctx\.shadowBlur = 10;\n      ctx\.fillText\(this\.subtitleText, width / 2, textY\);"
new_subtitle_block = """      // Styled subtitle text without pill
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      
      // Draw strong outline
      ctx.strokeText(this.subtitleText, width / 2, textY);
      
      // Draw text
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(this.subtitleText, width / 2, textY);"""

content = re.sub(old_subtitle_block, new_subtitle_block, content, flags=re.DOTALL)

# Update font for subtitle
content = re.sub(
    r"ctx\.font = 'italic 700 20px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Comic Sans MS\", sans-serif';",
    "ctx.font = 'italic 800 22px \"Comic Sans MS\", Comfortaa, cursive, sans-serif';",
    content
)

with open('src/utils/handTracker.ts', 'w') as f:
    f.write(content)
