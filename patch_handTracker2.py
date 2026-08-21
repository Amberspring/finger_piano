import re

with open('src/utils/handTracker.ts', 'r') as f:
    content = f.read()

# 1. Update floating text font size
old_floating_font = "ctx.font = '700 17px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Comic Sans MS\", sans-serif';"
new_floating_font = "ctx.font = '700 21px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Comic Sans MS\", sans-serif';"
content = content.replace(old_floating_font, new_floating_font)

# 2. Update subtitle section
old_subtitle_block = """    if (this.subtitleText) {
      const textY = height - 34;
      ctx.font = 'italic 800 22px "Comic Sans MS", Comfortaa, cursive, sans-serif';
      
      const metrics = ctx.measureText(this.subtitleText);
      const bgWidth = Math.min(width - 32, metrics.width + 40);
      const bgHeight = 40;

      // Translucent pill backdrop
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - bgWidth / 2, textY - 28, bgWidth, bgHeight, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing subtitle text
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(this.subtitleText, width / 2, textY);
    }"""

new_subtitle_block = """    if (this.subtitleText) {
      const maxChars = 22;
      const displaySubtitle = this.subtitleText.length > maxChars 
        ? this.subtitleText.slice(-maxChars) 
        : this.subtitleText;

      const textY = height - 34;
      ctx.font = '900 24px "Noto Serif SC", SimSun, "STZhongsong", serif';
      
      const metrics = ctx.measureText(displaySubtitle);
      const bgWidth = metrics.width + 40;
      const bgHeight = 40;

      ctx.fillStyle = '#66CCCC';
      ctx.fillRect(width / 2 - bgWidth / 2, textY - 28, bgWidth, bgHeight);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillText(displaySubtitle, width / 2, textY);
    }"""

content = content.replace(old_subtitle_block, new_subtitle_block)

with open('src/utils/handTracker.ts', 'w') as f:
    f.write(content)
